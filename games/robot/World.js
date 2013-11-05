
namespace(this, "automata.games.robot", function (exports, globals) {

    exports.World = Object.create(automata.model.World).augment({
        sensors:   ["WL", "WR", "WA", "EOR"],
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
        startAngle: 0,

        exitX: 0,
        exitY: 0,
        exitRadius: 5,
        
        onReset: function () {
            this.robotMatrix = (new Snap.Matrix()).rotate(this.startAngle).translate(this.startX, this.startY);
        },
        
        onStep: function () {
            var transform = this.robotMatrix.split();
            
            // Compute next coordinates
            var leftDir = 0;
            if (this.actuatorValues[0] === "1") {
                leftDir += 1;
            }
            if (this.actuatorValues[1] === "1") {
                leftDir -= 1;
            }
            var rightDir = 0;
            if (this.actuatorValues[2] === "1") {
                rightDir += 1;
            }
            if (this.actuatorValues[3] === "1") {
                rightDir -= 1;
            }

            var nextMatrix = this.robotMatrix.clone();
            if (leftDir === rightDir) {
                nextMatrix.translate(leftDir * this.stepDistance, 0);
            }
            else if (leftDir === -rightDir) {
                nextMatrix.rotate(leftDir * this.stepDistance * 180 / this.robotRadius / Math.PI);
            }
            else if (leftDir === 0) {
                nextMatrix.rotate(-rightDir * this.stepDistance * 90 / this.robotRadius / Math.PI, -this.robotRadius, -this.robotRadius - this.sensorDistance);
            }
            else if (rightDir === 0) {
                nextMatrix.rotate(leftDir * this.stepDistance * 90 / this.robotRadius / Math.PI, -this.robotRadius, this.robotRadius + this.sensorDistance);
            }

            // Detect collisions
            var collision = false;
            // TODO
            if (!collision) {
                this.robotMatrix = nextMatrix;
            }
            
            // Update sensors
            var sensorPoints = [
                {x: -this.robotRadius, y: -this.robotRadius - this.sensorDistance},
                {x: -this.robotRadius, y:  this.robotRadius + this.sensorDistance},
                {x:  this.robotRadius + this.sensorDistance, y: 0}
            ];
            
            this.sensorValues = ["0", "0", "0"];
            for (var index = 0; index < sensorPoints.length; index ++) {
                var s = sensorPoints[index];
                var sx = this.robotMatrix.x(s.x, s.y);
                var sy = this.robotMatrix.y(s.x, s.y);
                this.walls.forEach(function (w) {
                    if (sx >= w[0] && sx <= w[2] && sy >= w[1] && sy <= w[3]) {
                        this.sensorValues[index] = "1";
                    }
                }, this);
            }
        }        
    });
});