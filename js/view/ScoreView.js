
import {View} from "./View.js";

/**
 * @class ScoreView
 * @memberof automata.view
 *
 * @todo Add documentation
 */
export class ScoreView extends View {
    constructor(model, container) {
        super(model, container);

        model.addListener("done", this.show, this);
    }

    show(world, status) {
        this.container.empty();
        $(this.renderTemplate("ScoreView-main.tpl.html", status)).appendTo(this.container);
        this.container.attr("class", "visible");

        $("button", this.container).click(() => this.hide());
    }

    hide() {
        this.container.removeClass("visible");
    }
}
