let basic = require("./basic.js");
let cityList = require("../../../sample-data/citys.json");

function city(parameter, ctx, conditionFn) {
    basic.call(this, parameter, ctx, conditionFn);
    this.dataList = cityList;
}
city.__supportMulti = true;
module.exports = city;