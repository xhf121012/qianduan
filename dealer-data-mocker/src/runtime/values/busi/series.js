let { YES_FN } = require("../../../util/const.js");
let { extend } = require("../../../util/util.js");
let seriesList = require("../../../sample/seriesdata.json");
let { randomItem } = require("../../valueUtil.js");

module.exports = function (parameter, conditionFn) {
    this.parameter = parameter;
    this.conditionFn = conditionFn || YES_FN;
    this.seriesList = seriesList;
    this.invoke = function (ctx, actual) {
        let filteredSeriesList = this.seriesList.filter(series => {
            let newSeries = { ...series };
            extend(ctx, newSeries);
            return this.conditionFn.call(null, newSeries);
        });
        if (filteredSeriesList && filteredSeriesList.length) {
            return ctx["$" + actual.name] = randomItem(filteredSeriesList);
        }
        return undefined;
    }
}

