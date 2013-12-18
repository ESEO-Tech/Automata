namespace("automata.view", function (exports) {
    "use strict";

    exports.ControlView = exports.View.create().augment({
        init: function (model, container) {
            exports.View.init.call(this, model, container);
            
            model.addListener("start", this.start, this)
                 .addListener("pause", this.pauseOrStop, this)
                 .addListener("stop",  this.pauseOrStop, this);
            
            this.panes = ["#world-view", "#table-view", "#diagram-view"];
            
            return this;
        },
        
        render: function () {
            this.playButton = $("#control-play", this.container);
            
            var self = this;
            this.playButton.click(function () {
                if (self.model.isRunning) {
                    self.model.pause();
                }
                else {
                    self.updateTimeStep()
                    self.model.start();
                }
            });
            
            $("#control-stop", this.container).click(function () {
                self.model.stop();
            });
            
            $("#control-left", this.container).click(function () {
                self.moveLeft();
            });
            
            $("#control-right", this.container).click(function () {
                self.moveRight();
            });
            
            $("#control-speed", this.container)
                .val(10 - 10 * (this.model.timeStep - this.model.timeStepMin) / (this.model.timeStepMax - this.model.timeStepMin))
                .change(function () {
                    self.updateTimeStep();
                });
            
            $("#control-help", this.container).click(function () {
                self.model.fire("help");
            });
        },
        
        start: function () {
            this.playButton.addClass("running").val("u");
        },
        
        pauseOrStop: function () {
            this.playButton.removeClass("running").val("P");
        },
        
        updateTimeStep: function () {
            var value = parseInt($("#control-speed", this.container).val())
            this.model.timeStep = this.model.timeStepMin + (this.model.timeStepMax - this.model.timeStepMin) * (10 - value) / 10 ;
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
