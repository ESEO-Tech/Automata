export {WorldView}           from "../WorldView.js";
import {World as RobotWorld} from "../World.js";

export class World extends RobotWorld {
    constructor() {
        super();

        this.width = 600;
        this.height = 400;

        this.walls = [
            [0,   0,   600, 10],
            [0,   390, 600, 400],
            [0,   0,   10,  400],
            [590, 0,   600, 400]
        ];

        this.startX = 30;
        this.startY = 30;

        this.goalX = 570;
        this.goalY = 370;
        this.goalRadius = 15;
    }
}
