
export {WorldView}           from "../WorldView.js";
import {World as RobotWorld} from "../World.js";

export const World = RobotWorld.create({
    width: 600,
    height: 600,

    walls: [],

    startX: 100,
    startY: 100,

    goalX: 490,
    goalY: 500,
    goalRadius: 15
});
