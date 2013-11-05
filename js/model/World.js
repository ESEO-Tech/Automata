
namespace(this, "automata.model", function (exports, globals) {
    exports.World = Object.create(exports.Model).augment({
        CLOCK_PERIOD_MS: 20,
        
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
                
                var self = this;
                this.clock = globals.setInterval(function () {
                    self.actuatorValues = self.stateMachine.step();
                    self.onStep();
                    self.fire("changed");
                }, this.CLOCK_PERIOD_MS);
            }
        },
        
        pause: function () {
            this.isRunning = false;
            globals.clearInterval(this.clock);
            this.fire("pause");
        },
        
        stop: function () {
            this.isRunning = false;
            globals.clearInterval(this.clock);
            this.reset();
            this.fire("stop");
        },

        done: function () {
            this.pause();
            this.fire("done");
        },
        
        onStep: function () {
            // Abstract
        }
    });
});
