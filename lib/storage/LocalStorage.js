
function supportsLocalStorage() {
    try {
        return "localStorage" in window && window.localStorage !== null;
    }
    catch(e){
        return false;
    }
}

// sources is an array to enforce ordering during load operations.
const sources = [];

const mapping = {};

export function addSource(key, model) {
    sources.push({key, model});
    model.addListener("changed", save);
}

function addListeners() {
    for (const src of sources) {
        src.model.addListener("changed", save);
    }
}

function removeListeners() {
    for (const src of sources) {
        src.model.removeListener("changed", save);
    }
}

/*
 * Load all sources from the data store.
 * Returns true on success.
 */
export function load() {
    if (!supportsLocalStorage()) {
        return false;
    }

    let success = false;

    removeListeners();

    for (const src of sources) {
        if (src.key in window.localStorage) {
            console.log("Loading: " + src.key);
            src.model.fromStorable(JSON.parse(window.localStorage[src.key]), mapping);
            success = true;
        }
    }

    addListeners();

    return success;
}

/*
 * Save the given model to the data store.
 * If no model is specified, all sources are saved.
 */
export function save(model) {
    if (!supportsLocalStorage()) {
        return;
    }

    for (const src of sources) {
        if (!model || src.model === model) {
            console.log("Saving: " + src.key);
            window.localStorage[src.key] = JSON.stringify(model.toStorable());
        }
    }
}

export function toJSON() {
    const data = {};
    for (const src of sources) {
        data[src.key] = src.model.toStorable();
    }
    return JSON.stringify(data);
}

export function fromJSON(json) {
    const data = JSON.parse(json);

    removeListeners();

    for (const src of sources) {
        if (src.key in data) {
            console.log("Importing: " + src.key);
            src.model.fromStorable(data[src.key], mapping);
        }
    }

    addListeners();
}

export function toBlobURL() {
    const blob = new Blob([toJSON()], {type: "application/json"});
    return URL.createObjectURL(blob);
}

export function fromFile(file) {
    const reader = new FileReader();
    reader.onload = evt => this.fromJSON(evt.target.result);
    reader.readAsText(file);
}

export function toBase64() {
    return btoa(unescape(encodeURIComponent(toJSON())));
}

export function fromBase64(base64) {
    return fromJSON(decodeURIComponent(escape(atob(base64))));
}
