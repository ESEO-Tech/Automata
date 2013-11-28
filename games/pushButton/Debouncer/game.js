namespace(this, "automata.games.pushButton", function (exports) {

    exports.Debouncer = {
        view: exports.CounterWorldView,
    
        world: Object.create(exports.CounterWorld).augment({
            key: "automata.games.pushButton.Debouncer"
        })
    };
});
