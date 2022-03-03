
import {World as CoreWorld} from "../../../lib/model/World.js";

export class World extends CoreWorld {
    constructor() {
        super();
        this.timeStepMin = 10;
        this.timeStepMax = 10;
        this.timeStep = 10;

        this.sensors = [
            {name: "B",  desc: "Button"}
        ];
        this.actuators = [
            {name: "L", desc: "Light"}
        ];
    }

    setButton(value) {
        this.setSensorValue(0, value);
    }
}

export class WorldView {
    constructor(world, container) {
        this.world = world;
        this.container = container;

        container.innerHTML =
            '<button>B=<span class="automata-bool-0">0</span></button>\
            <div class="light off"><div>L=<span class="automata-bool-0">0</span></div>';

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

        const light = this.container.querySelector(".light");
        light.classList.remove("on", "off");
        light.classList.add(value === "1" ? "on" : "off");

        const span = this.container.querySelector(".light span");
        span.className = "automata-bool-" + value;
        span.innerHTML = value;
    }
}
