namespace(this, "automata.view", function (exports, globals) {
    "use strict";

    exports.View = Object.create(automata.model.Model).augment({
        templateFiles: {},
        
        init: function (model, container) {
            automata.model.Model.init.call(this);

            this.model = model;
            
            if (container) {
                this.container = container;
            }
            
            if (!this.templates) {
                this.loadTemplates();
            }
            
            var self = this;
            this.deferredRender = this.deferredLoad.done(function () {
                self.container.empty();
                self.render();
            });
            
            return this;
        },

        render: function () {
            // Abstract
        },
        
        ready: function () {
            return this.deferredRender;
        },
        
        loadTemplates: function () {
            var self = this;
            var promises = [];
            this.templates = {};
            Object.keys(this.templateFiles).forEach(function (name) {
                promises.push($.ajax(self.templateFiles[name], {dataType: "text"})
                    .done(function (resp) {
                        self.templates[name] = resp;
                    })
                    .fail(function (xhr, status, error) {
                        throw "Failed to load template '" + name + "' " + error;
                    }));                
            });
            this.deferredLoad = $.when.apply($, promises);
            return this;
        },
        
        renderTemplate: function (name, context) {
            return nunjucks.renderString(this.templates[name], context);
        }
    });
});
