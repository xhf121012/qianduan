let basic = require("./basic.js");
let seriesList = require("../../../sample/seriesdata.json");

function series(parameter, ctx, conditionFn) {
    basic.call(this, parameter, ctx, conditionFn);
    this.dataList = seriesList;
}
series.__supportMulti = true;
module.exports = series;