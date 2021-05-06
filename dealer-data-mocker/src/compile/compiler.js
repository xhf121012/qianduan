let { moveNext, matchValue, matchValueAndMove, matchBrace, pushProperty } = require("./parserUtil.js");
let { extend, isObject } = require("../util/util.js");

function compileToAst(template) {
    template = template.trim();
    if (!template
        || template.charAt(0) !== "{"
        || template.charAt(template.length - 1) !== "}") {
        throw new Error("input must start with '{' and end with '}'");
    }
    let objContent = template.match(/\{([\s\S]*)\}/)[1].trim();
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
            pushProperty(propList, prop, content);
            content = "";
            prop = Object.create(null);
            remain = moveNext(remain);

        } else if (currentChar === ':') {
            prop.name = content;
            content = "";
            remain = moveNext(remain);

        } else if (currentChar === '"' || currentChar === "'") {
            let result = matchBrace(remain, currentChar, currentChar);
            prop.value = result;
            remain = remain.replace(result, "");
            content = "";

        } else if (currentChar === "[") {
            let result = matchValueAndMove(remain, /(\[[\s\S]*?\])/);
            prop.condition = result.value;
            prop.value = content;
            remain = result.remain;
            content = "";

        } else if (currentChar === "(") {
            let regex = /^\([\s]*?(?:\{)/; // 参数是 ({ 的形式
            if (regex.test(remain)) {
                remain = remain.replace(regex, "{");
                let braceResult = matchBrace(remain, "{", "}");
                remain = remain.replace(braceResult, "");
                let result = matchValueAndMove(remain, /([\s\S]*?\))/);
                let others;
                // 空参数
                if (!/^[\s]*\)$/.test(result.value)) {
                    others = "(" + result.value.replace(/^[\s\S]*,/, "");
                }
                prop.parameter = {
                    complex: braceResult,
                    others: others
                };
                remain = result.remain;
            } else {
                let braceResult = matchBrace(remain, "(", ")");
                remain = remain.replace(braceResult, "");
                prop.parameter = braceResult;
            }
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

        if (paramListStr.length > 0) { //处理其他参数
            paramListStr.map(function (kv) {
                let kvSet = kv.split(/[\s]*\=[\s]*/);
                if (kvSet.length !== 2) {
                    throw new Error("parameter parse error：" + kv);
                }

                if (kvSet[0] === "default") {
                    throw new Error("parameter name can not be default");
                }
                parameterObject[kvSet[0]] = kvSet[1];
            });
        }
        return parameterObject;
    }

    let processObject = function (param) {
        let parameterObject = Object.create(null);
        let child = compileToAst(param.complex);
        parameterObject.default = child;
        if (param.others) {
            let other = processString(matchValue(param.others, /^\([\s]*([\s\S]+)[\s]*\)$/));
            extend(other, parameterObject);
        }
        return parameterObject;
    }

    propList.forEach(function (prop) {
        if (!prop.parameter) {
            return;
        }

        if (typeof prop.parameter === "string") {
            let param = matchValue(prop.parameter, /\([\s]*(.+)[\s]*\)/);
            prop.parameters = processString(param, true);
        }

        if (isObject(prop.parameter)) {
            prop.parameters = processObject(prop.parameter);
        }

        if (prop.parameters.default && prop.parameters.default.indexOf("@") === 0) { //默认参数是个mocker对象
            let mockerParam = parseObj(prop.parameters.default);
            normalizeParameter(mockerParam);
            normalizeCondition(mockerParam);
            prop.parameters.default = mockerParam[0] || prop.parameters.default;
        }
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