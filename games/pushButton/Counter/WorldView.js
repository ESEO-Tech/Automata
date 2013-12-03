
namespace(this, "automata.games.pushButton", function (exports) {

    exports.CounterWorldView = automata.model.Object.create({
       
        init: function (world, container) {
            automata.model.Object.init.call(this);
            
            this.world = world;
            
            container.html('<button>B=<span class="automata-bool-0">0</span></button>\
                            <div class="actuator">C=<span class="automata-bool-0">0</span></div>\
                            <div class="counter"><div>0</div></div>');
            
            var self = this;
            $("button", container)
                .mousedown(function () {
                    self.setButton("1");
                })
                .mouseup(function () {
                    self.setButton("0");
                })
                .mouseout(function () {
                    self.setButton("0");
                });
            
            world.addListener("changed", this.update, this);
            
            return this;
        },
        
        setButton: function (value) {
            this.world.setButton(value);
            $("button span", this.container)
                .removeClass()
                .addClass("automata-bool-" + value)
                .html(value);
        },
        
        update: function () {
            var value = this.world.getActuatorValue(0);
            
            $(".actuator span", this.container)
                .removeClass()
                .addClass("automata-bool-" + value)
                .html(value);

            $(".counter div", this.container).html(this.world.counterValue);
        }
    });
});
