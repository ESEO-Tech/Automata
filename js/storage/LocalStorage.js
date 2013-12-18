
namespace("automata.storage", function (exports, env) {
    
    function supportsLocalStorage() {
        try {
            return "localStorage" in env && env.localStorage !== null;
        }
        catch(e){
            return false;
        }
    }
        
    exports.LocalStorage = automata.model.Object.create({
        
        /*
         * Configure a data storage.
         */
        init: function() {
            // this.sources is an array to enforce ordering during load operations
            this.sources = [];
            this.mapping = {};
            return this;
        },

        addSource: function (key, source) {
            this.sources.push({key: key, source: source});
            source.addListener("changed", this.save, this);
            return this;
        },
        
        /*
         * Load all sources from the data store.
         * Returns true on success.
         */
        load: function () {
            var success = false;
            if (supportsLocalStorage()) {
                forEach (item of this.sources) {
                    item.source.removeListener("changed", this.save, this);
                }
                forEach (item of this.sources) {
                    if (item.key in env.localStorage) {
                        console.log("Loading: " + item.key);
                        item.source.fromStorable(JSON.parse(env.localStorage[item.key]), this.mapping);
                        success = true;
                    }
                }
                forEach (item of this.sources) {
                    item.source.addListener("changed", this.save, this);
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
                forEach (item of this.sources) {
                    if (typeof source === "undefined" || item.source === source) {
                        console.log("Saving: " + item.key);
                        env.localStorage[item.key] = JSON.stringify(source.toStorable());
                    }
                }
            }
        },
        
        toJSON: function () {
            var data = {};
            forEach (item of this.sources) {
                data[item.key] = item.source.toStorable();
            }
            return JSON.stringify(data);
        },
        
        fromJSON: function (json) {
            var data = JSON.parse(json);
            forEach (item of this.sources) {
                item.source.removeListener("changed", this.save, this);
            }
            forEach (item of this.sources) {
                if (item.key in data) {
                    console.log("Importing: " + item.key);
                    item.source.fromStorable(data[item.key], this.mapping);
                }
            }
            forEach (item of this.sources) {
                item.source.addListener("changed", this.save, this);
            }
            return this;
        },
        
        toBlobURL: function () {
            var blob = new Blob([this.toJSON()], {type: "application/json"});
            return URL.createObjectURL(blob);
        },
        
        fromFile: function (file) {
            var reader = new FileReader();
            var self = this;
            reader.onload = function () {
                self.fromJSON(this.result);
            };
            
            reader.readAsText(file);
            return this;
        },
        
        toBase64: function () {
            return env.btoa(unescape(encodeURIComponent(this.toJSON())));
        },
        
        fromBase64: function (base64) {
            return this.fromJSON(decodeURIComponent(escape(env.atob(base64))));
        }
    });
});
