
namespace(this, "automata.model", function (exports) {
    "use strict";

    exports.StateMachine = exports.Object.create({
        
        init: function (world) {
            exports.Object.init.call(this);
            
            this.world = world;
            
            this.states = [];
            this.statesById = {};
            
            this.transitions = [];
            this.transitionsById = {};
            
            this.reset();
            
            return this;
        },
        
        toObject: function () {
            var result = {
                states: {},
                transitions: {}
            };
            for (var sid in this.statesById) {
                result.states[sid] = this.statesById[sid].toObject();
            }
            for (var tid in this.transitionsById) {
                result.transitions[tid] = this.transitionsById[tid].toObject();
            }
            return result;
        },
        
        fromObject: function (obj, mapping) {
            for (var sid in obj.states) {
                mapping[sid] = this.createState().fromObject(obj.states[sid]);
            }
            for (var tid in obj.transitions) {
                var tobj = obj.transitions[tid];
                mapping[tid] = this.createTransition(mapping[tobj.sourceStateId], mapping[tobj.targetStateId]).fromObject(tobj);
            }
            return this;
        },
        
        getStateVars: function () {
            if (this.world.solution && this.world.solution.stateVars) {
                return this.world.solution.stateVars;
            }
            else {
                return [];
            }
        },
        
        createState: function () {
            var state = exports.State.create().init(this);
            this.states.push(state);
            this.statesById[state.id] = state;
            
            state.addListener("changed", function () {
                this.fire("changed");
            }, this);
            
            this.fire("createState", state);
            this.fire("changed");
            
            return state;
        },
        
        removeState: function (state) {
            this.fire("beforeRemoveState", state);
            
            var index = this.states.indexOf(state);
            if (index === 0) {
                this.world.stop();
            }

            state.destroy();
            this.states.splice(index, 1);
            delete this.statesById[state.id];
            
            this.fire("afterRemoveState", state);
            this.fire("changed");
            
            return this;
        },
    
        createTransition: function (sourceState, targetState) {
            var transition = exports.Transition.create().init(sourceState, targetState);
            this.transitions.push(transition);
            this.transitionsById[transition.id] = transition;

            transition.addListener("changed", function () {
                this.fire("changed");
            }, this);
            
            
            this.fire("createTransition", transition);
            this.fire("changed");
            
            return transition;
        },
        
        removeTransition: function (transition) {
            this.fire("beforeRemoveTransition", transition);
            
            transition.destroy();
            this.transitions.splice(this.transitions.indexOf(transition), 1);
            delete this.transitionsById[transition.id];
            
            this.fire("afterRemoveTransition", transition);
            this.fire("changed");
            
            return this;
        },
        
        reset: function () {
            if (this.states.length) {
                this.currentState = this.states[0];
            }
            else {
                this.currentState = null;
            }
            this.fire("currentStateChanged", this.currentState);
        },
        
        step: function () {
            var transition = this.currentState.getTransitionToFire();
            if (!transition) {
                this.world.pause();
                return this.world.actuators.map(function () { return "0"; });
            }
            else {
                this.currentState = transition.targetState;
                if (transition.sourceState !== transition.targetState) {
                    this.fire("currentStateChanged", this.currentState);
                }
                return transition.outputs;
            }
        }
    });
});
