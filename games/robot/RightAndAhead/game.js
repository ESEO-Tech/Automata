
export {WorldView}           from "../WorldView.js";
import {World as RobotWorld} from "../World.js";

export const World = RobotWorld.create({
    width: 600,
    height: 400,

    walls: [],

    startX: 300,
    startY: 50,

    goalX: 300,
    goalY: 350,
    goalRadius: 15
});
