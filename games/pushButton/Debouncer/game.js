
import {WorldView, World as CounterWorld} from "../Counter/game.js";

export {WorldView};

export const World = CounterWorld.create({
    BOUNCE_COUNTER_MAX: 4,

    setButton: function (value) {
        if (value !== this.buttonState) {
            this.bounceCounter = 0;
        }
        this.buttonState = value;
    },

    onReset: function () {
        CounterWorld.onReset.call(this);
        this.buttonState = "0";
        this.bounceCounter = this.BOUNCE_COUNTER_MAX;
    },

    onStep: function () {
        CounterWorld.onStep.call(this);
        var value = this.buttonState;
        if (this.bounceCounter < this.BOUNCE_COUNTER_MAX) {
            if (this.bounceCounter % 2 === 1) {
                value = this.buttonState === "1" ? "0" : "1";
            }
            this.bounceCounter ++;
        }
        this.setSensorValue(0, value);
    }
});
