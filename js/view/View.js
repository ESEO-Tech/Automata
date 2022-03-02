
import {CoreObject} from "../model/Object.js";

/**
 * @class View
 * @memberof automata.view
 *
 * @abstract
 *
 * @todo Add documentation
 */
export class View extends CoreObject {
    constructor(model, container) {
        super();
        this.model = model;
        this.container = container;
        this.render();
    }

    render() {
        // Abstract
    }
}
