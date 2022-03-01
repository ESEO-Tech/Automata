
import {CoreObject} from "../model/Object.js";

/**
 * @class View
 * @memberof automata.view
 *
 * @abstract
 *
 * @todo Add documentation
 */
export const View = CoreObject.create({

    init: function (model, container) {
        CoreObject.init.call(this);

        this.model = model;

        if (container) {
            this.container = container;
        }

        this.render();

        return this;
    },

    render: function () {
        // Abstract
    },

    renderTemplate: function (name, context) {
        return nunjucks.render(`templates/${name}`, context);
    }
});
