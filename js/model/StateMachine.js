
import {CoreObject} from "./Object.js";
import {State}      from "./State.js";
import {Transition} from "./Transition.js";

/**
 * @class StateMachine
 * @memberof automata.model
 *
 * @todo Add documentation
 */
export class StateMachine extends CoreObject {
    constructor(world) {
        super();

        this.world = world;

        this.states = [];
        this.statesById = {};

        this.transitions = [];
        this.transitionsById = {};

        this.reset();
    }

    toStorable() {
        const result = {
            states: {},
            transitions: {}
        };
        for (const sid in this.statesById) {
            result.states[sid] = this.statesById[sid].toStorable();
        }
        for (const tid in this.transitionsById) {
            result.transitions[tid] = this.transitionsById[tid].toStorable();
        }
        return result;
    }

    fromStorable(obj, mapping) {
        for (const sid in obj.states) {
            mapping[sid] = this.createState().fromStorable(obj.states[sid]);
        }
        for (const tid in obj.transitions) {
            const tobj = obj.transitions[tid];
            mapping[tid] = this.createTransition(mapping[tobj.sourceStateId], mapping[tobj.targetStateId]).fromStorable(tobj);
        }
        return this;
    }

    getStateVars() {
        if (this.world.solution && this.world.solution.stateVars) {
            return this.world.solution.stateVars;
        }
        else {
            return [];
        }
    }

    createState() {
        const state = new State(this);
        this.states.push(state);
        this.statesById[state.id] = state;

        state.addListener("changed", function () {
            this.fire("changed");
        }, this);

        this.fire("createState", state);
        this.fire("changed");

        return state;
    }

    removeState(state) {
        this.fire("beforeRemoveState", state);

        const index = this.states.indexOf(state);
        if (index === 0) {
            this.world.stop();
        }

        state.destroy();
        this.states.splice(index, 1);
        delete this.statesById[state.id];

        this.fire("afterRemoveState", state);
        this.fire("changed");

        return this;
    }

    createTransition(sourceState, targetState) {
        const transition = new Transition(sourceState, targetState);
        this.transitions.push(transition);
        this.transitionsById[transition.id] = transition;

        transition.addListener("changed", function () {
            this.fire("changed");
        }, this);

        this.fire("createTransition", transition);
        this.fire("changed");

        return transition;
    }

    removeTransition(transition) {
        this.fire("beforeRemoveTransition", transition);

        transition.destroy();
        this.transitions.splice(this.transitions.indexOf(transition), 1);
        delete this.transitionsById[transition.id];

        this.fire("afterRemoveTransition", transition);
        this.fire("changed");

        return this;
    }

    reset() {
        if (this.states.length) {
            this.currentState = this.states[0];
        }
        else {
            this.currentState = null;
        }
        this.fire("currentStateChanged", this.currentState);
    }

    step() {
        const transition = this.currentState.getTransitionToFire();
        if (transition) {
            this.currentState = transition.targetState;
            if (transition.sourceState !== transition.targetState) {
                this.fire("currentStateChanged", this.currentState);
            }
            return transition.outputs;
        }
        return this.world.actuators.map(() => "0");
    }
}
