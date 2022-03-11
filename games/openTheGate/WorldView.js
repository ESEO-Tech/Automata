
export class WorldView {
    constructor(world, container) {
        this.world = world;

        this.paper = Snap();
        container.appendChild(this.paper.node);

        this.render();
        this.update();

        world.addListener("changed", this.update, this);
    }

    render() {
        this.paper.attr({
            viewBox: "0 0 " + this.world.width + " " + this.world.height,
            preserveAspectRatio: "xMidYMid meet" // FIXME not supported by Snap.svg (see below)
        });

        this.paper.node.setAttribute("preserveAspectRatio", "xMidYMid meet");

        // Draw floor and walls
        this.paper.rect(0, 250, 420, 300).attr({fill: "grey"});
        this.paper.rect(240, 0, 30, 150).attr({fill: "grey"});

        // Draw sensors
        this.sensorViews = [
            this.paper.circle(180, 170, 5),   // Button
            this.paper.rect(245, 144, 20, 5), // Open
            this.paper.rect(245, 251, 20, 5), // Close
            this.paper.rect(270, 251, 20, 5)  // Vehicle
        ];

        this.paper.text(180, 160, "B");
        this.paper.text(255, 140, "O");
        this.paper.text(255, 270, "C");
        this.paper.text(280, 270, "V");

        function makeCar(paper, color) {
            return paper.group(
                paper.path("m10,50 l60,0 c5,0 10,-5 10,-10 0,-10 -40,-20 -60,-20 -15,0 -20,10 -20,20 0,5 5,10 10,10 z").attr({fill: color}),
                paper.path("m40,35 c10,0 20,0 20,-5 0,-2 -15,-7 -25,-7 -5,0 0,10 5,12 z").attr({fill: "rgb(54,84,110)"}),
                paper.circle(20, 50, 7).attr({fill: "grey", stroke: "black", strokeWidth: 4}),
                paper.circle(60, 50, 7).attr({fill: "grey", stroke: "black", strokeWidth: 4})
            );
        }
        // Draw the car
        this.carViews = [
            makeCar(this.paper, "rgb(255,114,255)"),
            makeCar(this.paper, "rgb(114,197,9)"),
            makeCar(this.paper, "rgb(100,170,220)"),
            makeCar(this.paper, "rgb(255,200,0)")
        ];

        // Draw the gate
        this.actuatorViews = new Array(2);
        this.gateView = this.paper.group(
            this.paper.rect(0, 0, 10, 40).attr({fill: "white", stroke: "none"}),
            this.paper.path("m0,0 l10,0 -10,10 0,-10 z").attr({fill: "red"}),
            this.paper.path("m10,10 l0,10 -10,10 0,-10 z").attr({fill: "red"}),
            this.paper.path("m10,30 l0,10 -10,0 z").attr({fill: "red"}),
            this.paper.rect(0, 0, 10, 40).attr({fill: "none", stroke: "black"}),

            this.actuatorViews[0] = this.paper.path("m25,20 l6,6 -3,0 0,6 -6,0 0,-6 -3,0 z"),
            this.paper.text(25, 15, "U"),

            this.actuatorViews[1] = this.paper.path("m50,32 l6,-6 -3,0 0,-6 -6,0 0,6 -3,0 z"),
            this.paper.text(50, 15, "D")
        );

        // Draw the problem indicator
        this.problemView = this.paper.group(
            this.paper.path("m0,0 l10,5 5,-10 5,10 10,-5 -5,10 5,10 -10,-5 -5,10 -5,-10 -10,5 5,-10 z").attr({fill:"yellow", stroke: "black"}),
            this.paper.text(15, 15, "!")
        ).attr({transform: "translate(275,130)"});

        // Draw masks on the left and right of the scene
        // TODO: use a clip path
        this.paper.rect(-80, 0, 80, 300).attr({fill: "white"});
        this.paper.rect(420, 0, 500, 300).attr({fill: "white"});
    }

    update() {
        for (let sensorIndex = 0; sensorIndex < this.sensorViews.length; sensorIndex ++) {
            this.sensorViews[sensorIndex].attr({"class": this.world.sensorValues[sensorIndex] === "1" ? "active" : "inactive"});
        }

        for (let actuatorIndex = 0; actuatorIndex < this.actuatorViews.length; actuatorIndex ++) {
            this.actuatorViews[actuatorIndex].attr({"class": this.world.actuatorValues[actuatorIndex] === "1" ? "active" : "inactive"});
        }

        for (let carIndex = 0; carIndex < this.carViews.length; carIndex ++) {
            this.carViews[carIndex].attr({transform: "translate(" + this.world.carX[carIndex] + "," + this.world.carY + ")"});
        }

        this.gateView.attr({transform: "translate(" + this.world.gateX + "," + this.world.gateY + ")"});
        this.problemView.attr({"class": (this.world.problem() ? "visible" : "invisible")});
    }
}
