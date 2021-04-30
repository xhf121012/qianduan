let { isMocker, isNumber, isString, constantValue } = require("./valueUtil.js");
let mockers = require("./values/index.js");
let valueTypes = require("./values/valueTypes.js");
let { isObject, isArray } = require("../util/util.js");

function resolveValues(propList) {
    propList.forEach(resolveValue);
    return propList;
}

function resolveValue(prop) {
    let val = Object.create(null);
    if (isNumber(prop.value)) {
        val.type = valueTypes.NUMBER;
        val.actual = constantValue(prop.value)
    } else if (isString(prop.value)) {
        val.type = valueTypes.STRING;
        val.actual = constantValue(prop.value)
    } else if (isMocker(prop.value)) {
        val.type = valueTypes.MOCKER;
        val.actual = findMocker(prop);
    } else {
        throw new Error("unknown value type: " + prop.value);
    }
    prop.value = val;
    return prop;
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

    delete prop.conditions;
    delete prop.parameters;
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

module.exports = resolveValues;