
import {World as CoreWorld} from "../../lib/model/World.js";

export class World extends CoreWorld {
    constructor() {
        super();

        this.timeStepMax = 100;

        this.sensors = [
            {name: "WL",  desc: "Wall on the Left"},
            {name: "WR",  desc: "Wall on the right"},
            {name: "WA",  desc: "Wall Ahead"},
            {name: "EOR", desc: "End Of Rotation"}
        ];
        this.actuators = [
            {name: "LF", desc: "Left wheel Forward"},
            {name: "LB", desc: "Left wheel Backward"},
            {name: "RF", desc: "Right wheel Forward"},
            {name: "RB", desc: "Right wheel Backward"}
        ];

        this.width = 100;
        this.height = 100;

        this.walls = [];

        this.robotRadius = 10;
        this.sensorFactor = 1.4;
        this.stepDistance = 1;

        this.startX = 0;
        this.startY = 0;
        this.startAngle = 0;

        this.goalX = 0;
        this.goalY = 0;
        this.goalRadius = 10;

        this.sensorRadius = this.robotRadius / 4;
        this.sensorPoints = [
            {x: -this.robotRadius,                     y: -this.robotRadius * this.sensorFactor},
            {x: -this.robotRadius,                     y:  this.robotRadius * this.sensorFactor},
            {x:  this.robotRadius * this.sensorFactor, y: 0}
        ];
    }

    onReset() {
        this.robotMatrix = (new Snap.Matrix()).translate(this.startX, this.startY).rotate(this.startAngle);
    }

    onStep() {
        this.sensorValues = ["0", "0", "0", "0"];

        // Compute next coordinates
        let leftDir = 0;
        if (this.actuatorValues[0] === "1") {
            leftDir += 1;
        }
        if (this.actuatorValues[1] === "1") {
            leftDir -= 1;
        }
        let rightDir = 0;
        if (this.actuatorValues[2] === "1") {
            rightDir += 1;
        }
        if (this.actuatorValues[3] === "1") {
            rightDir -= 1;
        }

        const nextMatrix = this.robotMatrix.clone();
        if (leftDir === rightDir) {
            nextMatrix.translate(leftDir * this.stepDistance, 0);
        }
        else if (leftDir === -rightDir) {
            nextMatrix.rotate(leftDir * this.stepDistance * 180 / this.robotRadius / Math.PI);
        }
        else if (leftDir === 0) {
            nextMatrix.rotate(-rightDir * this.stepDistance * 90 / this.robotRadius / Math.PI, this.sensorPoints[0].x, this.sensorPoints[0].y);
        }
        else if (rightDir === 0) {
            nextMatrix.rotate(leftDir * this.stepDistance * 90 / this.robotRadius / Math.PI, this.sensorPoints[1].x, this.sensorPoints[1].y);
        }

        // Detect collisions
        function intersect(cx, cy, r, wx, wy1, wy2) {
            const r2 = r * r;
            const d = wx - cx;
            const d2 = d * d;
            if (r2 < d2) {
                return false;
            }
            else {
                const s = Math.sqrt(r2 - d2);
                const y1 = cy + s;
                const y2 = cy - s;
                return y1 >= wy1 && y1 <= wy2 || y2 >= wy1 && y2 <= wy2;
            }
        }

        let collision =
            intersect(nextMatrix.e, nextMatrix.f, this.robotRadius, 0,           0, this.height) ||
            intersect(nextMatrix.e, nextMatrix.f, this.robotRadius, this.width,  0, this.height) ||
            intersect(nextMatrix.f, nextMatrix.e, this.robotRadius, 0,           0, this.width)  ||
            intersect(nextMatrix.f, nextMatrix.e, this.robotRadius, this.height, 0, this.width);

        for (const cw of this.walls) {
            if (intersect(nextMatrix.e, nextMatrix.f, this.robotRadius, cw[0], cw[1], cw[3]) ||
                intersect(nextMatrix.e, nextMatrix.f, this.robotRadius, cw[2], cw[1], cw[3]) ||
                intersect(nextMatrix.f, nextMatrix.e, this.robotRadius, cw[1], cw[0], cw[2]) ||
                intersect(nextMatrix.f, nextMatrix.e, this.robotRadius, cw[3], cw[0], cw[2])) {
                collision = true;
                break;
            }
        }

        if (!collision) {
            if (leftDir !== rightDir && (nextMatrix.a === 0 || nextMatrix.a * this.robotMatrix.a < 0 ||
                                         nextMatrix.b === 0 || nextMatrix.b * this.robotMatrix.b < 0)) {
                if (nextMatrix.a > 0.99) {
                    nextMatrix.a = 1;
                    nextMatrix.b = 0;
                }
                if (nextMatrix.a < -0.99) {
                    nextMatrix.a = -1;
                    nextMatrix.b = 0;
                }
                if (nextMatrix.b > 0.99) {
                    nextMatrix.a = 0;
                    nextMatrix.b = 1;
                }
                if (nextMatrix.b < -0.99) {
                    nextMatrix.a = 0;
                    nextMatrix.b = -1;
                }
                this.sensorValues[3] = "1";
            }

            this.robotMatrix = nextMatrix;
        }

        // Update sensors
        for (let sensorIndex = 0; sensorIndex < this.sensorPoints.length; sensorIndex ++) {
            const sensor = this.sensorPoints[sensorIndex];
            const sx = this.robotMatrix.x(sensor.x, sensor.y);
            const sy = this.robotMatrix.y(sensor.x, sensor.y);
            for (const sw of this.walls) {
                if (intersect(sx, sy, this.sensorRadius, sw[0], sw[1], sw[3]) ||
                    intersect(sx, sy, this.sensorRadius, sw[2], sw[1], sw[3]) ||
                    intersect(sy, sx, this.sensorRadius, sw[1], sw[0], sw[2]) ||
                    intersect(sy, sx, this.sensorRadius, sw[3], sw[0], sw[2])) {
                    this.sensorValues[sensorIndex] = "1";
                    break;
                }
            }
        }
    }

    getStatus() {
        const goalDx = this.goalX - this.robotMatrix.e;
        const goalDy = this.goalY - this.robotMatrix.f;
        if (goalDx * goalDx + goalDy * goalDy <= this.goalRadius * this.goalRadius) {
            return {done: true, status: "success"};
        }
        else {
            return {done: false};
        }
    }
}
