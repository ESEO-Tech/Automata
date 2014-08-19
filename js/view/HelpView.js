/** @namespace automata */

/**
 * @namespace view
 * @memberof automata
 */
namespace("automata.view", function (exports) {
    "use strict";

    /**
     * @class HelpView
     * @memberof automata.view
     *
     * @todo Add documentation
     */
    exports.HelpView = exports.View.create().augment({
        init: function (model, container) {
            exports.View.init.call(this, model, container);
            
            model.addListener("help", this.show, this);
            
            return this;
        },
        
        render: function () {
            var self = this;
            $("button", this.container).click(function () {
                self.hide();
            });
        },
        
        show: function () {
            this.container.attr("class", "visible");
        },
        
        hide: function () {
            this.container.removeClass("visible");
        }
    });
});
