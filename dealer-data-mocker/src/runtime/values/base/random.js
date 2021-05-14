const { randomItem } = require("../../../util/valueUtil.js");

function random(parameter = {}, ctx) {
    if (!parameter.default) {
        throw new Error("random need a array as items");
    }
    this.itemList = new Function(`with(arguments[0]){ return ${parameter.default}; }`).call(null, ctx);

    this.invoke = function () {
        return randomItem(this.itemList);
    }
}

module.exports = random;