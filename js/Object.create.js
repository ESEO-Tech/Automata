
if (!Object.create) {
    (function () {
        "use strict";
        
        function Construct() {}
        
        Object.create = function (proto) {
            if (arguments.length !== 1) {
                throw new Error('Object.create implementation only accepts one parameter.');
            }
            Construct.prototype = proto;
            return new Construct();
        };
    }());
}

