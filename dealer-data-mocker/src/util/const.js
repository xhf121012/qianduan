module.exports.EMPTY = Object.freeze(Object.create(null));

module.exports.STRING_REGEX_D = /^"([\s\S]*)"$/;

module.exports.STRING_REGEX_S = /^'([\s\S]*)'$/;

module.exports.NUMBER_REGEX = /^\d+\.*\d*$/;

module.exports.YES_FN = arg => true;