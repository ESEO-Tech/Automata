
import {View} from "./View.js";

/**
 * @class HelpView
 * @memberof automata.view
 *
 * @todo Add documentation
 */
export class HelpView extends View {
    constructor(model, container) {
        super(model, container);

        model.addListener("help", this.show, this);
    }

    render() {
        this.container.querySelector("button").addEventListener("click", () => this.hide());
    }

    show() {
        this.container.classList.add("visible");
    }

    hide() {
        this.container.classList.remove("visible");
    }
}
