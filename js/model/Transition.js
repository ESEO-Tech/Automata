
namespace(this, "automata.model", function (exports, globals) {
    "use strict";

    exports.Transition = Object.create(exports.Model).augment({
        init: function (sourceState, targetState) {
            exports.Model.init.call(this);

            this.sourceState = sourceState;
            this.targetState = targetState;

            var world = sourceState.stateMachine.world;
            this.inputs  = world.sensors  .map(function () { return "-"; });
            this.outputs = world.actuators.map(function () { return "0"; });
            
            sourceState.addOutgoingTransition(this);
            targetState.addIncomingTransition(this);
            
            return this;
        },
        
        toObject: function () {
            return {
                sourceStateId: this.sourceState.id,
                targetStateId: this.targetState.id,
                inputs: this.inputs,
                outputs: this.outputs
            };
        },
        
        fromObject: function (obj) {
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
            for (var index = 0; index < this.inputs.length; index ++) {
                if (this.inputs[index] !== "-" && pattern[index] !== "-" && this.inputs[index] !== pattern[index]) {
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
