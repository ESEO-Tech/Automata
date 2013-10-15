
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
            
            if (_.isUndefined(b)) {
                if (_.isFunction(a)) {
                    this.listeners[event].push({
                        callback: a,
                        receiver: globals
                    });
                }
                else {
                    this.listeners[event].push({
                        callback: a[event],
                        receiver: a
                    });
                }
            }
            else {
                this.listeners[event].push({
                    callback: a,
                    receiver: b
                });
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
                _.each(this.listeners[event], function (listener) {
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
