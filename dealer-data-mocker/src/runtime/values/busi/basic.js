let { YES_FN } = require("../../../util/const.js");
let { extend } = require("../../../util/util.js");
let { randomItem } = require("../../valueUtil.js");

module.exports = function (parameter, conditionFn) {
    this.parameter = parameter;
    this.conditionFn = conditionFn || YES_FN;

    this.invoke = function (ctx) {
        let filteredList = this.dataList.filter(item => {
            let newItem = { ...item };
            extend(ctx, newItem);
            return this.conditionFn.call(null, newItem);
        });
        if (filteredList && filteredList.length) {
            return randomItem(filteredList);
        }
        return undefined;
    }
}