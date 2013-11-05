
namespace(this, "automata.games.robot", function (exports, globals) {

    exports.BehindTheWall = Object.create(exports.World).augment({
        key: "automata.games.robot.BehindTheWall",
        
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
    });
});
