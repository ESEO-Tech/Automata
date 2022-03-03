
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
        this.container.innerHTML = nunjucks.render("ScoreView-main.tpl.html", status);
        this.container.classList.add("visible");

        this.container.querySelector("button").addEventListener("click", () => this.hide());
    }

    hide() {
        this.container.classList.remove("visible");
    }
}
