
namespace("automata.view", function (exports) {
    "use strict";

    exports.ScoreView = exports.View.create().augment({
        templates: {
            main: "templates/ScoreView-main.tpl.html"
        },
        
        init: function (model, container) {
            exports.View.init.call(this, model, container);
            
            model.addListener("done", this.show, this);
            
            return this;
        },
        
        show: function (world, status) {
            this.container.empty();
            $(this.renderTemplate("main", status)).appendTo(this.container);
            this.container.attr("class", "visible");
            
            var self = this;
            $("input[value='X']", this.container).click(function () {
                self.hide();
            });
        },
        
        hide: function () {
            this.container.removeClass("visible");
        }
    });
});
