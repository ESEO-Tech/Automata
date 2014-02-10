
namespace("automata.games.pushButton", function (exports) {
    "use strict";

    exports.LightSwitcherWorld = automata.model.World.create({
        timeStepMin: 10,
        timeStepMax: 10,
        timeStep: 10,

        sensors:   [
            {name: "B",  desc: "Button"}
        ],
        actuators: [
            {name: "L", desc: "Light"}
        ]
    });
});
