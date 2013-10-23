$(function () {
    var world = Object.create(automata.model.World).init().augment({
        "key": "leve-vitre",
        "sensors": ["BO", "BF", "CO", "CF", "sec"],
        "actuators": ["MO", "MF", "inc"],
        "solution": {
            "stateVars": ["AA", "O", "OA", "F", "FA", "AR"],
            "transitions": {
                "100000": {
                    "1-1--": ["100000", "000"],
                    "-1-1-": ["100000", "000"],
                    "11---": ["100000", "000"],
                    "00---": ["100000", "000"],
                    "100--": ["010000", "000"],
                    "01-0-": ["001000", "000"]
                },
                "010000": {
                    "10--0": ["010000", "101"],
                    "10--1": ["000100", "101"],
                    "11---": ["000001", "101"],
                    "0----": ["100000", "101"]
                },
                "001000": {
                    "--100": ["001000", "011"],
                    "--101": ["000010", "011"],
                    "--11-": ["000001", "011"],
                    "--0--": ["100000", "011"]
                },
                "000100": {
                    "-0---": ["000100", "100"],
                    "-1---": ["000001", "100"]
                },
                "000010": {
                    "---0-": ["000010", "010"],
                    "---1-": ["000001", "010"]
                },
                "000001": {
                    "1----": ["000001", "000"],
                    "--1--": ["000001", "000"],
                    "0-0--": ["100000", "000"]
                }
            }
        }
    });
    
    var tableView =   Object.create(automata.view.TransitionTable).init(world.stateMachine, $("#table-view"));
    var diagramView = Object.create(automata.view.Diagram).init(world.stateMachine, $("#diagram-view"));
    
    var sources = {};
    sources["automata." + world.key + ".model"]        = world.stateMachine;
    sources["automata." + world.key + ".view.table"]   = tableView;
    sources["automata." + world.key + ".view.diagram"] = diagramView;
    var storage = Object.create(automata.storage.LocalStorage).init(sources);

    $.when(tableView.ready(), diagramView.ready()).done(function () {
        storage.load();
    });
    
    function resize() {
        diagramView.setSize($(window).width() - $("#table-view").width(), $(window).height());
    }

    world.stateMachine.addListener("changed", function () {
        // Ensure the table view has been updated before resizing
        setTimeout(resize, 1);
    });
    
    $(window).resize(resize);
});
