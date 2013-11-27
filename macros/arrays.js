/*
 * forEach(element of anArray) {
 *    ...
 * }
 *
 * forEach(element, index of anArray) {
 *    ...
 * }
 *
 * Variables element and index are declared automatically
 * by the macro but are not captured.
 * It means that they can override same-name variables
 * already declared in the current scope.
 */
macro forEach {
    rule {
        ($it:ident of $arr:expr) {
            $body ...
        }
    }
    => {
        var $it, index, arr = $arr;
        for (index = 0; index < arr.length; index += 1) {
            $it = arr[index];
            $body ...
        }
    }

    rule {
        ($it:ident, $index:ident of $arr:expr) {
            $body ...
        }
    }
    => {
        var $it, $index, arr = $arr;
        for ($index = 0; $index < arr.length; $index += 1) {
            $it = arr[$index];
            $body ...
        }
    }
}

/*
var i = 152;
var n = 87;

forEach(n of [10, 20, 30, 40]) {
    console.log(n);
}

forEach(n, i of [10, 20, 30, 40]) {
    console.log(i + " => " + n);
}
*/
