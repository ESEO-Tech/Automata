
namespace(this, "automata.model", function (exports, globals) {
    "use strict";

    exports.StateMachine = Object.create(exports.Model).augment({
        init: function (world, stateVars) {
            exports.Model.init.call(this);
            
            this.world = world;
            this.stateVars = stateVars || [];
            
            this.states = [];
            this.statesById = {};
            
            this.transitions = [];
            this.transitionsById = {};
            
            return this;
        },
        
        createState: function () {
            var state = Object.create(exports.State).init(this);
            this.states.push(state);
            this.statesById[state.id] = state;
            
            this.fire("createState", state);
            
            return this;
        },
        
        removeState: function (state) {
            this.fire("beforeRemoveState", state);
            
            state.destroy();
            this.states.splice(this.states.indexOf(state), 1);
            delete this.statesById[state.id];
            
            this.fire("afterRemoveState", state);
            
            return this;
        },
    
        createTransitionFromState: function (state) {
            var transition = Object.create(exports.Transition).init(state, state);
            this.transitions.push(transition);
            this.transitionsById[transition.id] = transition;
            
            this.fire("createTransition", transition);
            
            return this;
        },
        
        removeTransition: function (transition) {
            this.fire("beforeRemoveTransition", transition);
            
            transition.destroy();
            this.transitions.splice(this.transitions.indexOf(transition), 1);
            delete this.transitionsById[transition.id];
            
            this.fire("afterRemoveTransition", transition);
            
            return this;
        }
    });
});
