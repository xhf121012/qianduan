let { STRING_REGEX_D, STRING_REGEX_S, NUMBER_REGEX } = require("../util/const.js");
let { matchValue } = require("../util/util.js");

module.exports.isMocker = function (name) {
    return /^@.+/.test(name);
}

module.exports.isString = function (name) {
    return STRING_REGEX_D.test(name) || STRING_REGEX_S.test(name);
}

module.exports.isNumber = function (name) {
    return NUMBER_REGEX.test(name);
}

module.exports.constantValue = function (value) {
    if (STRING_REGEX_D.test(value)) {
        return matchValue(value, STRING_REGEX_D);
    }
    if (STRING_REGEX_S.test(value)) {
        return matchValue(value, STRING_REGEX_S);
    }
    if (NUMBER_REGEX.test(value)) {
        return parseFloat(value);
    }
    return value;
}

module.exports.randomItem = function (list) {
    if (!(list && list.length)) {
        return undefined;
    }
    return list[Math.floor(Math.random() * list.length)];
}