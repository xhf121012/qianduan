let valueTypes = require("./values/valueTypes.js");
let { extend } = require("../util/util.js");

module.exports = function renderValue(propList) {
    let value = Object.create(null);
    let context = Object.create(null);
    let constantPropList = propList.filter(prop => prop.value.type === valueTypes.NUMBER || prop.value.type === valueTypes.STRING);
    renderConstant(constantPropList, value, context);
    context.$this = value; // 上下文中，自己的引用
    let mockerPropList = propList.filter(prop => prop.value.type === valueTypes.MOCKER);
    renderMocker(mockerPropList, value, context);
    return value;
}

function renderConstant(propList, value) {
    propList.forEach(prop => {
        value[prop.name] = prop.value.actual;
    });
    return value;
}

function renderMocker(propList, value, ctx) {
    propList.forEach(prop => {
        let mocker = prop.value.actual;
        let mockerInstance = new mocker.mocker(mocker.parameter, mocker.conditionFn);
        let result = mockerInstance.invoke(ctx);
        if (result) {
            if (prop.name) {
                value.name = result;
            } else {
                ctx["$" + mocker.name] = result;
                extend(result, value);
            }
        }
    });
    return value;
}