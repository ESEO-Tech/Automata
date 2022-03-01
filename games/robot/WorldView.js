
export class WorldView {
    constructor(world, container) {
        this.world = world;

        this.paper = Snap();
        container.append(this.paper.node);

        this.paper.attr({
            viewBox: "0 0 " + world.width + " " + world.height,
            preserveAspectRatio: "xMidYMid meet" // FIXME not supported by Snap.svg (see below)
        });

        this.paper.node.setAttribute("preserveAspectRatio", "xMidYMid meet");

        // Draw goal
        this.paper.circle(world.goalX, world.goalY, world.goalRadius).attr({fill: "orange"});

        // Draw walls
        for (const wall of world.walls) {
            this.paper.rect(wall[0], wall[1], wall[2] - wall[0], wall[3] - wall[1]).attr({fill: "black", stroke: "none"});
        }

        // Draw robot
        this.sensorViews = world.sensorPoints.map(function (p) {
            return this.paper.circle(p.x, p.y, world.sensorRadius);
        }, this);

        const r = world.robotRadius;
        this.robotView = this.paper.g(
            this.paper.circle(0, 0, world.robotRadius).attr({fill: "rgb(38, 67, 112)"}),
            this.paper.circle(world.robotRadius * 0.25, 0, world.robotRadius * 0.75).attr({fill: "rgb(51, 91, 149)"}),
            this.paper.path("m " + (r/2) + "," + (-r/2) +
                            " c " + (r/4) + ",0 " + (3*r/8) + "," + (r/4) + " " + (3*r/8) + "," + (r/2) +
                            " 0," + (r/4) + " " + (-r/8) + "," + (r/2) + " " + (-3*r/8) + "," + (r/2) +
                            " " + (-r/4) + ",0 0," + (-r/4) + " 0," + (-r/2) +
                            " 0," + (-r/4) + " " + (-r/4) + "," + (-r/2) + " 0," + (-r/2) +
                            " z").attr({fill: "rgb(173, 194, 227)"}),
            this.sensorViews[0], this.sensorViews[1], this.sensorViews[2]
        ).attr({"class": "automata-robot"});

        this.update();

        world.addListener("changed", this.update, this);
    }

    update() {
        for (let i = 0; i < this.sensorViews.length; i ++) {
            this.sensorViews[i].attr({
                "class": this.world.sensorValues[i] === "1" ? "active" : "inactive"
            });
        }
        this.robotView.transform(this.world.robotMatrix);
    }
}
