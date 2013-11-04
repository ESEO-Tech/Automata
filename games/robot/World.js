
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
        startAngle: 0,

        exitX: 0,
        exitY: 0,
        exitRadius: 5,
        
        onReset: function () {
            this.robotX = this.startX;
            this.robotY = this.startY;
            this.robotAngle = this.startAngle;
        },
        
        onStep: function () {
            var angleRad = this.robotAngle * Math.PI / 180;
            
            var angleCos = Math.cos(angleRad);
            var angleSin = Math.sin(angleRad);
            
            var rc = this.robotRadius * angleCos;
            var rs = this.robotRadius * angleSin;

            // Update position
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
            
            if (leftDir === rightDir) {
                this.robotX += this.stepDistance * leftDir * angleCos;
                this.robotY += this.stepDistance * leftDir * angleSin;
            }
            else if (leftDir === -rightDir) {
                this.robotAngle += leftDir * this.stepDistance * 180 / this.robotRadius / Math.PI;
            }
            else if (leftDir === 0) {
                var da = -rightDir * this.stepDistance / this.robotRadius / 2;
                var das = Math.sin(da);
                var dac = Math.cos(da);
                this.robotX += rs * dac - rc * das - rs;
                this.robotY -= rs * das + rc * dac - rc;
                this.robotAngle += da * 180 / Math.PI;
            }
            else if (rightDir === 0) {
                var da = leftDir * this.stepDistance / this.robotRadius / 2;
                var das = Math.sin(da);
                var dac = Math.cos(da);
                this.robotX -= rs * dac - rc * das - rs;
                this.robotY += rs * das + rc * dac - rc;
                this.robotAngle += da * 180 / Math.PI;
            }
            
            // Update sensors
            var ds = (this.robotRadius + this.sensorDistance) * angleSin;
            var dc = (this.robotRadius + this.sensorDistance) * angleCos;
            
            var sensorPoints = [
                {x: this.robotX - rc + ds, y: this.robotY - rs - dc},
                {x: this.robotX - rc - ds, y: this.robotY - rs + dc},
                {x: this.robotX + dc, y: this.robotY + ds}
            ];
            
            this.sensorValues = ["0", "0", "0"];
            this.walls.forEach(function (w) {
                for (var index = 0; index < sensorPoints.length; index ++) {
                    var s = sensorPoints[index];
                    if (s.x >= w[0] && s.x <= w[2] && s.y >= w[1] && s.y <= w[3]) {
                        this.sensorValues[index] = "1";
                    }
                }
            }, this);
        }
    });
});