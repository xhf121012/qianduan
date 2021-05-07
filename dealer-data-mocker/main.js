let compileToAst = require("./src/compile/compiler.js");
let { resolveValues, sortProperties, analyseDependency } = require("./src/runtime/resolver.js");
let { render } = require("./src/runtime/executor.js");


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
/*
 
    @dealer[dealerId === $this.minId, cityId === 110100, a === $query.userName](6776, prom = jeee),
    @series[seriesId === $this.consumer], 
    consumer:  "[ zhtyutya567456 {etyert }ngsan  ]", 
    minId: @int(4500-4600),
    specList2: @array( @series[seriesId === $series.seriesId, 1 == 1](7788997), size = 5-10),
    specList: @array  (  {
        name: "海峰",
        age: 100
    }, size = 5-10 ),
   empty: @array({}),
   uName: {
       name: 1,
       value: @int(1 - 100),
       complex: {
           value: 11,
           banme: @dealer[dealerName === $series.seriesId, cityId === $this.minId]
       }
   }
*/
let jsoin = `{ 
    @series[seriesId === $this.consumer], 
    consumer: @int(4500-4700), 
    minId: @int(120100-120100),
    uName: {
        complex: {
            banme: @dealer[cityId === $this.minId],
            series: @series[seriesId === $series.seriesId + 10]
       }
   },
   arr: @array(@series[seriesId % 1000 === 0], size = 2-3),
   arr1: @array({
       @dealer[cityId === $this.minId],
       a: 1
   }, size = 1-2)
}`

let propList = compileToAst(jsoin);
resolveValues(propList);
analyseDependency(propList);
propList = sortProperties(propList);
let value = render(propList);
console.log(JSON.stringify(value, null, 4));


