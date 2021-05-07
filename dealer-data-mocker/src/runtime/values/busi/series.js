let basic = require("./basic.js");
let seriesList = require("../../../sample/seriesdata.json");

function series(parameter, conditionFn) {
    basic.call(this, parameter, conditionFn);
    this.dataList = seriesList;
}
series.__supportMulti = true;
module.exports = series;