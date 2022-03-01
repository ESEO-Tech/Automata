
import {WorldView, World as CounterWorld} from "../Counter/game.js";

export {WorldView};

export class World extends CounterWorld {
    constructor() {
        super();
        this.bounceCounterMax = 4;
    }

    setButton(value) {
        if (value !== this.buttonState) {
            this.bounceCounter = 0;
        }
        this.buttonState = value;
    }

    onReset() {
        super.onReset();
        this.buttonState = "0";
        this.bounceCounter = this.bounceCounterMax;
    }

    onStep() {
        super.onStep();
        var value = this.buttonState;
        if (this.bounceCounter < this.bounceCounterMax) {
            if (this.bounceCounter % 2 === 1) {
                value = this.buttonState === "1" ? "0" : "1";
            }
            this.bounceCounter ++;
        }
        this.setSensorValue(0, value);
    }
}
