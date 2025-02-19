let { moveNext, matchBrace, pushProperty } = require("../util/parserUtil.js");
let { extend, trimAll, trimStart } = require("../util/util.js");

function compileToAst(template) {
    template = template.trim();
    if (!template) {
        throw new Error("empty template!!");
    }
    let single = template.charAt(0) !== "{" || template.charAt(template.length - 1) !== "}"
    let objContent = single ? template : trimAll(template, "{", "}").trim();
    let props = parseObj(objContent);
    props = normalizeParameter(props);
    props = normalizeCondition(props);
    return single ? props[0] : props;
}

function parseObj(template) {
    let content = "";
    let remain = template;
    let prop = Object.create(null);
    let propList = [];
    let valueList = [];

    while (remain) {
        let currentChar = remain.substr(0, 1);
        if (currentChar === ",") {
            valueList.push(content);
            pushProperty(propList, prop, valueList);
            prop = Object.create(null);
            remain = moveNext(remain);
            content = "";

        } else if (currentChar === ':') {
            prop.name = content;
            remain = moveNext(remain);
            content = "";

        } else if (currentChar === '"' || currentChar === "'") {
            let result = matchBrace(remain, currentChar, currentChar);
            content && valueList.push(content);
            valueList.push(result);
            remain = trimStart(remain, result);
            content = "";

        } else if (currentChar === "[") {
            let braceResult = matchBrace(remain, "[", "]");
            remain = trimStart(remain, braceResult);
            prop.condition = braceResult;
            valueList.push(content);
            content = "";

        } else if (currentChar === "(") {
            let braceResult = matchBrace(remain, "(", ")");
            remain = trimStart(remain, braceResult);
            prop.parameter = braceResult;
            valueList.push(content);
            content = "";

        } else if (currentChar === "{") {
            let braceResult = matchBrace(remain, "{", "}");
            remain = trimStart(remain, braceResult);
            prop.value = compileToAst(braceResult);
            content = "";

        } else {
            content += currentChar;
            remain = moveNext(remain);
        }
    }
    //如果是最后一个
    valueList.push(content);
    pushProperty(propList, prop, valueList);
    return propList;
}

function parseTemplate(param) {
    let paramList = [];
    let tempList = [];
    let content = "";
    while (param) {
        let currentChar = param.substr(0, 1);
        if (currentChar === ",") {
            tempList.push(content)
            let parameter = tempList.join("");
            parameter && paramList.push(parameter);
            tempList.splice(0);
            param = moveNext(param);
            content = "";

        } else if (currentChar === '"' || currentChar === "'") {
            let result = matchBrace(param, currentChar, currentChar);
            tempList.push(content);
            tempList.push(result);
            param = trimStart(param, result);
            content = "";

        } else if (currentChar === "(" || currentChar === "[") {
            let endChar = currentChar === "(" ? ")" : "]";
            let result = matchBrace(param, currentChar, endChar);
            tempList.push(content);
            tempList.push(result);
            param = trimStart(param, result);
            content = "";

        } else {
            content += currentChar;
            param = moveNext(param, true);
        }
    }

    tempList.push(content)
    let parameter = tempList.join("");
    parameter && paramList.push(parameter);
    return paramList;
}

function normalizeParameter(propList) {
    let processString = function (param, isFirstDefault) {
        let paramList = parseTemplate(param);
        let parameterObject = Object.create(null);
        if (!paramList.length) {
            return parameterObject;
        }

        if (isFirstDefault) {
            parameterObject.default = paramList[0];
            paramList = paramList.slice(1);
        }

        paramList.forEach(function (kv) {
            let kvSet = kv.split(/[\s]*\=[\s]*/);
            if (kvSet.length === 0) {
                return;
            }

            if (kvSet.length !== 2) {
                throw new Error("parameter parse error：" + kv);
            }

            if (kvSet[0] === "default") {
                throw new Error("parameter name can not be default");
            }
            parameterObject[kvSet[0]] = kvSet[1];
        });
        return parameterObject;
    }

    propList.forEach(function (prop) {
        if (!prop.parameter) {
            return;
        }
        prop.parameters = Object.create(null);
        let parameterString = trimAll(prop.parameter, "(", ")").trim();
        if (parameterString.indexOf("{") === 0) {
            let defaultString = matchBrace(parameterString, "{", "}");
            let mockerParam = compileToAst(defaultString);
            normalizeParameter(mockerParam);
            normalizeCondition(mockerParam);
            prop.parameters.default = mockerParam;
            parameterString = trimStart(parameterString, defaultString);
        }

        if (parameterString.indexOf("@") === 0) {
            let params = parseObj(parameterString);
            let defaultParam = [params[0]];
            normalizeParameter(defaultParam);
            normalizeCondition(defaultParam);
            prop.parameters.default = defaultParam[0]; //单个类型。与 { onlyOne: "value" } 区分开
            parameterString = params.slice(1).map(a => a.value).join(",")
        }

        //默认参数是否已经处理过了
        let others = processString(parameterString, !prop.parameters.default);
        extend(others, prop.parameters)
        delete prop.parameter;
    });
    return propList;
}

function normalizeCondition(propList) {
    propList.forEach(function (prop) {
        if (prop.condition) {
            let conditionString = trimAll(prop.condition, "[", "]");
            prop.conditions = parseTemplate(conditionString);
            delete prop.condition;
        }
    });
    return propList;
}

module.exports = compileToAst;