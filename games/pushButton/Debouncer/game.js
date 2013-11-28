namespace(this, "automata.games.pushButton", function (exports) {

    exports.Debouncer = {
        view: exports.DebouncerWorldView,
    
        world: Object.create(exports.DebouncerWorld).augment({
            key: "automata.games.pushButton.Debouncer"
        })
    };
});
