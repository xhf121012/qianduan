let num = 1234453256123;

function format(num) {
    if (typeof num !== "number") {
        return num;
    }
    
    let str = num.toString();
    let mod = str.length % 3

    for (let i = 0; i < 3 - mod; i++) {
        str = "0" + str;
    }

    str = str.match(/\d{3}/g).join(",");
    return str.replace(/^0+/, "");
}

function format1(num) {
    if (typeof num !== "number") {
        return num;
    }

    let str = num.toString();
    let array = [];
    let mod = str.length % 3;
    array.push(str.substr(0, mod));
    str.substr(0, mod);

    for (let i = mod; i < str.length; i += 3) {
        array.push(str.substr(i, 3));
    }
    return array.join(",");
}
console.log(format1(num));