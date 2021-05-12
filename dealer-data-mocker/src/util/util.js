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

function isObject(value) {
    return typeof value === "object" && Object.prototype.toString.call(value).slice(8, -1) === "Object";
}

function isArray(value) {
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

function replaceProperty(target, source) {
    if (!(isObject(target) && isObject(source))) {
        return target
    }

    for (const key in target) { //遍历target的属性，有的话，覆盖
        if (Object.hasOwnProperty.call(source, key)) {
            let targetValue = target[key];
            let sourceValue = source[key];
            if (isObject(targetValue) && isObject(sourceValue)) {
                replaceProperty(targetValue, sourceValue);
            } else if (isArray(targetValue) && isArray(sourceValue)) {
                let length = Math.min(targetValue.length, sourceValue.length);
                for (let i = 0; i < length; i++) {
                    let targetItem = targetValue[i];
                    let sourceItem = sourceValue[i];
                    replaceProperty(targetItem, sourceItem);
                }
            } else {
                target[key] = sourceValue;
            }
        }
    }
    return target;
}

module.exports.replaceProperty = replaceProperty;
module.exports.isObject = isObject;
module.exports.isArray = isArray;