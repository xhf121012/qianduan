let valueTypes = require("./values/valueTypes.js");
let { extend } = require("../util/util.js");
let { repeat } = require("../runtime/valueUtil.js");

function render(propList, rootCtx) {
    let value = Object.create(null);
    let context;
    if (rootCtx) {
        context = rootCtx;
    } else {
        context = Object.create(null);
        context.$this = value; // 上下文中，自己的引用
        context.$query = Object.create(null);
    }

    propList.forEach(prop => {
        if (prop.value.type === valueTypes.NUMBER || prop.value.type === valueTypes.STRING) {
            renderConstant(prop, value, context);
        } else if (prop.value.type === valueTypes.MOCKER) {
            renderMocker(prop, value, context);
        } else if (prop.value.type === valueTypes.MOCKER_OBJECT) {
            renderObject(prop, value, context);
        } else {
            throw new Error("unknow valueType: " + prop.value.type);
        }
    });

    return value;
}

function renderConstant(prop, value) {
    value[prop.name] = prop.value.actual;
    return value;
}

function renderMocker(prop, value, ctx) {
    let mocker = prop.value.actual;
    let mockerInstance = new mocker.mocker(mocker.parameter, mocker.conditionFn);
    let result = mockerInstance.invoke(ctx) || Object.create(null);
    if (prop.name) {
        value[prop.name] = result;
    } else {
        ctx["$" + mocker.name] = result;
        extend(result, value);
    }
    return value;
}

function renderObject(prop, value, ctx) {
    value[prop.name] = render(prop.value.actual, ctx);
    return value;
}


module.exports.render = render;
module.exports.renderArrayItem = function (prop, ctx, multi) {
    let mocker = prop.value.actual;
    let mockerInstance = new mocker.mocker(mocker.parameter, mocker.conditionFn);
    if (multi && mocker.mocker.__supportMulti) {
        mockerInstance.itemCount = multi;
        return mockerInstance.invoke(ctx);
    } else {
        return repeat(multi).map(i => mockerInstance.invoke(ctx));
    }
};