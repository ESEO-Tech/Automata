
namespace(this, "automata.model", function (exports, globals) {
    exports.World = Object.create(exports.Model).augment({
        timeStepMin: 1,
        timeStepMax: 1000,
        timeStep: 20,
        
        sensors: [],
        actuators: [],
        
        init: function () {
            exports.Model.init.call(this);
            this.stateMachine = Object.create(exports.StateMachine).init(this);
            this.reset();
            return this;
        },

        reset: function () {
            this.sensorValues = this.sensors.map(function () { return "0"; });
            this.actuatorValues = this.actuators.map(function () { return "0"; });
            this.stateMachine.reset();
            this.onReset();
            this.fire("changed");
        },
        
        onReset: function () {
            // Abstract
        },
        
        getSensorValue: function (index) {
            return this.sensorValues[index];
        },
        
        setSensorValue: function (index, value) {
            this.sensorValues[index] = value;
            return this;
        },
        
        getActuatorValue: function (index) {
            return this.actuatorValues[index];
        },
        
        setActuatorValue: function (index, value) {
            this.actuatorValues[index] = value;
            return this;
        },
        
        start: function () {
            if (!this.stateMachine.currentState) {
                this.reset();
            }
            if (this.stateMachine.currentState) {
                this.isRunning = true;
                this.fire("start");
                this.step(this.timeStep);
            }
        },
        
        step: function (timeElapsed) {
            while(timeElapsed >= this.timeStep && this.isRunning) {
                this.actuatorValues = this.stateMachine.step();
                this.onStep();
                if (this.done()) {
                    this.pause();
                    this.fire("done");
                }
                timeElapsed -= this.timeStep;
            }
            
            this.fire("changed");

            if (this.isRunning) {
                var refTime = Date.now();
                var self = this;
                this.clock = globals.setTimeout(function () {
                    self.step(Date.now() - refTime + timeElapsed);
                }, this.timeStep);
            }
        },
        
        pause: function () {
            this.isRunning = false;
            globals.clearTimeout(this.clock);
            this.fire("pause");
        },
        
        stop: function () {
            this.isRunning = false;
            globals.clearInterval(this.clock);
            this.reset();
            this.fire("stop");
        },

        done: function () {
            // Abstract
            return false;
        },
        
        onStep: function () {
            // Abstract
        }
    });
});
