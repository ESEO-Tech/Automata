
namespace("automata.games.pushButton", function (exports) {
    "use strict";

    exports.Debouncer = {
        view: exports.CounterWorldView,
    
        world: Object.create(exports.DebouncerWorld).augment({
            key: "automata.games.pushButton.Debouncer"
        })
    };
});
