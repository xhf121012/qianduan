let { moveNext, matchValue, matchValueAndMove, matchBrace, pushProperty } = require("../util/parserUtil.js");
let { extend, trimAll, trimStart } = require("../util/util.js");
const PROCESSING = {
    KEY: 1,
    VALUE: 2
};

function compileToAst(template) {
    template = template.trim();
    if (!template
        || template.charAt(0) !== "{"
        || template.charAt(template.length - 1) !== "}") {
        throw new Error("input must start with '{' and end with '}'");
    }
    let objContent = trimAll(template, "{", "}").trim();
    if (!objContent) {
        return [];
    }
    let props = parseObj(objContent);
    props = normalizeParameter(props);
    return normalizeCondition(props);
}

function parseObj(template) {
    let content = "";
    let remain = template;
    let prop = Object.create(null);
    let propList = [];

    while (remain) {
        let currentChar = remain.substr(0, 1);
        if (currentChar === ",") {
            if (content) { //保证 value 是expression时，不丢东西
                prop.value += content;
            }

            pushProperty(propList, prop, content);
            prop = Object.create(null);
            remain = moveNext(remain);
            content = "";

        } else if (currentChar === ':') {
            prop.name = content;
            remain = moveNext(remain);
            content = "";

        } else if (currentChar === '"' || currentChar === "'") {
            let result = matchBrace(remain, currentChar, currentChar);
            prop.value = content + result; //保证 value 是expression时，不丢东西
            remain = trimStart(remain, result);
            content = "";

        } else if (currentChar === "[") {
            let braceResult = matchBrace(remain, "[", "]");
            remain = trimStart(remain, braceResult);
            prop.condition = braceResult;
            prop.value = content;
            content = "";

        } else if (currentChar === "(") {
            let braceResult = matchBrace(remain, "(", ")");
            remain = trimStart(remain, braceResult);
            prop.parameter = braceResult;
            prop.value = prop.value || content;
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
    pushProperty(propList, prop, content);
    return propList;
}

function normalizeParameter(propList) {
    let processString = function (param, isFirstDefault) {
        let paramListStr = param.split(/[\s]*,[\s]*/);
        let parameterObject = Object.create(null);
        if (!paramListStr.length) {
            return paramObj;
        }

        if (isFirstDefault) {
            parameterObject.default = paramListStr[0];
            paramListStr = paramListStr.slice(1);
        }

        paramListStr.filter(kv => !!kv).forEach(function (kv) {
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
    let parseCondition = function (str) {
        let condtionList = [];
        let content = "";
        while (str) {
            let currentChar = str.substr(0, 1);
            if (currentChar === ",") {
                content && condtionList.push(content.trim());
                content = "";
                str = moveNext(str);
            } else if (currentChar === '"') {
                let result = matchValueAndMove(str, /("[\s\S]*?")/);
                condtionList.push(content + result.value);
                str = result.remain;
                content = "";

            } else if (currentChar === "'") {
                let result = matchValueAndMove(str, /('[\s\S]*?')/);
                condtionList.push(content + result.value);
                str = result.remain;
                content = "";

            } else {
                content += currentChar;
                str = moveNext(str, true);
            }
        }
        content && condtionList.push(content);
        return condtionList;
    }

    propList.forEach(function (prop) {
        if (prop.condition) {
            let conditionString = matchValue(prop.condition, /\[[\s]*([\S\s]+)[\s]*\]/);
            prop.conditions = parseCondition(conditionString);
            delete prop.condition;
        }
    });
    return propList;
}

module.exports = compileToAst;