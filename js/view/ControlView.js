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
            
            return this;
        },
        
        render: function () {
            $(this.templates.main(this.model)).appendTo(this.container);
            
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
        },
        
        start: function () {
            this.playButton.addClass("running").val("u");
        },
        
        pauseOrStop: function () {
            this.playButton.removeClass("running").val("P");
        }
    });
});
