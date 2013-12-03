namespace(this, "automata.storage", function (exports, globals) {
    
    function supportsLocalStorage() {
        try {
            return "localStorage" in globals && globals.localStorage !== null;
        }
        catch(e){
            return false;
        }
    }
        
    exports.LocalStorage = automata.model.Object.create({
        
        /*
         * Configure a data storage with the given sources.
         * Each source must implement methods fromObject end toObject
         * as defined in automata.model.Object
         */
        init: function(sources) {
            this.sources = sources;
            this.mapping = {};
            
            if (supportsLocalStorage()) {
                for (var key in sources) {
                    sources[key].addListener("changed", this.save, this);
                }
            }
            else {
                throw "HTML5 storage not supported.";
            }
            return this;
        },

        /*
         * Load all sources from the data store.
         * Returns true on success.
         */
        load: function () {
            var success = false;
            if (supportsLocalStorage()) {
                for (var key in this.sources) {
                    this.sources[key].removeListener("changed", this.save, this);
                }
                for (key in this.sources) {
                    if (key in globals.localStorage) {
                        console.log("Loading: " + key);
                        this.sources[key].fromObject(JSON.parse(globals.localStorage[key]), this.mapping);
                        success = true;
                    }
                }
                for (key in this.sources) {
                    this.sources[key].addListener("changed", this.save, this);
                }
            }
            return success;
        },
        
        /*
         * Save all sources to the data store.
         */
        save: function (source) {
            if (supportsLocalStorage()) {
                for (var key in this.sources) {
                    if (this.sources[key] === source) {
                        console.log("Saving: " + key);
                        globals.localStorage[key] = JSON.stringify(source.toObject());
                    }
                }
            }
        }
    });
});
