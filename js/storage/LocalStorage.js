namespace(this, "automata.storage", function (exports, globals) {
    
    function supportsLocalStorage() {
        try {
            return "localStorage" in globals && globals.localStorage !== null;
        }
        catch(e){
            return false;
        }
    }
        
    exports.LocalStorage = {
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

        load: function () {
            if (supportsLocalStorage()) {
                for (var key in this.sources) {
                    this.sources[key].removeListener("changed", this.save, this);
                }
                for (key in this.sources) {
                    if (key in globals.localStorage) {
                        console.log("Loading: " + key);
                        this.sources[key].fromObject(JSON.parse(globals.localStorage[key]), this.mapping);
                    }
                }
                for (key in this.sources) {
                    this.sources[key].addListener("changed", this.save, this);
                }
            }
        },
        
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
    };
});
