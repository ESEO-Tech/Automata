$(function () {
    var world       = automata.game.world.create().init();
    var worldView   = automata.game.view.create().init(world, $("#world-view"));
    var tableView   = automata.view.TransitionTable.create().init(world.stateMachine, $("#table-view"));
    var controlView = automata.view.ControlView.create().init(world, $("#control-view"));
    var diagramView = automata.view.Diagram.create().init(world.stateMachine, $("#diagram-view"));
    var helpView    = automata.view.HelpView.create().init(world, $("#help-view"));
    var scoreView   = automata.view.ScoreView.create().init(world, $("#score-view"));
    
    // When the window is resized, scale the content of
    // the table view and update the diagram viewbox.
    function resize() {
        tableView.scale();
        diagramView.updateViewbox();
    }

    resize();
    $(window).resize(resize);

    // Configure the data storage for the current game
    // and attempt to load the saved data.
    var sources = {};
    sources[world.key + ".model"]        = world.stateMachine;
    sources[world.key + ".view.table"]   = tableView;
    sources[world.key + ".view.diagram"] = diagramView;
    var storage = automata.storage.LocalStorage.create().init(sources);
    var loaded = storage.load();
    
    // If no record exists for this game, we assume the user has never
    // played this game before and we show the instructions pane.
    if (!loaded) {
        helpView.show();
    }
});
