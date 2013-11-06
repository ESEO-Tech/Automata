namespace(this, "automata.view", function (exports, globals) {
    "use strict";

    exports.ControlView = Object.create(exports.View).augment({
        templateFiles: {
            main: "templates/ControlView-main.tpl.html"
        },
        
        init: function (model, container) {
            exports.View.init.call(this, model, container);
            
            model.addListener("start", this.start, this)
                 .addListener("pause", this.pauseOrStop, this)
                 .addListener("stop",  this.pauseOrStop, this);
            
            this.panes = ["#world-view", "#table-view", "#diagram-view"];
            
            return this;
        },
        
        render: function () {
            $(this.renderTemplate("main", this.model)).appendTo(this.container);
            
            this.playButton = $("#control-play", this.container);
            
            var model = this.model;
            this.playButton.click(function () {
                if (model.isRunning) {
                    model.pause();
                }
                else {
                    model.start();
                }
            });
            
            $("#control-stop", this.container).click(function () {
                model.stop();
            });
            
            var self = this;
            $("#control-left", this.container).click(function () {
                self.moveLeft();
            });
            
            $("#control-right", this.container).click(function () {
                self.moveRight();
            });
        },
        
        start: function () {
            this.playButton.addClass("running").val("u");
        },
        
        pauseOrStop: function () {
            this.playButton.removeClass("running").val("P");
        },
        
        moveLeft: function () {
            this.panes.unshift(this.panes.pop());
            this.updatePanes();
        },
        
        moveRight: function () {
            this.panes.push(this.panes.shift());
            this.updatePanes();
        },
        
        updatePanes: function () {
            $(this.panes[0]).css({left: "0", visibility: "visible"});
            $(this.panes[1]).css({left: "50%", visibility: "visible"});
            $(this.panes[2]).css("visibility", "hidden");
        }
    });
});
