
import {CoreObject}         from "../../../js/model/Object.js";
import {World as CoreWorld} from "../../../js/model/World.js";

export const World = CoreWorld.create({
    timeStepMin: 10,
    timeStepMax: 200,
    timeStep: 20,

    sensors:   [
        {name: "B",  desc: "Button"}
    ],
    actuators: [
        {name: "C", desc: "Count"}
    ],

    setButton: function (value) {
        this.setSensorValue(0, value);
    },

    onReset: function () {
        this.counterValue = 0;
    },

    onStep: function () {
        if (this.getActuatorValue(0) === "1") {
            this.counterValue ++;
        }
    }
});

export const WorldView = CoreObject.create({

    init: function (world, container) {
        CoreObject.init.call(this);

        this.world = world;

        container.html('<button>B=<span class="automata-bool-0">0</span></button>\
                        <div class="actuator">C=<span class="automata-bool-0">0</span></div>\
                        <div class="counter"><div>0</div></div>');

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

        return this;
    },

    setButton: function (value) {
        this.world.setButton(value);
        $("button span", this.container)
            .removeClass()
            .addClass("automata-bool-" + value)
            .html(value);
    },

    update: function () {
        var value = this.world.getActuatorValue(0);

        $(".actuator span", this.container)
            .removeClass()
            .addClass("automata-bool-" + value)
            .html(value);

        $(".counter div", this.container).html(this.world.counterValue);
    }
});
