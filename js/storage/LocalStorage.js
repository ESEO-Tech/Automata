
import {CoreObject} from "./Object.js";

function supportsLocalStorage() {
    try {
        return "localStorage" in env && env.localStorage !== null;
    }
    catch(e){
        return false;
    }
}

/**
 * @class LocalStorage
 * @memberof automata.storage
 *
 * @todo Add documentation
 */
export const LocalStorage = CoreObject.create({

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
            var sourceIndex;
            var sourcesLength = this.sources.length;

            for (sourceIndex = 0; sourceIndex < sourcesLength; sourceIndex ++) {
                this.sources[sourceIndex].source.removeListener("changed", this.save, this);
            }

            for (sourceIndex = 0; sourceIndex < sourcesLength; sourceIndex ++) {
                var item = this.sources[sourceIndex];
                if (item.key in env.localStorage) {
                    console.log("Loading: " + item.key);
                    item.source.fromStorable(JSON.parse(env.localStorage[item.key]), this.mapping);
                    success = true;
                }
            }

            for (sourceIndex = 0; sourceIndex < sourcesLength; sourceIndex ++) {
                this.sources[sourceIndex].source.addListener("changed", this.save, this);
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
            for (var sourceIndex = 0, sourcesLength = this.sources.length; sourceIndex < sourcesLength; sourceIndex ++) {
                var item = this.sources[sourceIndex];
                if (typeof source === "undefined" || item.source === source) {
                    console.log("Saving: " + item.key);
                    env.localStorage[item.key] = JSON.stringify(source.toStorable());
                }
            }
        }
    },

    toJSON: function () {
        var data = {};
        for (var sourceIndex = 0, sourcesLength = this.sources.length; sourceIndex < sourcesLength; sourceIndex ++) {
            var item = this.sources[sourceIndex];
            data[item.key] = item.source.toStorable();
        }
        return JSON.stringify(data);
    },

    fromJSON: function (json) {
        var data = JSON.parse(json);

        var sourceIndex;
        var sourcesLength = this.sources.length;

        for (sourceIndex = 0; sourceIndex < sourcesLength; sourceIndex ++) {
            this.sources[sourceIndex].source.removeListener("changed", this.save, this);
        }
        for (sourceIndex = 0; sourceIndex < sourcesLength; sourceIndex ++) {
            var item = this.sources[sourceIndex];
            if (item.key in data) {
                console.log("Importing: " + item.key);
                item.source.fromStorable(data[item.key], this.mapping);
            }
        }
        for (sourceIndex = 0; sourceIndex < sourcesLength; sourceIndex ++) {
            this.sources[sourceIndex].source.addListener("changed", this.save, this);
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
        return env.btoa(env.unescape(encodeURIComponent(this.toJSON())));
    },

    fromBase64: function (base64) {
        return this.fromJSON(decodeURIComponent(env.escape(env.atob(base64))));
    }
});
