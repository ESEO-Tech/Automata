
namespace("automata.view", function (exports) {
    "use strict";

    exports.View = automata.model.Object.create({
        templates: {},
        
        init: function (model, container) {
            automata.model.Object.init.call(this);

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
            return nunjucks.render(this.templates[name], context);
        }
    });
});
