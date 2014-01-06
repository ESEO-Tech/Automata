
namespace("automata.games.openTheGate", function (exports) {
    "use strict";

    exports.DontCrushTheFollower = {
        view: exports.WorldView,
        
        world: Object.create(exports.DontCrushTheFollowerWorld).augment({
            key: "automata.games.openTheGate.DontCrushTheFollower"
        })
    };
});
