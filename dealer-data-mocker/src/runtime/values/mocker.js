function Mocker(name, parameter, conditionFn) {
    this.parameter = parameter;
    this.name = name;
    this.conditionFn = conditionFn;
}

Mocker.prototype.invoke = function (context) {
    throw new Error("not implemented mocker: " + this.name);
}

module.exports = Mocker;