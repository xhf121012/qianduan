module.exports.extend = function (source, target) {
    for (const key in source) {
        if (Object.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
        }
    }
    return target;
}

module.exports.matchValue = function (template, regex) {
    return template.match(regex)[1];
};

module.exports.isObject = function (value) {
    return typeof value === "object" && Object.prototype.toString.call(value).slice(8, -1) === "Object";
}

module.exports.isArray = function (value) {
    return Array.isArray(value);
}

function trimStart(input, char) {
    if (input.indexOf(char) === 0) {
        return input.substr(char.length);
    }
    return input;
}

function trimEnd(input, char) {
    if (input.lastIndexOf(char) === input.length - char.length) {
        return input.substring(0, input.length - char.length)
    }
    return input;
}

module.exports.trimStart = trimStart;
module.exports.trimEnd = trimEnd;
module.exports.trimAll = function (input, start, end) {
    input = trimStart(input, start);
    input = trimEnd(input, end);
    return input;
}