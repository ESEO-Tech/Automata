
namespace("automata.games.pushButton", function (exports) {
    "use strict";

    exports.LightSwitcher = {
        view: exports.LightSwitcherWorldView,
    
        world: Object.create(exports.LightSwitcherWorld).augment({
            key: "automata.games.pushButton.LightSwitcher"
        })
    };
});
