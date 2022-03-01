
import {View} from "./View.js";

/**
 * @class ScoreView
 * @memberof automata.view
 *
 * @todo Add documentation
 */
export const ScoreView = View.create().augment({

    init: function (model, container) {
        View.init.call(this, model, container);

        model.addListener("done", this.show, this);

        return this;
    },

    show: function (world, status) {
        this.container.empty();
        $(this.renderTemplate("ScoreView-main.tpl.html", status)).appendTo(this.container);
        this.container.attr("class", "visible");

        var self = this;
        $("button", this.container).click(function () {
            self.hide();
        });
    },

    hide: function () {
        this.container.removeClass("visible");
    }
});
