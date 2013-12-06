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
         * Each source must implement methods fromStorable end toStorable
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
                        this.sources[key].fromStorable(JSON.parse(globals.localStorage[key]), this.mapping);
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
         * Save the given source to the data store.
         * If no source is specified, all sources are saved.
         */
        save: function (source) {
            if (supportsLocalStorage()) {
                for (var key in this.sources) {
                    if (typeof source === "undefined" || this.sources[key] === source) {
                        console.log("Saving: " + key);
                        globals.localStorage[key] = JSON.stringify(source.toStorable());
                    }
                }
            }
        },
        
        toBlobURL: function () {
            var data = {};
            for (var key in this.sources) {
                data[key] = this.sources[key].toStorable();
            }
            var blob = new Blob([JSON.stringify(data)], {type: "application/json"});
            return URL.createObjectURL(blob);
        }
    });
});
