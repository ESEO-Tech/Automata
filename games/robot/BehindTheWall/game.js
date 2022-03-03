
export {WorldView}           from "../WorldView.js";
import {World as RobotWorld} from "../World.js";

export class World extends RobotWorld {
    constructor() {
        super();

        this.width = 600;
        this.height = 400;

        this.walls = [
            [300, 60, 310, 340]
        ];

        this.startX = 50;
        this.startY = 200;

        this.goalX = 330;
        this.goalY = 200;
        this.goalRadius = 15;
    }
}
