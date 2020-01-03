let data = [9, 341, 43, 6, 7, 98, 4, 8, 9, 6578, 46, 4, 34, 345, 45];

function insertsort(array) {
    let preIndex, current;
    for(let i = 1; i < array.length; i ++){
        current = array[i];
        preIndex = i - 1;
        while(array[preIndex] > current && preIndex >= 0){
            array[preIndex + 1] = array[preIndex];
            preIndex --;
        }
        array[preIndex + 1] =current;
    }
    return array;
}

console.log(insertsort(data));