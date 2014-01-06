
namespace("automata.games.pushButton", function (exports) {
    "use strict";

    exports.Counter = {
        view: exports.CounterWorldView,
    
        world: Object.create(exports.CounterWorld).augment({
            key: "automata.games.pushButton.Counter"
        })
    };
});
