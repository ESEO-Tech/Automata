
export {WorldView}           from "../WorldView.js";
import {World as RobotWorld} from "../World.js";

export class World extends RobotWorld {
    constructor() {
        super();

        this.width = 600;
        this.height = 600;

        this.walls = [];

        this.startX = 100;
        this.startY = 100;

        this.goalX = 490;
        this.goalY = 500;
        this.goalRadius = 15;
    }
}
