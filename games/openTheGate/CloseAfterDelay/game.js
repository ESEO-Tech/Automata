import {WorldView as GateWorldView} from "../WorldView.js";
import {World     as GateWorld}     from "../World.js";

const COUNT_MAX = 150;

export class World extends GateWorld {
    constructor() {
        super();
        this.carSlow[1] = true;
        this.sensors.push({name: "TO", desc: "Timeout"});
        this.actuators.push({name: "TR", desc: "Timer Reset"},
                            {name: "TE", desc: "Timer Enable"});
    }

    onReset() {
        super.onReset();
        this.count = COUNT_MAX;
    }

    onStep() {
        super.onStep();
        if (this.getActuatorValue(2) === "1") {
            this.count = COUNT_MAX;
        }
        else if (this.getActuatorValue(3) === "1" && this.count > 0) {
            this.count --;
        }
        this.setSensorValue(4, this.count === 0 ? "1" : "0");
    }

    getStatus() {
        const status = super.getStatus();
        if (status.done && (status.status === "success" || status.status === "warning") && this.gateY < this.gateYMax) {
            return {done: true, status: "error", message: "The gate is still open. Close it behind you."};
        }
        return status;
    }
}

export class WorldView extends GateWorldView {
    getPath(progress) {
        const angle = 1.99 * Math.PI * (1 - progress);
        const x = 280;
        const y = 140;
        const r = 10;
        const x1 = x - r * Math.sin(angle);
        const y1 = y - r * Math.cos(angle);
        const s  = progress <= 0.5 ? 1 : 0;
        return `M ${x} ${y - r} A ${r} ${r} 0 ${s} 0 ${x1} ${y1} L ${x} ${y} Z`;
    }

    render() {
        super.render();
        this.sensorViews.push(this.paper.path(this.getPath(0)).attr({stroke: "blue", fill: "red"}));
        this.paper.circle(280, 140, 10).attr({stroke: "black", fill: "none"});
        this.paper.text(280, 125, "T");
    }

    update() {
        super.update();
        this.sensorViews[4].attr({d: this.getPath(this.world.count / COUNT_MAX)});
    }
}
