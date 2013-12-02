
namespace(this, "automata.games.openTheGate", function (exports) {

    exports.ThenCloseTheGate = {
        view: exports.WorldView,
        
        world: Object.create(exports.ThenCloseTheGateWorld).augment({
            key: "automata.games.openTheGate.ThenCloseTheGate"
        })
    };
});
