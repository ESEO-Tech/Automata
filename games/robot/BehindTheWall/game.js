export {WorldView}           from "../WorldView.js";
import {World as RobotWorld} from "../World.js";

export const World = RobotWorld.create({
    width: 600,
    height: 400,

    walls: [
        [300, 60, 310, 340]
    ],

    startX: 50,
    startY: 200,

    goalX: 330,
    goalY: 200,
    goalRadius: 15
});
