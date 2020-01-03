let data = [9, 341, 43, 6, 7, 98, 4, 8, 9, 6578, 46, 4, 34, 345, 45];

function bubblesort(array) {
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array.length - i; j++) {
            if (array[j] > array[j + 1]) {
                let temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;
            }
        }
    }
    return array;
}

console.log(bubblesort(data));