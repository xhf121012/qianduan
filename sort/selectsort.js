let data = [9, 341, 43, 6, 7, 98, 4, 8, 9, 6578, 46, 4, 34, 345, 45];

function selectsort(array) {
    let minIndex, current;
    for (let i = 0; i < array.length; i++) {
        minIndex = i;
        for (let j = i + 1; j < array.length; j++) {
            if(array[j] < array[minIndex]){
                minIndex = j;
            }
        }
        current = array[i];
        array[i] = array[minIndex];
        array[minIndex] = current;
    }
    return array;
}

console.log(selectsort(data));