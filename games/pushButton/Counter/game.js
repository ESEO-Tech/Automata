
import {World as CoreWorld} from "../../../js/model/World.js";

export class World extends CoreWorld {
    constructor() {
        super();

        this.timeStepMin = 10;
        this.timeStepMax = 200;
        this.timeStep = 20;

        this.sensors = [
            {name: "B",  desc: "Button"}
        ];
        this.actuators = [
            {name: "C", desc: "Count"}
        ];
    }

    setButton(value) {
        this.setSensorValue(0, value);
    }

    onReset() {
        this.counterValue = 0;
    }

    onStep() {
        if (this.getActuatorValue(0) === "1") {
            this.counterValue ++;
        }
    }
}

export class WorldView {
    constructor(world, container) {
        this.world = world;
        this.container = container;

        container.innerHTML =
            '<button>B=<span class="automata-bool-0">0</span></button>\
            <div class="actuator">C=<span class="automata-bool-0">0</span></div>\
            <div class="counter"><div>0</div></div>';

        const btn = container.querySelector("button");
        btn.addEventListener("mousedown", () => this.setButton("1"))
        btn.addEventListener("mouseup",   () => this.setButton("0"))
        btn.addEventListener("mouseout",  () => this.setButton("0"));

        world.addListener("changed", this.update, this);
    }

    setButton(value) {
        this.world.setButton(value);
        const span = this.container.querySelector("button span");
        span.className = "automata-bool-" + value;
        span.innerHTML = value;
    }

    update() {
        const value = this.world.getActuatorValue(0);

        const span = this.container.querySelector(".actuator span");
        span.className = "automata-bool-" + value;
        span.innerHTML = value;

        this.container.querySelector(".counter div").innerHTML = this.world.counterValue;
    }
}
