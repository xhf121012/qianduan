function integer(parameter = {}) {
    parameter.default = parameter.default || "0-999";

    let minMax = parameter.default.split(/[\s]*\-[\s]*/);
    this.min = parseInt(minMax[0]) || 0;
    this.max = parseInt(minMax[1]) || 999;

    this.invoke = function () {
        let random = Math.random() * (this.max - this.min) + this.min;
        return Math.floor(random);
    }
}

module.exports = integer;