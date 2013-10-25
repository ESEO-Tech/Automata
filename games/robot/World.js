
namespace(this, "automata.games.robot", function (exports, globals) {

    exports.World = Object.create(automata.model.World).augment({
        sensors:   ["WL", "WR", "WA"],
        actuators: ["LF", "LB", "RF", "RB"]
    });
});