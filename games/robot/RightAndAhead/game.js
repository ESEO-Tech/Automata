
namespace("automata.games.robot", function (exports) {
    "use strict";

    exports.RightAndAhead = {
        key: "automata.games.robot.RightAndAhead",
        view: exports.WorldView,

        world: Object.create(exports.World).augment({
            width: 600,
            height: 400,

            walls: [],

            startX: 300,
            startY: 50,

            goalX: 300,
            goalY: 350,
            goalRadius: 15
        })
    };
});
