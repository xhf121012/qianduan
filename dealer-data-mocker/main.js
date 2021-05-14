const compileToAst = require("./src/compile/compiler.js");
const { resolveValues, sortProperties, analyseDependency } = require("./src/runtime/resolver.js");
const { render, renderSingle } = require("./src/runtime/executor.js");
const { isArray } = require("./src/util/util.js");

/*
    consumerId1: "3333" + $dealer.dealerName,
    @dealer[cityId === $query.cityId + 10000],
    @series[seriesId === 16], 
    consumer: "@int(4500-4700)", 
    minId: @int(120100-120100),
    uName: {
        complex: {
            banme: @dealer[cityId === $this.minId],
            series: @series[seriesId === $series.seriesId + 4210]
        }
    },
    arr: @array(@series[seriesId % 1000 === 0], size = 2-3),
    arr1: @array({
        @dealer[cityId === $this.minId],
        a: 1
    }, size = 1-2),
    arr2: @array(@int),
    list: @array(@dealer[cityId === $query.cityId], size = 2-3),
    cid: $series.seriesId,
    itemCount: @int(5-10),
    cityList: @array(@dealer[cityId === $query.cityId], size=2)
*/

let template = `{
    username: @dealer[cityId === 110100 + 100000, cityId < parseInt("710100")]
}`;

let query = Object.create(null);
query.cityId = 130100;
let propList = compileToAst(template);
let isSingle = !isArray(propList);
propList = isSingle ? [propList] : propList;
resolveValues(propList);
analyseDependency(propList);
propList = sortProperties(propList);
let options =  { query };
let value = isSingle ? renderSingle(propList[0], options) : render(propList, null, options);

console.log(JSON.stringify(value, null, 4));
