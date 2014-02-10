
namespace("automata.games.pushButton", function (exports) {
    "use strict";

    exports.CounterWorld = automata.model.World.create({
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
