let { parseRange, rangeRandom } = require("../../../util/valueUtil.js");

function integer(parameter = {}) {
    parameter.default = parameter.default || "0-999";
    let range = parseRange(parameter.default);
    this.min = range.min;
    this.max = range.max;

    this.invoke = function () {
        return rangeRandom(this.min, this.max, true);
    }
}

module.exports = integer;