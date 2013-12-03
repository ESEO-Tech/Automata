$(function () {
    var world       = automata.game.world.create().init();
    var worldView   = automata.game.view.create().init(world, $("#world-view"));
    var tableView   = automata.view.TransitionTable.create().init(world.stateMachine, $("#table-view"));
    var controlView = automata.view.ControlView.create().init(world, $("#control-view"));
    var diagramView = automata.view.Diagram.create().init(world.stateMachine, $("#diagram-view"));
    var helpView    = automata.view.HelpView.create().init(world, $("#help-view"));
    var scoreView   = automata.view.ScoreView.create().init(world, $("#score-view"));
    
    var sources = {};
    sources[world.key + ".model"]        = world.stateMachine;
    sources[world.key + ".view.table"]   = tableView;
    sources[world.key + ".view.diagram"] = diagramView;
    var storage = automata.storage.LocalStorage.create().init(sources);

    function resize() {
        tableView.scale();
        diagramView.updateViewbox();
    }

    resize();
    storage.load();

    $(window).resize(resize);
});
