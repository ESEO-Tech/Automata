
namespace("automata.games.openTheGate", function (exports) {
    "use strict";

    exports.LetMeIn = {
        key: "automata.games.openTheGate.LetMeIn",
        view: exports.WorldView,
        world: exports.World.create({
            carCount: 1
        })
    };
});
