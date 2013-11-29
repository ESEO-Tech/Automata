namespace(this, "automata.games.pushButton", function (exports) {

    exports.LightSwitcherWorldView = Object.create(automata.model.Model).augment({
       
        init: function (world, container) {
            automata.model.Model.init.call(this);
            
            this.world = world;
            
            container.html('<button>B=<span class="automata-bool-0">0</span></button>\
                            <div class="light off"><div>L=<span class="automata-bool-0">0</span></div>');
            
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
            this.world.setSensorValue(0, value);
            $("button span", this.container)
                .removeClass()
                .addClass("automata-bool-" + value)
                .html(value);
        },
        
        update: function () {
            var value = this.world.getActuatorValue(0);
            
            $(".light", this.container)
                .removeClass("on off")
                .addClass(value === "1" ? "on" : "off");
            
            $(".light span", this.container)
                .removeClass()
                .addClass("automata-bool-" + value)
                .html(value);
        }
    });
});
