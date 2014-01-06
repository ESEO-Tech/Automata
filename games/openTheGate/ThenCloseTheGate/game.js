
namespace("automata.games.openTheGate", function (exports) {
    "use strict";

    exports.ThenCloseTheGate = {
        view: exports.WorldView,
        
        world: Object.create(exports.ThenCloseTheGateWorld).augment({
            key: "automata.games.openTheGate.ThenCloseTheGate"
        })
    };
});
