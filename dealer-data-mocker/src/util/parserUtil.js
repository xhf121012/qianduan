let { matchValue } = require("../util/util.js");

module.exports.moveNext = function (template, noTrim) {
    template = template.substr(1);
    return noTrim ? template : template.trim();
};

module.exports.matchValueAndMove = function (template, regex, noTrim) {
    let value = matchValue(template, regex);
    let remain = template.replace(regex, "");
    return {
        value,
        remain: noTrim ? remain : remain.trim()
    };
};

//匹配括号，引号等
module.exports.matchBrace = function (template, start, end) {
    let braceCount = 0;
    let content = "";
    let startEqualEnd = start === end;

    while (template) {
        let currentChar = template.substr(0, 1);
        if (currentChar === start) {
            braceCount += 1;
            if (startEqualEnd &&  braceCount % 2 === 0) {
                content += currentChar;
                return content;
            }
        } else if (currentChar === end) {
            braceCount -= 1;
            if (braceCount === 0) {
                content += currentChar;
                return content;
            }
        }
        template = template.substr(1);;
        content += currentChar;
    }

    return content;
};

module.exports.pushProperty = function (list, prop, content) {
    prop.value = prop.value || content;
    list.push(prop);
};

module.exports.matchValue = matchValue;