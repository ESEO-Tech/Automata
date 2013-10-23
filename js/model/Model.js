
namespace(this, "automata.model", function (exports, globals) {
    "use strict";

    var creationCount = 0;
    
    exports.Model = {
        init: function () {
            this.listeners = {};
            this.id = String(creationCount);
            creationCount ++;
            return this;
        },
        
        createListenerRecord: function (event, a, b) {
            if (_.isUndefined(b)) {
                if (_.isFunction(a)) {
                    return {
                        callback: a,
                        receiver: globals
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
        },
        
        /*
         * Add a listener for a given event.
         *
         * model.addListener("anEvent", aFunction, anObject);
         *    emitter.fire("anEvent", ...) -> anObject.aFunction(emitter, ...);
         *
         * model.addListener("anEvent", anObject);
         *    emitter.fire("anEvent", ...) -> anObject.anEvent(emitter, ...);
         *
         * model.addListener("anEvent", aFunction);
         *    emitter.fire("anEvent", ...) -> aFunction(emitter, ...);
         */
        addListener: function (event, a, b) {
            if (!(event in this.listeners)) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(this.createListenerRecord(event, a, b));
            return this;
        },
        
        removeListener: function (event, a, b) {
            if (event in this.listeners) {
                var listeners = this.listeners[event];
                var record = this.createListenerRecord(event, a, b);
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
        
        /*
         * Fire an event.
         *
         * fire("anEvent", ...) -> receiver.callback(emitter, ...)
         */
        fire: function (event) {
            if (event in this.listeners) {
                var args = Array.prototype.slice.call(arguments, 1);
                args.unshift(this);
                this.listeners[event].forEach(function (listener) {
                    listener.callback.apply(listener.receiver, args);
                });
            }
            return this;
        },
        
        augment: function (properties) {
            for (var p in properties) {
                this[p] = properties[p];
            }
            return this;
        }
    };
});
