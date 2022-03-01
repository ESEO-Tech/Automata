
import {World as CoreWorld} from "../../../js/model/World.js";

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
}

export class WorldView {
    constructor(world, container) {
        this.world = world;

        container.html('<button>B=<span class="automata-bool-0">0</span></button>\
                        <div class="light off"><div>L=<span class="automata-bool-0">0</span></div>');

        var self = this;
        $("button", container)
            .mousedown(function () {
                self.setButton("1");
            })
            .mouseup(function () {
                self.setButton("0");
            })
            .mouseout(function () {
                self.setButton("0");
            });

        world.addListener("changed", this.update, this);
    }

    setButton(value) {
        this.world.setSensorValue(0, value);
        $("button span", this.container)
            .removeClass()
            .addClass("automata-bool-" + value)
            .html(value);
    }

    update() {
        var value = this.world.getActuatorValue(0);

        $(".light", this.container)
            .removeClass("on off")
            .addClass(value === "1" ? "on" : "off");

        $(".light span", this.container)
            .removeClass()
            .addClass("automata-bool-" + value)
            .html(value);
    }
}
