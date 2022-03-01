
import {CoreObject} from "Object.js";

/**
 * A state in a state machine.
 *
 * @class State
 * @memberof automata.model
 * @augments CoreObject
 */
export const State = CoreObject.create({
    /**
     * @event automata.model.State#changed
     */

    /**
     * Initialize a state.
     *
     * The current state is initialized with:
     *
     *    - A unique name in the given state machine.
     *    - A default encoding (all bits set to '0').
     *    - Empty incoming and outgoing transitions.
     *
     * @memberof automata.model.State
     *
     * @param {automata.model.StateMachine} stateMachine - The state machine that will contain the current state.
     * @return {automata.model.State} The current state.
     */
    init: function (stateMachine) {
        CoreObject.init.call(this);

        var suffix = this.id;
        do {
            this.name = "State" + suffix;
            suffix ++;
        } while(stateMachine.states.some(function (state) {
            return state.name === this.name;
        }, this));

        this.stateMachine = stateMachine;
        this.encoding = stateMachine.getStateVars().map(function () { return "0"; });

        this.outgoingTransitions = [];
        this.incomingTransitions = [];

        return this;
    },

    /**
     * @memberof automata.model.State
     * @see CoreObject.toStorable
     */
    toStorable: function () {
        return {
            name: this.name,
            encoding: this.encoding
        };
    },

    /**
     * @memberof automata.model.State
     * @see CoreObject.fromStorable
     * @fires automata.model.State#changed
     */
    fromStorable: function (obj) {
        this.name = obj.name;
        this.encoding = obj.encoding;
        this.fire("changed");
        return this;
    },

    /**
     * Prepare the removal of the current state from the state machine.
     *
     * This method removes all incoming and outgoing transitions from the current state.
     *
     * @memberof automata.model.State
     *
     * @return {automata.model.State} The current state.
     */
    destroy: function () {
        while (this.outgoingTransitions.length) {
            this.stateMachine.removeTransition(this.outgoingTransitions[0]);
        }
        while (this.incomingTransitions.length) {
            this.stateMachine.removeTransition(this.incomingTransitions[0]);
        }
        return this;
    },

    /**
     * Set the name of the current state.
     *
     * @memberof automata.model.State
     *
     * @param {string} name - The new name of the current state.
     * @return {automata.model.State} The current state.
     * @fires automata.model.State#changed
     */
    setName: function (name) {
        this.name = name;

        this.fire("changed");

        return this;
    },

    /**
     * Set one bit of the encoding of the current state.
     *
     * @memberof automata.model.State
     *
     * @param {number} index - The index of the bit to set.
     * @param {string} value - The new value of the bit to set.
     * @return {automata.model.State} The current state.
     * @fires automata.model.State#changed
     */
    setEncoding: function (index, value) {
        this.encoding[index] = value;

        this.fire("changed");

        return this;
    },

    /**
     * Add an outgoing transition to the current state.
     *
     * @memberof automata.model.State
     *
     * @param {automata.model.Transition} transition - The transition to add.
     * @return {automata.model.State} The current state.
     */
    addOutgoingTransition: function (transition) {
        this.outgoingTransitions.push(transition);
        return this;
    },

    /**
     * Remove an outgoing transition from the current state.
     *
     * @memberof automata.model.State
     *
     * @param {automata.model.Transition} transition - The transition to remove.
     * @return {automata.model.State} The current state.
     */
    removeOutgoingTransition: function (transition) {
        var index = this.outgoingTransitions.indexOf(transition);
        this.outgoingTransitions.splice(index, 1);
        return this;
    },

    /**
     * Add an incoming transition to the current state.
     *
     * @memberof automata.model.State
     *
     * @param {automata.model.Transition} transition - The transition to add.
     * @return {automata.model.State} The current state.
     */
    addIncomingTransition: function (transition) {
        this.incomingTransitions.push(transition);
    },

    /**
     * Remove an incoming transition from the current state.
     *
     * @memberof automata.model.State
     *
     * @param {automata.model.Transition} transition - The transition to remove.
     * @return {automata.model.State} The current state.
     */
    removeIncomingTransition: function (transition) {
        var index = this.incomingTransitions.indexOf(transition);
        this.incomingTransitions.splice(index, 1);
        return this;
    },

    /**
     * Find the transitions from the current state to a given state.
     *
     * @memberof automata.model.State
     *
     * @param {automata.model.State} state - The target state.
     * @return {Array.<automata.model.Transition>} The transitions found.
     */
    getTransitionsToState: function (state) {
        return this.outgoingTransitions.filter(function (transition) {
            return transition.targetState === state;
        });
    },

    /**
     * Find the actions in that state that do not depend on sensor values.
     *
     * This method will look up into all outgoing transitions from this state
     * and will collect the actuator names that fulfill one of the following conditions:
     *
     *    - The actuator has value '1' in all outgoing transitions.
     *    - The actuator has value '1' in at least one outgoing transition where all sensors have value '-'.
     *
     * @memberof automata.model.State
     *
     * @return {Array.<string>} An array of actuator names.
     */
    getMooreActions: function () {
        if (this.outgoingTransitions.length) {
            return this.stateMachine.world.actuators.filter(function (q, index) {
                return this.outgoingTransitions.every(function (transition) {
                    return transition.outputs[index] === "1";
                }) ||  this.outgoingTransitions.some(function (transition) {
                    return transition.outputs[index] === "1" &&
                        transition.inputs.every(function (value) {
                            return value === "-";
                        });
                });
            }, this).map(function (q) {
                return q.name;
            }, this);
        }
        else {
            return [];
        }
    },

    /**
     * Find the transition that can be fired at the current simulation step.
     *
     * This method will look up into all outgoing transitions and will return
     * the first one that can fire, or null if no transition is found.
     *
     * @memberof automata.model.State
     *
     * @return {?automata.model.Transition} The transition found.
     */
    getTransitionToFire: function () {
        for (var i = 0, l = this.outgoingTransitions.length; i < l; i ++) {
            var transition = this.outgoingTransitions[i];
            if (transition.canFire()) {
                return transition;
            }
        }
        return null;
    }
});
