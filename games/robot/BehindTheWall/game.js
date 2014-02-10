
namespace("automata.games.robot", function (exports) {
    "use strict";

    exports.BehindTheWall = {
        key: "automata.games.robot.BehindTheWall",
        view: exports.WorldView,

        world: Object.create(exports.World).augment({
            width: 600,
            height: 400,

            walls: [
                [300, 60, 310, 340]
            ],

            startX: 50,
            startY: 200,

            goalX: 330,
            goalY: 200,
            goalRadius: 15
        })
    };
});
