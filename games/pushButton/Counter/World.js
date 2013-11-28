namespace(this, "automata.games.pushButton", function (exports) {

    exports.CounterWorld = Object.create(automata.model.World).augment({
        sensors:   [
            {name: "B",  desc: "Button"}
        ],
        actuators: [
            {name: "C", desc: "Count"}
        ],
        
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
