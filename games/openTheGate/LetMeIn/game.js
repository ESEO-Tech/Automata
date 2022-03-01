
export {WorldView}          from "../WorldView.js";
import {World as GateWorld} from "../World.js";

export class World extends GateWorld {
    constructor() {
        super();
        this.carCount = 1;
    }
}
