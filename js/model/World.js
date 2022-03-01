
import {CoreObject}   from "./Object.js";
import {StateMachine} from "./StateMachine.js";

/**
 * @class World
 * @memberof automata.model
 *
 * @todo Add documentation
 */
export const World = CoreObject.create({
    timeStepMin: 1,
    timeStepMax: 1000,
    timeStep: 20,

    sensors: [],
    actuators: [],

    init: function () {
        CoreObject.init.call(this);
        this.stateMachine = StateMachine.create().init(this);
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
        if (!this.stateMachine.currentState || this.getStatus().done) {
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
            var status = this.getStatus();
            if (status.done) {
                this.pause();
                this.fire("done", status);
            }
            timeElapsed -= this.timeStep;
        }

        this.fire("changed");

        if (this.isRunning) {
            var refTime = Date.now();
            var self = this;
            this.clock = setTimeout(function () {
                self.step(Date.now() - refTime + timeElapsed);
            }, this.timeStep);
        }
    },

    pause: function () {
        this.isRunning = false;
        clearTimeout(this.clock);
        this.fire("pause");
    },

    stop: function () {
        this.isRunning = false;
        clearTimeout(this.clock);
        this.reset();
        this.fire("stop");
    },

    getStatus: function () {
        // Abstract
        return {done: false};
    },

    onStep: function () {
        // Abstract
    }
});
