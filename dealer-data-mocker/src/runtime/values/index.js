let series = require("./busi/series.js");
let dealer = require("./busi/dealer.js");
let array = require("./base/array.js");
let int = require("./base/int.js");
let random = require("./base/random.js");
let city = require("./busi/city.js");

const basic = { array, int, random };
const busi = { series, dealer, city };
module.exports = {
    ...basic,
    ...busi
};