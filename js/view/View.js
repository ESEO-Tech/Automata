namespace(this, "automata.view", function (exports, globals) {
    "use strict";

    exports.View = Object.create(automata.model.Model).augment({
        templateFiles: {},
        
        init: function (model, container) {
            automata.model.Model.init.call(this);

            this.model = model;
            this.container = container;
            this.templates = {};
            
            var self = this;
            this.promise = this.loadTemplates().done(function () {
                self.onLoad();
            });
            
            return this;
        },

        onLoad: function () {
            // Abstract
        },
        
        ready: function () {
            return this.promise;
        },
        
        loadTemplates: function () {
            var self = this;
            var promises = [];
            Object.keys(this.templateFiles).forEach(function (name) {
                promises.push($.ajax(self.templateFiles[name], {dataType: "text"})
                    .done(function (resp) {
                        self.templates[name] = _.template(resp);
                    })
                    .fail(function (xhr, status, error) {
                        throw "Failed to load template '" + name + "' " + error;
                    }));                
            });
            return $.when.apply($, promises);
        }
    });
});
