
namespace("automata.games.openTheGate", function (exports) {
    "use strict";

    exports.LetMeIn = {
        key: "automata.games.openTheGate.LetMeIn",
        view: exports.WorldView,
        world: Object.create(exports.World).augment({
            carCount: 1
        })
    };
});
