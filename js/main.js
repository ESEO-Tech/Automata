$(function () {
    var world       = Object.create(automata.game.world).init();
    var worldView   = Object.create(automata.game.view).init(world, $("#world-view"));
    var tableView   = Object.create(automata.view.TransitionTable).init(world.stateMachine, $("#table-view"));
    var controlView = Object.create(automata.view.ControlView).init(world, $("#control-view"));
    var diagramView = Object.create(automata.view.Diagram).init(world.stateMachine, $("#diagram-view"));
    
    var sources = {};
    sources[world.key + ".model"]        = world.stateMachine;
    sources[world.key + ".view.table"]   = tableView;
    sources[world.key + ".view.diagram"] = diagramView;
    var storage = Object.create(automata.storage.LocalStorage).init(sources);

    function resize() {
        tableView.scale();
        diagramView.updateViewbox();
    }

    resize();
    storage.load();

    $(window).resize(resize);
});
