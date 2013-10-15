$(function () {
    var world = {
        sensors: ["BO", "BF", "CO", "CF", "sec"],
        actuators: ["MO", "MF", "inc"]
    };
    
    var fsm = Object.create(automata.model.StateMachine ).init(world, ["AA", "O", "OA", "F", "FA", "AR"]);
    
    var tableView = Object.create(automata.view.TransitionTable).init(fsm, $("#table-view"));
    var diagramView = Object.create(automata.view.Diagram).init(fsm, $("#diagram-view"));

    function resize() {
        diagramView.setSize(
            $(window).width() - $("#table-view").width(),
            $(window).height()
        );
    }
    
    window.setInterval(resize, 1000);
    $(window).resize(resize);
});
