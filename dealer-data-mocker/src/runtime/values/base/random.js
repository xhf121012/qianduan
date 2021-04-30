module.exports = function (parameter) {
    this.max = parameter.max || 99999;
    this.min = parameter.min || 0;
    this.isInteger = (parameter.default || "int") === "int";
    this.invoke = function () {
        let random = Math.random() * (this.max - this.min) + this.min;
        return isInteger ? Math.floor(random) : random;
    }
}