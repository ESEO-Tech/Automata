/** @namespace automata */

/**
 * @namespace model
 * @memberof automata
 */
namespace("automata.model", function (exports, env) {
    "use strict";

    /**
     * The number of objects created so far.
     *
     * This counter is used for computing unique object ids.
     *
     * @memberof automata.model
     * @private
     * @type {!number}
     */
    var creationCount = 0;
    
    /**
     * @class Object
     * @memberof automata.model
     *
     * @abstract
     */
    exports.Object = {
        /**
         * Initialize the current object.
         *
         * @memberof automata.model.Object
         *
         * @return {automata.model.Object} The current object.
         */
        init: function () {
            this.listeners = {};
            this.id = String(creationCount);
            creationCount ++;
            return this;
        },
        
        /**
         * Create a new object with the current object as prototype.
         *
         * Optionally augment the new Object with the given properties
         * (see {@link automata.model.Object#augment}).
         *
         * @memberof automata.model.Object
         *
         * @param {Object} [properties] - An object with the properties to add to the new object.
         * @return {automata.model.Object} The new object.
         */
        create: function (properties) {
            return Object.create(this).augment(properties || {});
        },
        
        /**
         * The prototype of the current object.
         *
         * @memberof automata.model.Object
         *
         * @type {Object|automata.model.Object}
         */
        get proto() {
            return Object.getPrototypeOf(this);
        },
        
        /**
         * Augment the current object with the properties of the given object.
         *
         * @memberof automata.model.Object
         *
         * @param {Object} [properties] - An object with the properties to add to the new object.
         * @return {automata.model.Object} The current object.
         */
        augment: function (properties) {
            for (var p in properties) {
                this[p] = properties[p];
            }
            return this;
        },
        
        /**
         * Convert the current object into an object suitable for storage.
         *
         * @memberof automata.model.Object
         * @abstract
         *
         * @return {Object} A storable representation of the current object.
         */
        toStorable: function () {
            return {};
        },
        
        /**
         * Initialize the current object from the given storable object.
         *
         * @memberof automata.model.Object
         * @abstract
         *
         * @param {!Object} obj - A storable representation of the current object.
         * @return {automata.model.Object} The current object.
         */
        fromStorable: function (obj) {
            return this;
        },
        
        /**
         * Add a listener for a given event.
         *
         * The example below shows three usage scenarios for this method.
         *
         * ```
         * model.addListener("anEvent", aFunction, anObject);
         * model.fire("anEvent", ...) -> anObject.aFunction(model, ...);
         *
         * model.addListener("anEvent", anObject);
         * model.fire("anEvent", ...) -> anObject.anEvent(model, ...);
         *
         * model.addListener("anEvent", aFunction);
         * model.fire("anEvent", ...) -> aFunction(model, ...);
         * ```
         *
         * @memberof automata.model.Object
         *
         * @param {string}   event      - The name of the event to listen.
         * @param {function} [callback] - The function to call when the event is fired (defaults to the function that matches the event name in the callback receiver).
         * @param {Object}   [receiver] - The context object of the callback (defaults to the global object).
         * @return {automata.model.Object} The current object.
         */
        addListener: function (event, a, b) {
            if (!(event in this.listeners)) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(this.makeListenerRecord(event, a, b));
            return this;
        },
        
        /**
         * Remove a listener for a given event.
         *
         * This method accepts the same arguments as {@link automata.model.Object#addListener}.
         *
         * @memberof automata.model.Object
         *
         * @param {string}   event      - The name of the event to listen.
         * @param {function} [callback] - The function to call when the event is fired (defaults to the function that matches the event name in the callback receiver).
         * @param {Object}   [receiver] - The context object of the callback (defaults to the global object).
         * @return {automata.model.Object} The current object.
         */
        removeListener: function (event, a, b) {
            if (event in this.listeners) {
                var listeners = this.listeners[event];
                var record = this.makeListenerRecord(event, a, b);
                for (var i = 0; i < listeners.length;) {
                    if (listeners[i].callback === record.callback && listeners[i].receiver === record.receiver) {
                        listeners.splice(i, 1);
                    }
                    else {
                        i ++;
                    }
                }
            }
            return this;
        },
        
        /**
         * Fire an event.
         *
         * @memberof automata.model.Object
         *
         * @param {string} event - The name of the event to fire.
         * @return {automata.model.Object} The current object.
         */
        fire: function (event) {
            if (event in this.listeners) {
                var listeners = this.listeners[event];
                var args = Array.prototype.slice.call(arguments, 1);
                args.unshift(this);
                for (var i = 0; i < listeners.length; i ++) {
                    var listener = listeners[i];
                    listener.callback.apply(listener.receiver, args);
                }
            }
            return this;
        },
        
        /**
         * Returns an event listener definition object.
         *
         * @memberof automata.model.Object
         * @private
         *
         * @param {string}   event      - The name of the event to listen.
         * @param {function} [callback] - The function to call when the event is fired (defaults to the function that matches the event name in the callback receiver).
         * @param {Object}   [receiver] - The context object of the callback (defaults to the global object).
         * @return {Object} A listener definition.
         */
        makeListenerRecord: function (event, a, b) {
            if (typeof b === "undefined") {
                if (typeof a === "function") {
                    return {
                        callback: a,
                        receiver: env
                    };
                }
                else {
                    return {
                        callback: a[event],
                        receiver: a
                    };
                }
            }
            else {
                return {
                    callback: a,
                    receiver: b
                };
            }
        }
    };
});
