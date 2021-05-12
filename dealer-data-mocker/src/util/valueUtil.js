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

module.exports.randomItem = function (list, itemCount) {
    if (!(list && list.length)) {
        return undefined;
    }

    if (!itemCount) {
        return list[Math.floor(Math.random() * list.length)];
    }

    if (list.length <= itemCount) {
        return list;
    }

    list = list.sort(item => Math.round(Math.random() * 10 - 5));
    return list.slice(0, itemCount);
}

module.exports.parseRange = function (range, defaultStart = 0, defaultEnd = 999) {
    let minMax = range.split(/[\s]*\-[\s]*/);
    let min, max;
    if (minMax.length === 2) {
        min = parseInt(minMax[0]);
        max = parseInt(minMax[1]);
    } else if (minMax.length === 1) {
        min = max = parseInt(minMax[0])
    } else {
        min = defaultStart;
        max = defaultEnd;
    }

    return {
        min, max
    };
}

module.exports.rangeRandom = function (min, max, isInteger) {
    let random = Math.random() * (max - min) + min;
    return isInteger ? Math.floor(random) : random;
}

module.exports.repeat = function (count) {
    let arr = [];
    while (count--) {
        arr.push(null);
    }
    return arr;
}