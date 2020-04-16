let data = [9, 341, 43, 6, 7, 98, 4, 8, 9, 6578, 46, 4, 34, 345, 45];

function selectsort(array) {
    let minIndex;
    for (let i = 0; i < array.length; i++) {
        minIndex = i; 
        for (let j = i; j < array.length; j++) {
            if(array[j] < array[minIndex]){
                minIndex = j
            }
        }
        let temp = array[i];
        array[i] = array[minIndex];
        array[minIndex] = temp;
    }
    return array;
}

console.log(data);
console.log(selectsort(data));