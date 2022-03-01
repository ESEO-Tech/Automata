
import {CoreObject}   from "./Object.js";
import {StateMachine} from "./StateMachine.js";

/**
 * @class World
 * @memberof automata.model
 *
 * @todo Add documentation
 */
export class World extends CoreObject {
    constructor() {
        super();
        this.stateMachine = new StateMachine(this);
        this.timeStepMin  = 1;
        this.timeStepMax  = 1000;
        this.timeStep     = 20;
        this.sensors      = [];
        this.actuators    = [];
    }

    reset() {
        this.sensorValues = this.sensors.map(function () { return "0"; });
        this.actuatorValues = this.actuators.map(function () { return "0"; });
        this.stateMachine.reset();
        this.onReset();
        this.fire("changed");
    }

    onReset() {
        // Abstract
    }

    getSensorValue(index) {
        return this.sensorValues[index];
    }

    setSensorValue(index, value) {
        this.sensorValues[index] = value;
        return this;
    }

    getActuatorValue(index) {
        return this.actuatorValues[index];
    }

    setActuatorValue(index, value) {
        this.actuatorValues[index] = value;
        return this;
    }

    start() {
        if (!this.stateMachine.currentState || this.getStatus().done) {
            this.reset();
        }
        if (this.stateMachine.currentState) {
            this.isRunning = true;
            this.fire("start");
            this.step(this.timeStep);
        }
    }

    step(timeElapsed) {
        while(timeElapsed >= this.timeStep && this.isRunning) {
            this.actuatorValues = this.stateMachine.step();
            this.onStep();
            const status = this.getStatus();
            if (status.done) {
                this.pause();
                this.fire("done", status);
            }
            timeElapsed -= this.timeStep;
        }

        this.fire("changed");

        if (this.isRunning) {
            const refTime = Date.now();
            this.clock = setTimeout(() => {
                this.step(Date.now() - refTime + timeElapsed);
            }, this.timeStep);
        }
    }

    pause() {
        this.isRunning = false;
        clearTimeout(this.clock);
        this.fire("pause");
    }

    stop() {
        this.isRunning = false;
        clearTimeout(this.clock);
        this.reset();
        this.fire("stop");
    }

    getStatus() {
        // Abstract
        return {done: false};
    }

    onStep() {
        // Abstract
    }
}
