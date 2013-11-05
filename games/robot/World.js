
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
            function intersect(cx, cy, r, wx, wy1, wy2) {
                var r2 = r * r;
                var d = wx - cx;
                var d2 = d * d;
                if (r2 < d2) {
                    return false;
                }
                else {
                    var s = Math.sqrt(r2 - d2);
                    var y1 = cy + s;
                    var y2 = cy - s;
                    return y1 >= wy1 && y1 <= wy2 || y2 >= wy1 && y2 <= wy2;
                }
            }
            
            var collision = false;
            
            for (var index = 0; index < this.walls.length; index ++) {
                var w = this.walls[index];
                if (intersect(nextMatrix.e, nextMatrix.f, this.robotRadius, w[0], w[1], w[3]) ||
                    intersect(nextMatrix.e, nextMatrix.f, this.robotRadius, w[2], w[1], w[3]) ||
                    intersect(nextMatrix.f, nextMatrix.e, this.robotRadius, w[1], w[0], w[2]) ||
                    intersect(nextMatrix.f, nextMatrix.e, this.robotRadius, w[3], w[0], w[2])) {
                    collision = true;
                    break;
                }
            }
            
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