let basic = require("./basic.js");
let dealerList = require("../../../sample/dealerdata.json");

function dealer(parameter, ctx, conditionFn) {
    basic.call(this, parameter, ctx, conditionFn);
    this.dataList = dealerList;
}
dealer.__supportMulti = true;
module.exports = dealer;

