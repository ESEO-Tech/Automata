
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
        var self = this;
        $("button", this.container).click(function () {
            self.hide();
        });
    }

    show() {
        this.container.attr("class", "visible");
    }

    hide() {
        this.container.removeClass("visible");
    }
}
