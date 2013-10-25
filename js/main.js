$(function () {
    var world       = Object.create(automata.games.robot.Labyrinth).init();
    var tableView   = Object.create(automata.view.TransitionTable).init(world.stateMachine, $("#table-view"));
    var diagramView = Object.create(automata.view.Diagram).init(world.stateMachine, $("#diagram-view"));
    
    var sources = {};
    sources[world.key + ".model"]        = world.stateMachine;
    sources[world.key + ".view.table"]   = tableView;
    sources[world.key + ".view.diagram"] = diagramView;
    var storage = Object.create(automata.storage.LocalStorage).init(sources);

    $.when(tableView.ready(), diagramView.ready()).done(function () {
        resize();
        storage.load();
    });
    
    function resize() {
        $("#diagram-view").width($(window).width() - $("#table-view").width())
                          .height($(window).height());
        diagramView.updateViewbox();
    }

    world.stateMachine.addListener("changed", function () {
        // Ensure the table view has been updated before resizing
        setTimeout(resize, 1);
    });

    $(window).resize(resize);
});
