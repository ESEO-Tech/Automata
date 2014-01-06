
namespace("automata.games.openTheGate", function (exports) {
    "use strict";

    exports.LetMeIn = {
        view: exports.WorldView,
        
        world: Object.create(exports.World).augment({
            key: "automata.games.openTheGate.LetMeIn",
            
            carCount: 1
        })
    };
});
