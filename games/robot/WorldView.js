
namespace(this, "automata.games.robot", function (exports, globals) {

    exports.WorldView = Object.create(automata.model.Model).augment({
       
        init: function (world, container) {
            automata.model.Model.init.call(this);
            
            this.world = world;
            
            this.paper = Snap();
            container.append(this.paper.node);
            
            this.paper.attr({
                viewBox: "0 0 " + world.width + " " + world.height,
                preserveAspectRatio: "xMidYMid meet"
            });
            
            // Draw walls
            world.walls.forEach(function (wall) {
                this.paper.rect(wall[0], wall[1], wall[2] - wall[0], wall[3] - wall[1]).attr({"class": "automata-robot-wall"});
            }, this);
            
            // Draw robot
            this.sensorViews = [
                this.paper.circle(-world.robotRadius, -world.robotRadius - world.sensorDistance, world.robotRadius / 4),
                this.paper.circle(-world.robotRadius,  world.robotRadius + world.sensorDistance, world.robotRadius / 4),
                this.paper.circle(world.robotRadius + world.sensorDistance, 0, world.robotRadius / 4)
            ];

            this.robotView = this.paper.g(
                this.paper.circle(0, 0, world.robotRadius).attr({"class": "chassis"}),
                this.paper.circle(world.robotRadius / 2, 0, world.robotRadius / 3).attr({"class": "eye"}),
                this.sensorViews[0], this.sensorViews[1], this.sensorViews[2]
            ).attr({"class": "automata-robot"});

            this.update();

            world.addListener("changed", this.update, this);
            
            return this;
        },
        
        update: function () {
            this.sensorViews.forEach(function (view, index) {
                var cls = this.world.sensorValues[index] === "1" ? "active" : "inactive";
                view.attr({"class": cls});
            }, this);
            this.robotView.transform(this.world.robotMatrix);
        }
    });
});