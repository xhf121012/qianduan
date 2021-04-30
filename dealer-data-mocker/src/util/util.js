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