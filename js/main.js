$(function () {
    var world       = automata.game.world.create().init();
    var worldView   = automata.game.view.create().init(world, $("#world-view"));
    var tableView   = automata.view.TransitionTable.create().init(world.stateMachine, $("#table-view"));
    var controlView = automata.view.ControlView.create().init(world, $("#control-view"));
    var diagramView = automata.view.Diagram.create().init(world.stateMachine, $("#diagram-view"));
    
    var sources = {};
    sources[world.key + ".model"]        = world.stateMachine;
    sources[world.key + ".view.table"]   = tableView;
    sources[world.key + ".view.diagram"] = diagramView;
    var storage = automata.storage.LocalStorage.create().init(sources);

    world.addListener("done", function (w, data) {
        var msg = "[" + data.status + "]";
        if (data.message) {
            msg += " " + data.message;
        }
        alert(msg);
    });
    
    function resize() {
        tableView.scale();
        diagramView.updateViewbox();
    }

    resize();
    storage.load();

    $(window).resize(resize);
});
