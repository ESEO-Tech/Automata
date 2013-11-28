namespace(this, "automata.games.pushButton", function (exports) {

    exports.LightSwitcherWorldView = Object.create(automata.model.Model).augment({
       
        init: function (world, container) {
            automata.model.Model.init.call(this);
            
            this.world = world;
            
            container.html('<div><input type="button" value="Push"></div>\
                            <div><span class="light off">Off</span></div>');
            
            $("input", container)
                .mousedown(function () {
                    world.setSensorValue(0, "1");
                })
                .mouseup(function () {
                    world.setSensorValue(0, "0");
                });
            
            world.addListener("changed", this.update, this);
            
            return this;
        },
        
        update: function () {
            var cls = this.world.getActuatorValue(0) === "1" ? "on" : "off";
            var text = this.world.getActuatorValue(0) === "1" ? "On" : "Off";
            $(".light", this.container).removeClass("on off").addClass(cls).html(text);
        }
    });
});
