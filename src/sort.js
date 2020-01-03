let data = [9, 341, 43, 6, 7, 98, 4, 8, 9, 6578, 46, 4, 34, 345, 45];
function quicksort(array) {
    function sort(left, right) {
        if (left < right) {
            let current = array[left];
            let hleft = left;
            let hright = right;

            while (left !== right) {
                while (left < right && array[right] > current) {
                    right--;
                }

                while (left < right && array[left] <= current) {
                    left++;
                }

                let temp = array[left];
                array[left] = array[right];
                array[right] = temp;
            }

            array[hleft] = array[left];
            array[left] = current;

            sort(hleft, left - 1);
            sort(left + 1, hright);
        }
    }
    sort(0, array.length - 1);
}

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
}

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
}

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
}
insertsort(data)
console.log(data);
console.log(data.sort((a, b) => a - b));
