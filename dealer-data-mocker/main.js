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
    }, size = 1-2),
    arr2: @array(@int),
    list: @array(@dealer[cityId === $query.cityId], size = 5-10)
*/

let jsoin = `{
    consumerId1: "3333" + $dealer.dealerName,
    @dealer[cityId === $query.cityId + 10000],
    @series[seriesId === $this.consumer], 
    consumer: "@int(4500-4700)", 
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
    }, size = 1-2),
    arr2: @array(@int),
    list: @array(@dealer[cityId === "$query.cityId"], size = 5-10)
 
}`
let query = Object.create(null);
query.cityId = 110100;
let propList = compileToAst(jsoin);
resolveValues(propList);
analyseDependency(propList);
propList = sortProperties(propList);
let value = render(propList, null, { query });
console.log(JSON.stringify(value, null, 4));



//TODO
/*
1、值类型为引用不支持（包括依赖解析）
2、引用依赖中，字符串依赖需要处理
3、基础mock类型丰富
4、编译逻辑要优化（遇到逗号为新属性开始）
5、
*
*/

