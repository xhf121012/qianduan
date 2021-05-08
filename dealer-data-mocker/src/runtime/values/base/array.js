let { parseRange, rangeRandom, repeat } = require("../../../util/valueUtil.js");
let { render, renderArrayItem } = require("../../executor.js");
let { isArray, isObject } = require("../../../util/util.js");


module.exports = function (parameter = {}) {
    let sizeRange = parseRange(parameter.size || "2-5");
    this.minSize = sizeRange.min;
    this.maxSize = sizeRange.max;
    this.actualValue = parameter.default;

    this.invoke = function (ctx) {
        let listLength = rangeRandom(this.minSize, this.maxSize, true);
        return renderValue(this.actualValue, ctx, listLength);
    }
}
function renderValue(actualValue, ctx, count) {
    if (isArray(actualValue)) {
        return repeat(count).map(i => render(actualValue, { ...ctx }));
    } else if (isObject(actualValue)) {
        return renderArrayItem(actualValue.actual, { ...ctx }, count);
    } else {
        return repeat(count).map(i => actualValue);;
    }
}