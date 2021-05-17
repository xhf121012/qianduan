let valueTypes = require("./values/valueTypes.js");
let { extend } = require("../util/util.js");
let { repeat } = require("../util/valueUtil.js");

function createCtx(opts, value) {
    let context = Object.create(null);
    context.$this = value;
    context.$query = opts.query || Object.create(null);
    return context;
}

function render(propList, rootCtx, opts = {}) {
    let value = Object.create(null);
    let context = rootCtx ? rootCtx : createCtx(opts, value);

    propList.filter(prop => prop.value.type !== valueTypes.EXPRESSION_SELF).forEach(prop => {
        let result = renderProperty(prop, context);
        if (prop.name) {
            value[prop.name] = result;
        } else {
            extend(result, value);
        }
    });
    propList.filter(prop => prop.value.type === valueTypes.EXPRESSION_SELF).forEach(prop => {
        let propertyValue = prop.value.actual.call(null, { $: value });
        if (prop.name) {
            value[prop.name] = propertyValue;
        }
    });
    return value;
}

function renderProperty(prop, context) {
    if (prop.value.type === valueTypes.NUMBER || prop.value.type === valueTypes.STRING) {
        return renderConstant(prop, context);
    } else if (prop.value.type === valueTypes.MOCKER) {
        let result = renderMocker(prop, context);
        if (!prop.name) {
            context["$" + prop.value.actual.name] = result || Object.create(null);
        }
        return result;
    } else if (prop.value.type === valueTypes.MOCKER_OBJECT) {
        return renderObject(prop, context);
    } else if (prop.value.type === valueTypes.EXPRESSION) {
        return renderExpression(prop, context);
    } else {
        throw new Error("unknow valueType: " + prop.value.type);
    }
}

function renderConstant(prop) {
    return prop.value.actual;
}

function renderMocker(prop, ctx) {
    let mocker = prop.value.actual;
    let mockerInstance = new mocker.mocker(mocker.parameter, ctx, mocker.conditionFn);
    return mockerInstance.invoke(ctx)
}

function renderObject(prop, ctx) {
    return render(prop.value.actual, ctx);
}

function renderExpression(prop, ctx) {
    return prop.value.actual.call(null, ctx);
}


module.exports.render = render;

module.exports.renderArrayItem = function (prop, ctx, multi) {
    let mocker = prop.value.actual;
    let mockerInstance = new mocker.mocker(mocker.parameter, ctx, mocker.conditionFn);
    if (multi && mocker.mocker.__supportMulti) {
        mockerInstance.__multi = multi;
        return mockerInstance.invoke(ctx) || [];
    } else {
        return repeat(multi).map(i => mockerInstance.invoke(ctx));
    }
};

module.exports.renderSingle = function (prop, opts = {}) {
    let context = createCtx(opts, Object.create(null));
    return renderProperty(prop, context);
}