
/** @namespace automata */

/**
 * @namespace model
 * @memberof automata
 */
namespace("automata.model", function (exports) {
    "use strict";

    /**
     * @class Transition
     * @memberof automata.model
     *
     * @todo Add documentation
     */
    exports.Transition = exports.Object.create({
        
        init: function (sourceState, targetState) {
            exports.Object.init.call(this);

            this.sourceState = sourceState;
            this.targetState = targetState;

            var world = sourceState.stateMachine.world;
            this.inputs  = world.sensors  .map(function () { return "-"; });
            this.outputs = world.actuators.map(function () { return "0"; });
            
            sourceState.addOutgoingTransition(this);
            targetState.addIncomingTransition(this);
            
            return this;
        },
        
        toStorable: function () {
            return {
                sourceStateId: this.sourceState.id,
                targetStateId: this.targetState.id,
                inputs: this.inputs,
                outputs: this.outputs
            };
        },
        
        fromStorable: function (obj) {
            this.inputs = obj.inputs;
            this.outputs = obj.outputs;
            this.fire("changed");
            return this;
        },
        
        destroy: function () {
            this.sourceState.removeOutgoingTransition(this);
            this.targetState.removeIncomingTransition(this);
        },
        
        setInput: function (index, value) {
            this.inputs[index] = value;
            
            this.fire("changed");
            
            return this;
        },
        
        setOutput: function (index, value) {
            this.outputs[index] = value;
            
            this.fire("changed");
            
            return this;
        },
        
        setTargetState: function (state) {
            this.targetState.removeIncomingTransition(this);
            state.addIncomingTransition(this);
            this.targetState = state;
            
            this.fire("changed");
            
            return this;
        },
        
        getIndex: function () {
            return this.sourceState.outgoingTransitions.indexOf(this);
        },
        
        matchesPattern: function (pattern) {
            for (var i = 0; i < this.inputs.length && i < pattern.length; i ++) {
                if (this.inputs[i] !== "-" && pattern[i] !== "-" && this.inputs[i] !== pattern[i]) {
                    return false;
                }
            }
            return true;
        },
        
        canFire: function () {
            return this.matchesPattern(this.sourceState.stateMachine.world.sensorValues);
        },
        
        isNonDeterministic: function () {
            return this.sourceState.outgoingTransitions.some(function (transition) {
                // TODO check if outputs and target state are different
                return transition !== this && this.matchesPattern(transition.inputs) && (
                    this.targetState !== transition.targetState || this.outputs.some(function (value, index) {
                        return value !== transition.outputs[index];
                    })
                );
            }, this);
        }
    });
});
