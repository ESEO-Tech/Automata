
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

        this.panes = [
            document.querySelector("#world-view"),
            document.querySelector("#table-view"),
            document.querySelector("#diagram-view")
        ];
    }

    render() {
        this.playButton = this.container.querySelector("#control-play");

        this.playButton.addEventListener("click", () => {
            if (this.model.isRunning) {
                this.model.pause();
            }
            else {
                this.updateTimeStep();
                this.model.start();
            }
        });

        this.container.querySelector("#control-stop").addEventListener("click", () => this.model.stop());
        this.container.querySelector("#control-left").addEventListener("click", () => this.moveLeft());
        this.container.querySelector("#control-right").addEventListener("click", () => this.moveRight());

        this.speedInput = this.container.querySelector("#control-speed");
        this.speedInput.value = 10 - 10 * (this.model.timeStep - this.model.timeStepMin) / (this.model.timeStepMax - this.model.timeStepMin);
        this.speedInput.addEventListener("change", () => this.updateTimeStep());

        this.container.querySelector("#control-help").addEventListener("click", () => this.model.fire("help"));
    }

    start() {
        this.playButton.classList.add("running");
        this.playButton.innerHTML = '<i class="fa fa-pause"></i>';
    }

    pauseOrStop() {
        this.playButton.classList.remove("running");
        this.playButton.innerHTML = '<i class="fa fa-play"></i>';
    }

    updateTimeStep() {
        const value = parseInt(this.speedInput.value);
        this.model.timeStep = this.model.timeStepMin + (this.model.timeStepMax - this.model.timeStepMin) * (10 - value) / 10 ;
    }

    moveLeft() {
        const entering = this.panes.pop();
        entering.className = "entering-left-pane";
        this.panes.unshift(entering);

        setTimeout(() => {
            this.panes[0].className = "left-pane";
            this.panes[1].className = "right-pane";
            this.panes[2].className = "leaving-right-pane";
        }, 20);
    }

    moveRight() {
        this.panes[2].className = "entering-right-pane";
        this.panes.push(this.panes.shift());

        setTimeout(() => {
            this.panes[0].className = "left-pane";
            this.panes[1].className = "right-pane";
            this.panes[2].className = "leaving-left-pane";
        }, 20);
    }
}
