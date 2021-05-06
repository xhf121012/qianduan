let valueTypes = require("./values/valueTypes.js");
let { extend, isObject } = require("../util/util.js");

function renderValue(propList, ctx) {
    propList = reorderPropList(propList);

    let value = Object.create(null);
    let context = ctx || Object.create(null);

    context.$this = value; // 上下文中，自己的引用
    let constantPropList = propList.filter(prop => prop.value.type === valueTypes.NUMBER || prop.value.type === valueTypes.STRING);
    renderConstant(constantPropList, value, context);
    let mockerPropList = propList.filter(prop => prop.value.type === valueTypes.MOCKER);
    renderMocker(mockerPropList, value, context);

    let objectPropList = propList.filter(prop => prop.value.type === valueTypes.MOCKER_OBJECT);
    renderObject(objectPropList, value, context);
    return value;
}


function reorderPropList(propList) {

    return propList.sort(function (a, b) {
        let first = a.value;
        let second = b.value;
        if (first.type !== second.type) {
            return first.type - second.type;
        }

        if (first.type === valueTypes.NUMBER || first.type === valueTypes.STRING) {
            return 0;
        }
    });
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
        if (result !== undefined) {
            if (prop.name) {
                value[prop.name] = result;
            } else {
                ctx["$" + mocker.name] = result;
                extend(result, value);
            }
        }
    });
    return value;
}

function renderObject(propList, value, ctx) {
    propList.forEach(prop => {
        value[prop.name] = renderValue(prop.value.actual, ctx);
    });
    return value;
}

module.exports = renderValue;