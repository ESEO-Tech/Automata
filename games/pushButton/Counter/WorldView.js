namespace(this, "automata.games.pushButton", function (exports) {

    exports.CounterWorldView = Object.create(automata.model.Model).augment({
       
        init: function (world, container) {
            automata.model.Model.init.call(this);
            
            this.world = world;
            
            container.html('<div><input type="button" value="Push"></div>\
                            <div><span class="counter">0</span></div>');
            
            var self = this;
            $("input", container)
                .mousedown(function () {
                    world.setButton("1");
                })
                .mouseup(function () {
                    world.setButton("0");
                })
                .mouseout(function () {
                    world.setSensorValue(0, "0");
                });
            
            world.addListener("changed", this.update, this);
            
            return this;
        },
        
        update: function () {
            $(".counter", this.container).html(this.world.counterValue);
        }
    });
});
