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
    return array;
}

console.log(quicksort(data));
