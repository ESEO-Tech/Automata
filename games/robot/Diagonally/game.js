
namespace("automata.games.robot", function (exports) {
    "use strict";

    exports.Diagonally = {
        key: "automata.games.robot.Diagonally",
        view: exports.WorldView,

        world: exports.World.create({
            width: 600,
            height: 600,

            walls: [],

            startX: 100,
            startY: 100,

            goalX: 490,
            goalY: 500,
            goalRadius: 15
        })
    };
});
