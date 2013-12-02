namespace(this, "automata.games.pushButton", function (exports) {

    exports.LightSwitcherWorld = Object.create(automata.model.World).augment({
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
