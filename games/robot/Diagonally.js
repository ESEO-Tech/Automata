
namespace(this, "automata.games.robot", function (exports) {
    
    exports.Diagonally = {
        view: exports.WorldView,
        
        world: Object.create(exports.World).augment({
            key: "automata.games.robot.Diagonally",
            
            width: 600,
            height: 400,
            
            walls: [],
            
            startX: 100,
            startY: 100,
            
            goalX: 500,
            goalY: 300,
            goalRadius: 15
        })
    };
});
