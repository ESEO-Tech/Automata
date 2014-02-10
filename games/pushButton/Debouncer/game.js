
namespace("automata.games.pushButton", function (exports) {
    "use strict";

    exports.Debouncer = {
        key: "automata.games.pushButton.Debouncer",
        view: exports.CounterWorldView,
        world: exports.DebouncerWorld
    };
});
