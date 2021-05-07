let basic = require("./basic.js");
let dealerList = require("../../../sample/dealerdata.json");

function dealer(parameter, conditionFn) {
    basic.call(this, parameter, conditionFn);
    this.dataList = dealerList;
}
dealer.__supportMulti = true;
module.exports = dealer;

