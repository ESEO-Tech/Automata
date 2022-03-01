
/**
 * The number of objects created so far.
 *
 * This counter is used for computing unique object ids.
 *
 * @memberof automata.model
 * @private
 * @type {!number}
 */
let creationCount = 0;

/**
 * Base object.
 *
 * This object provides the following features:
 *
 *    - Unique ids.
 *    - Helpers for prototype-based inheritance.
 *    - Event handling.
 *
 * @class CoreObject
 * @memberof automata.model
 *
 * @abstract
 */
export class CoreObject {
    /**
     * Initialize the current object.
     *
     * @memberof CoreObject
     *
     * @return {CoreObject} The current object.
     */
    constructor() {
        this.listeners = {};
        this.id = String(creationCount);
        creationCount ++;
    }

    /**
     * Convert the current object into an object suitable for storage.
     *
     * @memberof CoreObject
     * @abstract
     *
     * @return {CoreObject} A storable representation of the current object.
     */
    toStorable() {
        return {};
    }

    /**
     * Initialize the current object from the given storable object.
     *
     * @memberof CoreObject
     * @abstract
     *
     * @param {!CoreObject} obj - A storable representation of the current object.
     * @return {CoreObject} The current object.
     */
    fromStorable(obj) {
        return this;
    }

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
     * @memberof CoreObject
     *
     * @param {string}   event      - The name of the event to listen.
     * @param {function} [callback] - The function to call when the event is fired (defaults to the function that matches the event name in the callback receiver).
     * @param {CoreObject}   [receiver] - The context object of the callback (defaults to the global object).
     * @return {CoreObject} The current object.
     */
    addListener(event, a, b) {
        if (!(event in this.listeners)) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(this.makeListenerRecord(event, a, b));
        return this;
    }

    /**
     * Remove a listener for a given event.
     *
     * This method accepts the same arguments as {@link CoreObject#addListener}.
     *
     * @memberof CoreObject
     *
     * @param {string}   event      - The name of the event to listen.
     * @param {function} [callback] - The function to call when the event is fired (defaults to the function that matches the event name in the callback receiver).
     * @param {CoreObject}   [receiver] - The context object of the callback (defaults to the global object).
     * @return {CoreObject} The current object.
     */
    removeListener(event, a, b) {
        if (event in this.listeners) {
            var listeners = this.listeners[event];
            var record = this.makeListenerRecord(event, a, b);
            for (var i = 0, l = listeners.length; i < l;) {
                if (listeners[i].callback === record.callback && listeners[i].receiver === record.receiver) {
                    listeners.splice(i, 1);
                    l --;
                }
                else {
                    i ++;
                }
            }
        }
        return this;
    }

    /**
     * Fire an event.
     *
     * @memberof CoreObject
     *
     * @param {string} event - The name of the event to fire.
     * @return {CoreObject} The current object.
     */
    fire(event) {
        if (event in this.listeners) {
            var listeners = this.listeners[event];
            var args = Array.prototype.slice.call(arguments, 1);
            args.unshift(this);
            for (var i = 0, l = listeners.length; i < l; i ++) {
                var listener = listeners[i];
                listener.callback.apply(listener.receiver, args);
            }
        }
        return this;
    }

    /**
     * Returns an event listener definition object.
     *
     * @memberof CoreObject
     * @private
     *
     * @param {string}   event      - The name of the event to listen.
     * @param {function} [callback] - The function to call when the event is fired (defaults to the function that matches the event name in the callback receiver).
     * @param {CoreObject}   [receiver] - The context object of the callback (defaults to the global object).
     * @return {CoreObject} A listener definition.
     */
    makeListenerRecord(event, a, b) {
        if (typeof b === "undefined") {
            if (typeof a === "function") {
                return {
                    callback: a,
                    receiver: window
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
}
