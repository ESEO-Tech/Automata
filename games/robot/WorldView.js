
namespace(this, "automata.games.robot", function (exports) {

    exports.WorldView = automata.model.Object.create({
       
        init: function (world, container) {
            automata.model.Object.init.call(this);
            
            this.world = world;
            
            this.paper = Snap();
            container.append(this.paper.node);
            
            this.paper.attr({
                viewBox: "0 0 " + world.width + " " + world.height,
                preserveAspectRatio: "xMidYMid meet" // FIXME not supported by Snap.svg (see below)
            });
            
            this.paper.node.setAttribute("preserveAspectRatio", "xMidYMid meet");
            
            // Draw goal
            this.paper.circle(world.goalX, world.goalY, world.goalRadius).attr({"class": "automata-robot-goal"});
            
            // Draw walls
            forEach(wall of world.walls) {
                this.paper.rect(wall[0], wall[1], wall[2] - wall[0], wall[3] - wall[1]).attr({"class": "automata-robot-wall"});
            }
            
            // Draw robot
            this.sensorViews = world.sensorPoints.map(function (p) {
                return this.paper.circle(p.x, p.y, world.sensorRadius);
            }, this);

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
            forEach(view, index of this.sensorViews) {
                var cls = this.world.sensorValues[index] === "1" ? "active" : "inactive";
                view.attr({"class": cls});
            }
            this.robotView.transform(this.world.robotMatrix);
        }
    });
});