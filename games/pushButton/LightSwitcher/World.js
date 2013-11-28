namespace(this, "automata.games.pushButton", function (exports) {

    exports.LightSwitcherWorld = Object.create(automata.model.World).augment({
        sensors:   [
            {name: "B",  desc: "Button"}
        ],
        actuators: [
            {name: "L", desc: "Light"}
        ]
    });
});
