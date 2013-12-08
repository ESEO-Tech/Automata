
namespace(this, "automata.games.openTheGate", function (exports) {

    exports.LetMeIn = {
        view: exports.WorldView,
        
        world: Object.create(exports.World).augment({
            key: "automata.games.openTheGate.LetMeIn",
            
            carCount: 1
        })
    };
});
