
namespace(this, "automata.model", function (exports) {
    exports.World = Object.create(exports.Model).augment({
        init: function () {
            exports.Model.init.call(this);
            this.stateMachine = Object.create(exports.StateMachine).init(this);
            return this;
        }
    });
});
