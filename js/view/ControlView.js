namespace(this, "automata.view", function (exports) {
    "use strict";

    exports.ControlView = Object.create(exports.View).augment({
        templates: {
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
            var entering = this.panes.pop();
            $(entering).attr("class", "entering-left-pane");
            this.panes.unshift(entering);

            var self = this;
            setTimeout(function () {
                $(self.panes[0]).attr("class", "left-pane");
                $(self.panes[1]).attr("class", "right-pane");
                $(self.panes[2]).attr("class", "leaving-right-pane");
            }, 20);
        },
        
        moveRight: function () {
            $(this.panes[2]).attr("class", "entering-right-pane");
            this.panes.push(this.panes.shift());
            
            var self = this;
            setTimeout(function () {
                $(self.panes[0]).attr("class", "left-pane");
                $(self.panes[1]).attr("class", "right-pane");
                $(self.panes[2]).attr("class", "leaving-left-pane");
            }, 20);
        }
    });
});
