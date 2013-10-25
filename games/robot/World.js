
namespace(this, "automata.games.robot", function (exports, globals) {

    exports.World = Object.create(automata.model.World).augment({
        sensors:   ["WL", "WR", "WA"],
        actuators: ["LF", "LB", "RF", "RB"],

        width: 100,
        height: 100,
        
        walls: [],
        
        robotRadius: 12,
        sensorDistance: 5,
        stepDistance: 1,
        stepAngle: 2,
        
        startX: 0,
        startY: 0,
        startAngle: 30,

        exitX: 0,
        exitY: 0,
        exitRadius: 5,
        
        init: function () {
            automata.model.World.init.call(this);
            
            this.restart();
            return this;
        },
        
        restart: function () {
            this.robotX = this.startX;
            this.robotY = this.startY;
            this.robotAngle = this.startAngle;
            this.sensorValues = [0, 0, 0];
            this.fire("changed");
        }
    });
});