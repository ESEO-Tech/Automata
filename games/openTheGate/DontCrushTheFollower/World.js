
namespace(this, "automata.games.openTheGate", function (exports) {

    exports.DontCrushTheFollowerWorld = Object.create(exports.World).augment({

        carXMin: [-80, -220, -500, -630],

        getStatus: function () {
            var status = exports.World.getStatus.call(this);
            if (status.done && (status.status === "success" || status.status === "warning") && this.gateY < this.gateYMax) {
                return {done: true, status: "error", message: "The gate is still open. Close it behind you."};
            }
            return status;
        }
    });
});
