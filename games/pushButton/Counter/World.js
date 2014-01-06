
namespace("automata.games.pushButton", function (exports) {
    "use strict";

    exports.CounterWorld = Object.create(automata.model.World).augment({
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
});
