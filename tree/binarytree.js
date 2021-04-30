/**                  A
 *                  / \
 *                 B   C
 *                / \    \
 *               D   E    F
 *              /   / \   /
 *             G   H   I J
 *
 *qiang: A-B-D-G-E-H-I-C-F-J
 *zhong: G-D-B-H-E-I-A-C-J-F
 *hou:   G-D-H-I-E-B-J-F-C-A
 * */
let j = { data: 'J' };
let i = { data: 'I' };
let h = { data: 'H' };
let g = { data: 'G' };
let f = { data: 'F', left: j };
let e = { data: 'E', left: h, right: i };
let d = { data: 'D', left: g };
let c = { data: 'C', right: f };
let b = { data: 'B', left: d, right: e };
let a = { data: 'A', left: b, right: c };
const tree = a;

function visit(root) {
    if (root.left) {
        visit(root.left);
    }
    if (root.right) {
        visit(root.right);
    }
    console.log(root.data);
}

function visit1(root) {
    let stack = [];
    while(root || stack.length > 0){
        while(root){
            stack.push(root);
            console.log(root.data);

            root = root.left;
        }
        if(stack.length > 0){
            root = stack.pop();
            root = root.right;
        }
    }
}
visit1(tree)