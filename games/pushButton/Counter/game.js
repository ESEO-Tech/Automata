
namespace("automata.games.pushButton", function (exports) {

    exports.Counter = {
        view: exports.CounterWorldView,
    
        world: Object.create(exports.CounterWorld).augment({
            key: "automata.games.pushButton.Counter"
        })
    };
});
