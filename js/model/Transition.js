
import {CoreObject} from "./Object.js";

/**
 * @class Transition
 * @memberof automata.model
 *
 * @todo Add documentation
 */
export class Transition extends CoreObject {

    constructor(sourceState, targetState) {
        super();

        this.sourceState = sourceState;
        this.targetState = targetState;

        var world = sourceState.stateMachine.world;
        this.inputs  = world.sensors  .map(function () { return "-"; });
        this.outputs = world.actuators.map(function () { return "0"; });

        sourceState.addOutgoingTransition(this);
        targetState.addIncomingTransition(this);
    }

    toStorable() {
        return {
            sourceStateId: this.sourceState.id,
            targetStateId: this.targetState.id,
            inputs: this.inputs,
            outputs: this.outputs
        };
    }

    fromStorable(obj) {
        this.inputs = obj.inputs;
        this.outputs = obj.outputs;
        this.fire("changed");
        return this;
    }

    destroy() {
        this.sourceState.removeOutgoingTransition(this);
        this.targetState.removeIncomingTransition(this);
    }

    setInput(index, value) {
        this.inputs[index] = value;

        this.fire("changed");

        return this;
    }

    setOutput(index, value) {
        this.outputs[index] = value;

        this.fire("changed");

        return this;
    }

    setTargetState(state) {
        this.targetState.removeIncomingTransition(this);
        state.addIncomingTransition(this);
        this.targetState = state;

        this.fire("changed");

        return this;
    }

    getIndex() {
        return this.sourceState.outgoingTransitions.indexOf(this);
    }

    matchesPattern(pattern) {
        for (var i = 0, l = Math.min(this.inputs.length, pattern.length); i < l; i ++) {
            if (this.inputs[i] !== "-" && pattern[i] !== "-" && this.inputs[i] !== pattern[i]) {
                return false;
            }
        }
        return true;
    }

    canFire() {
        return this.matchesPattern(this.sourceState.stateMachine.world.sensorValues);
    }

    isNonDeterministic() {
        return this.sourceState.outgoingTransitions.some(function (transition) {
            // TODO check if outputs and target state are different
            return transition !== this && this.matchesPattern(transition.inputs) && (
                this.targetState !== transition.targetState || this.outputs.some(function (value, index) {
                    return value !== transition.outputs[index];
                })
            );
        }, this);
    }
}
