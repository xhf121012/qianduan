let num = 12346123;

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
console.log(format(num));