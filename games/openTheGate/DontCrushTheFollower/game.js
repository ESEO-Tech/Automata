export {WorldView}          from "../WorldView.js";
import {World as GateWorld} from "../World.js";

export class World extends GateWorld {
    constructor() {
        super();
        this.carXMin = [-80, -190, -500, -690];
    }

    getStatus() {
        const status = super.getStatus();
        if (status.done && (status.status === "success" || status.status === "warning") && this.gateY < this.gateYMax) {
            return {done: true, status: "error", message: "The gate is still open. Close it behind you."};
        }
        return status;
    }
}
