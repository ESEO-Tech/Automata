
namespace("automata.games.openTheGate", function (exports) {
    "use strict";

    exports.World = automata.model.World.create({
        timeStepMax: 100,
        
        sensors: [
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
        carXMin: [-80, -480, -880, -1280],
        carXMax: 421,
        carXStop: 120,
        carXStep: 2,
        carY: 190,
        carCount: 4,

        width: 400,
        height: 300,
        
        onReset: function () {
            this.gateY = this.gateYMax;
            this.carX = this.carXMin.slice();
            
            this.buttonHasBeenPressed = false;
            this.gateOpeningBeforeButtonPressed = false;
            this.carsPassed = 0;
            this.gateForcedOpen = false;
            this.gateForcedClosed = false;
            this.upAndDownAtTheSameTime = false;
            this.crush = false;
        },
        
        onStep: function () {
            // Update gate position according to open and close commands.
            // * The gate moves up when the Open command is on
            // * The gate moves down when the Close command is on and no car is passing
            if (this.getActuatorValue(0) === "1" && this.getActuatorValue(1)  === "1") {
                this.upAndDownAtTheSameTime = true;
            }
            else if(this.getActuatorValue(0) === "1") {
                if (!this.buttonHasBeenPressed) {
                    this.gateOpeningBeforeButtonPressed = true;
                }
                if (this.gateY > this.gateYMin) {
                    this.gateY -= this.gateYStep;
                }
                else {
                    this.gateForcedOpen = true;
                }
            }
            else if(this.getActuatorValue(1) === "1") {
                if (this.gateY < this.gateYMax && !this.crush) {
                    this.gateY += this.gateYStep;
                    if (this.gateY >= this.gateYOpen) {
                        this.buttonHasBeenPressed = false;
                    }
                }
                else {
                    this.gateForcedClosed = true;
                }
            }
            
            // Update gate status signals
            this.setSensorValue(1, (this.gateY <= this.gateYMin)? "1" : "0");
            this.setSensorValue(2, (this.gateY >= this.gateYMax)? "1" : "0");

            // Reset button and vehicle sensor
            this.setSensorValue(0, "0");
            this.setSensorValue(3, "0");
            
            var carsMove = true;
            
            for (var index = 0; index < this.carX.length; index ++) {
                var x = this.carX[index];
                
                // Update car position. A car can move:
                // * before reaching the "Open" button (carXStop),
                // * through the the gate, if the gate is open,
                // * after the gate.
                if (carsMove) {
                    if (x >= this.carXStop && x < this.gateX + this.gateWidth && this.gateY >= this.gateYOpen) {
                        carsMove = false;
                    }
                    else if(x < this.carXMax) {
                        this.carX[index] = x += this.carXStep;
                        if (x >= this.carXMax) {
                            this.carsPassed ++;
                        }
                    }
                }
                
                // Push the button when the car is in front of the gate until the gate starts to open
                if(x >= this.carXStop && x <= this.carXStop + this.carXStep && this.gateY >= this.gateYOpen) {
                    this.setSensorValue(0, "1");
                    this.buttonHasBeenPressed = true;
                }
                
                // Detect car crushing under gate
                if(x >= this.gateX - this.carWidth && x <= this.gateX + this.gateWidth && this.gateY > this.gateYOpen) {
                    this.crush = true;
                }                    
                
                // Update vehicle sensor
                if (x + this.carWidth >= this.gateX && x <= this.gateX + this.gateWidth) {
                    this.setSensorValue(3, "1");
                }
            }
        },
        
        problem: function () {
            return this.gateOpeningBeforeButtonPressed ||
                this.gateForcedOpen ||
                this.gateForcedClosed ||
                this.upAndDownAtTheSameTime ||
                this.crush;
        },
        
        getStatus: function () {
            if (this.crush) {
                return {done: true, status: "error", message: "Do not close the gate when a car is passing through."};
            }
            else if (this.gateOpeningBeforeButtonPressed) {
                return {done: true, status: "error", message: "The gate started opening before the button was pressed."};
            }
            else if (this.carsPassed === this.carCount) {
                if (this.upAndDownAtTheSameTime) {
                    return {done: true, status: "warning", message: "Up and Down commands must not be active at the same time."};
                }
                else if (this.gateForcedOpen) {
                    return {done: true, status: "warning", message: "Turn the Up command off when the gate is open."};
                }
                else if (this.gateForcedClosed) {
                    return {done: true, status: "warning", message: "Turn the Down command off when the gate is closed."};
                }
                else {
                    return {done: true, status: "success"};
                }
            }
            else {
                return {done: false};
            }
        }
    });
});
