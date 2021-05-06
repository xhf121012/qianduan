let compileToAst = require("./src/compile/compiler.js");
let resolveValues = require("./src/runtime/resolver.js");
let renderValue = require("./src/runtime/executor.js");


// let jsoin = `{
//     @series[seriesId > 5000], 
//     consumer: "zhangsan",
//     userName2: @array("zhansan"),
//     userName3: "[20,21]",
//     sid: $series.seriesId,
//     ag: 0.36,
//     specList: @array({
//         name: "海峰",
//         age: 100
//     }, size = 5-10),
//     specList2: @array(@series[seriesId === $series.seriesId, 1 == 1](7788997), size = 5-10),
//     userlist: @array(100)
// }`

let jsoin = `{
    @series[seriesId < $this.minId, seriesName === '标致208'], 
    @dealer[cityId === 110100](6776, prom = jeee),
    consumer: "[zhangsan]",
    minId: 5000
}`

let propList = compileToAst(jsoin);
resolveValues(propList);
let value = renderValue(propList, {
    
});
console.log(JSON.stringify(value, null, 4));


