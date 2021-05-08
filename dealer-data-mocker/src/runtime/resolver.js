let { isMocker, isNumber, isString, constantValue } = require("../util/valueUtil.js");
let mockers = require("./values/index.js");
let valueTypes = require("./values/valueTypes.js");
let { isObject, isArray, trimStart, matchValue } = require("../util/util.js");
let { matchBrace, moveNext } = require("../util/parserUtil.js");

function resolveValues(propList) {
    propList.forEach(resolveValue);
    return propList;
}

function resolveValue(prop) {
    let val = Object.create(null);
    if (isArray(prop.value)) {
        val.type = valueTypes.MOCKER_OBJECT;
        val.actual = resolveValues(prop.value);

    } else if (isNumber(prop.value)) {
        val.type = valueTypes.NUMBER;
        val.actual = constantValue(prop.value);

    } else if (isString(prop.value)) {
        val.type = valueTypes.STRING;
        val.actual = constantValue(prop.value);

    } else if (isMocker(prop.value)) {
        val.type = valueTypes.MOCKER;
        val.actual = findMocker(prop);

    } else {
        val.type = valueTypes.EXPRESSION;
        val.actual = new Function(`with(arguments[0]){ return ${prop.value}; }`);
        val.expression = prop.value;
    }
    prop.value = val;
    return prop;
}

function analyseDependencyInner(prop) {
    let dependency = [];
    if (prop.conditions) { //analyse condition
        prop.conditions.forEach(cond => {
            let result = findDependency(cond);
            result.length && Array.prototype.push.apply(dependency, result);
        });
    }

    if (prop.parameters && isObject(prop.parameters.default)) {
        let parameterObject = prop.parameters.default;
        if (parameterObject.type === valueTypes.MOCKER && parameterObject.actual.conditions) {
            Array.prototype.push.apply(dependency, analyseDependencyInner(parameterObject.actual));
        }
    }

    if (prop.value && prop.value.type === valueTypes.MOCKER_OBJECT) {
        if (isArray(prop.value.actual)) {
            prop.value.actual.forEach(child => {
                Array.prototype.push.apply(dependency, analyseDependencyInner(child));
            })
        }
    }

    if (prop.value && prop.value.type === valueTypes.EXPRESSION) {
        Array.prototype.push.apply(dependency, findDependency(prop.value.expression));
    }

    delete prop.parameters;
    delete prop.conditions;
    return dependency;
}

function findMocker(prop) {
    let name = prop.value.substr(1);
    if (!mockers[name]) {
        throw new Error(`mocker: ${name} is not found!`);
    }
    let valueMocker = Object.create(null);
    valueMocker.name = name;
    if (prop.conditions && prop.conditions.length) {
        let conditonStr = `
        with(arguments[0]){ return ${prop.conditions.join("&&")}; }`;
        valueMocker.conditionFn = new Function(conditonStr);
    }
    let parameters = resolveDefaultParameterValue(prop.parameters);
    valueMocker.mocker = mockers[name];
    valueMocker.parameter = parameters;
    return valueMocker;
}

function resolveDefaultParameterValue(parameters) { //解析参数，目前只有数组支持参数是mocker对象
    if (parameters && parameters.default) {
        let val = Object.create(null);
        if (isArray(parameters.default)) {
            val.type = valueTypes.MOCKER_OBJECT;
            val.actual = resolveValues(parameters.default);

        } else if (isObject(parameters.default)) {
            val.type = valueTypes.MOCKER;
            val.actual = resolveValue(parameters.default);
            parameters.default = val;
        }
    }
    return parameters;
}

function findDependency(condition) {
    let dependencySet = [];

    while (condition) {
        let currentChar = condition.substr(0, 1);
        if (currentChar === '"' || currentChar === "'") { //去除阔含的影响
            let braceResult = matchBrace(condition, currentChar, currentChar);
            condition = trimStart(condition, braceResult);
        } else if (currentChar === "$") {
            let matchResult = condition.match(/^(\$[a-zA-z1-9]+\.*[a-zA-z1-9]+)/);
            if (matchResult && matchResult.length) {
                let dep = matchResult[1];
                if (dep.indexOf("$query.") === 0) {
                    dependencySet.push("$query");
                } else if (dep.indexOf("$this.") === 0) {
                    dependencySet.push(trimStart(dep, "$this."));
                } else {
                    let wholeDep = matchValue(dep, /(^\$[a-zA-z1-9]+)\.*/);
                    if (wholeDep === "$this") {
                        throw new Error("'$this' can not be depended")
                    }
                    dependencySet.push(wholeDep);
                }
                condition = trimStart(condition, dep);
            }
        } else {
            condition = moveNext(condition);
        }
    }
    return dependencySet;
}


module.exports.resolveValues = resolveValues;

module.exports.sortProperties = function (propList) {
    let orderedProperties = ["$query"];
    let resultList = [];
    let getPropName = prop => prop.name || ("$" + prop.value.actual.name);
    while (propList.length) {
        propList.forEach(prop => {
            if (!prop.dependency) { //没有依赖，直接加入
                orderedProperties.push(getPropName(prop));
                resultList.push(prop);
            }
            if (prop.dependency && !prop.dependency.some(dep => orderedProperties.indexOf(dep) === -1)) { //依赖都已经渲染了，加入
                orderedProperties.push(getPropName(prop));
                resultList.push(prop);
            }
        });
        let newPropList = propList.filter(prop => orderedProperties.indexOf(getPropName(prop)) === -1);

        if (newPropList.length === propList.length) {
            throw new Error(`exists cyclic dependency property: "${newPropList[0].dependency}"`);
        }
        propList = newPropList;
    }

    return resultList;
}

module.exports.analyseDependency = function (propList) {
    propList.forEach(prop => {
        let dependency = analyseDependencyInner(prop);
        prop.dependency = dependency.length ? [...new Set(dependency)] : null;
    });
}