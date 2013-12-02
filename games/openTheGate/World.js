
namespace(this, "automata.games.openTheGate", function (exports) {

    exports.World = Object.create(automata.model.World).augment({
        timeStepMax: 100,
        
        sensors:   [
            {name: "B",  desc: "Button"},
            {name: "O", desc: "Gate is fully Open"},
            {name: "C", desc: "Gate is fully Closed"},
            {name: "V", desc: "A Vehicle is passing through the gate"}
        ],
        actuators: [
            {name: "U", desc: "Move gate Up"},
            {name: "D", desc: "Move gate Down"}
        ],

        gateWidth: 10,
        gateYMin: 150,
        gateYMax: 210,
        gateYOpen: 170,
        gateYStep: 1,
        gateX: 250,
        
        carWidth: 80,
        carXMin: -80,
        carXMax: 401,
        carXStop: 160,
        carXStep: 2,
        carY: 190,

        vehicleSensorXMin: 270,
        vehicleSensorXMax: 190,
        
        width: 400,
        height: 300,
        
        onReset: function () {
            this.gateY = this.gateYMax;
            this.carX = this.carXMin;
        },
        
        onStep: function () {
            // Update car position. The car can move:
            // * before reaching the "Open" button (carXStop),
            // * through the the gate, if the gate is open,
            // * after the gate.
            if(this.carX < this.carXStop ||
               (this.carX >= this.carXStop && this.carX < this.gateX + this.gateWidth && this.gateY < this.gateYOpen) ||
               (this.carX >= this.gateX + this.gateWidth && this.carX < this.carXMax))
                this.carX += this.carXStep;
            
            // Update gate position according to open and close commands.
            // * The gate moves up when the Open command is on
            // * The gate moves down than the Close command is on and the car is not passing
            if(this.getActuatorValue(0) === "1" && this.getActuatorValue(1) === "0" && this.gateY > this.gateYMin) {
                this.gateY -= this.gateYStep;
            }
            if(this.getActuatorValue(0) === "0" && this.getActuatorValue(1) === "1" && this.gateY < this.gateYMax &&
               (this.carX < this.gateX - this.carWidth || this.carX > this.gateX + this.gateWidth || this.gateY < this.gateYOpen)) {
                this.gateY += this.gateYStep;
            }
            
            // Push the button when the car is in front of the gate until the gate starts to open
            if(this.carX >= this.carXStop && this.carX <= this.carXStop + this.carXStep && this.gateY >= this.gateYMax)
                this.setSensorValue(0, "1");
            else
                this.setSensorValue(0, "0");
            
            // Update gate status signals
            this.setSensorValue(1, (this.gateY <= this.gateYMin)? "1" : "0");
            this.setSensorValue(2, (this.gateY >= this.gateYMax)? "1" : "0");
            
            // Update vehicle sensor
            this.setSensorValue(3, (this.carX + this.catWidth >= this.vehicleSensorXMin && this.carX <= this.vehicleSensorXMax)? "1" : "0");
        },
        
        problem: function () {
                // Forcing the Up command while the gate is fully open
            return this.getActuatorValue(0) === "1" && this.getSensorValue(1) === "1" ||
                // Forcing the Down command while the gate is fully closed
                this.getActuatorValue(1) === "1" && this.getSensorValue(2) === "1" ||
                // Moving the gate up and down at the same time
                this.getActuatorValue(0) === "1" && this.getActuatorValue(1)  === "1" ||
                // Moving the gate down while a vehicle is passing
                this.getActuatorValue(1) === "1" && this.carX > this.gateX - this.carWidth && this.carX < this.gateX + this.gateWidth;
        },
        
        done: function () {
            return this.carX >= this.carXMax;
        }
    });
});