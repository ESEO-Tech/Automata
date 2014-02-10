
namespace("automata", function (exports) {
    "use strict";

    exports.main = function (game) {
        $(function () {
            var world       = game.world.create().init();
            var worldView   = game.view.create().init(world, $("#world-view"));
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
            var storage = automata.storage.LocalStorage.create().init()
                .addSource(world.key + ".model", world.stateMachine)
                .addSource(world.key + ".view.table", tableView)
                .addSource(world.key + ".view.diagram", diagramView);
            var loaded = storage.load();

            function handleHash() {
                switch (window.location.hash) {
                    case "#export":
                        $("#control-view .export").attr("href", storage.toBlobURL())[0].click();
                        break;

                    case "#import":
                        $("#control-view .import").change(function () {
                            storage.fromFile(this.files[0]);
                        }).click();
                        break;

                    case "#to-base64":
                        alert(storage.toBase64());
                        break;

                    default:
                        if (window.location.hash.match(/^#from-base64:/)) {
                            storage.fromBase64(window.location.hash.slice(13));
                        }
                        else {
                            console.log("Invalid hash");
                        }
                }
            }

            handleHash();
            $(window).on("hashchange", handleHash);

            // If no record exists for this game, we assume the user has never
            // played this game before and we show the instructions pane.
            if (!loaded) {
                helpView.show();
            }
        });
    };
});
