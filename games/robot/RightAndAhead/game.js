
export {WorldView}           from "../WorldView.js";
import {World as RobotWorld} from "../World.js";

export class World extends RobotWorld {
    constructor() {
        super();

        this.width = 600;
        this.height = 400;

        this.walls = [];

        this.startX = 300;
        this.startY = 50;

        this.goalX = 300;
        this.goalY = 350;
        this.goalRadius = 15;
    }
}
