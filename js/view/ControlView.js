
import {View} from "./View.js";

/**
 * @class ControlView
 * @memberof automata.view
 *
 * @todo Add documentation
 */
export class ControlView extends View {
    constructor(model, container) {
        super(model, container);

        model.addListener("start", this.start, this)
             .addListener("pause", this.pauseOrStop, this)
             .addListener("stop",  this.pauseOrStop, this);

        this.panes = ["#world-view", "#table-view", "#diagram-view"];
    }

    render() {
        this.playButton = $("#control-play", this.container);

        this.playButton.click(() => {
            if (this.model.isRunning) {
                this.model.pause();
            }
            else {
                this.updateTimeStep();
                this.model.start();
            }
        });

        $("#control-stop", this.container).click(() => {
            this.model.stop();
        });

        $("#control-left", this.container).click(() => {
            this.moveLeft();
        });

        $("#control-right", this.container).click(() => {
            this.moveRight();
        });

        $("#control-speed", this.container)
            .val(10 - 10 * (this.model.timeStep - this.model.timeStepMin) / (this.model.timeStepMax - this.model.timeStepMin))
            .change(() => {
                this.updateTimeStep();
            });

        $("#control-help", this.container).click(() => {
            this.model.fire("help");
        });
    }

    start() {
        this.playButton.addClass("running").html('<i class="fa fa-pause"></i>');
    }

    pauseOrStop() {
        this.playButton.removeClass("running").html('<i class="fa fa-play"></i>');
    }

    updateTimeStep() {
        const value = parseInt($("#control-speed", this.container).val());
        this.model.timeStep = this.model.timeStepMin + (this.model.timeStepMax - this.model.timeStepMin) * (10 - value) / 10 ;
    }

    moveLeft() {
        const entering = this.panes.pop();
        $(entering).attr("class", "entering-left-pane");
        this.panes.unshift(entering);

        setTimeout(() => {
            $(this.panes[0]).attr("class", "left-pane");
            $(this.panes[1]).attr("class", "right-pane");
            $(this.panes[2]).attr("class", "leaving-right-pane");
        }, 20);
    }

    moveRight() {
        $(this.panes[2]).attr("class", "entering-right-pane");
        this.panes.push(this.panes.shift());

        setTimeout(() => {
            $(this.panes[0]).attr("class", "left-pane");
            $(this.panes[1]).attr("class", "right-pane");
            $(this.panes[2]).attr("class", "leaving-left-pane");
        }, 20);
    }
}
