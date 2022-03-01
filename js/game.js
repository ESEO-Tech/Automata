
import {TransitionTable} from "./view/TransitionTable.js";
import {ControlView}     from "./view/ControlView.js";
import {Diagram}         from "./view/Diagram.js";
import {HelpView}        from "./view/HelpView.js";
import {ScoreView}       from "./view/ScoreView.js";
import * as storage      from "./storage/LocalStorage.js";

async function main(game) {
    // Extract game ID from URL hash.
    const gameId = window.location.hash;
    if (gameId === "") {
        console.log("Missing game ID in URL")
        return;
    }
    const [sid, gid] = gameId.slice(1).split(".");
    if (!gid) {
        console.log("Game ID should be of the form: 'section.game'");
        return;
    }

    // Load game info.
    const infoResp = await fetch(`games/${sid}/${gid}/index.json`);
    const info     = await infoResp.json();

    // Add custom CSS.
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = `games/${sid}/${gid}/index.css`;
    document.querySelector("head").appendChild(style);

    // Load game help text.
    const helpResp = await fetch(`games/${sid}/${gid}/help.html`);
    const help     = await helpResp.text();
    document.querySelector("#help-view div").innerHTML = `<h1>${info.title}</h1>${help}`;

    // Load model and initialize views.
    const {WorldView, World} = await import(`../games/${sid}/${gid}/game.js`)
    var world       = new World();
    world.reset();
    var worldView   = new WorldView(world, $("#world-view"));
    var tableView   = new TransitionTable(world.stateMachine, $("#table-view"));
    var controlView = new ControlView(world, $("#control-view"));
    var diagramView = new Diagram(world.stateMachine, $("#diagram-view"));
    var helpView    = new HelpView(world, $("#help-view"));
    var scoreView   = new ScoreView(world, $("#score-view"));

    // When the window is resized, scale the content of
    // the table view and update the diagram viewbox.
    function resize() {
        tableView.scale();
        diagramView.updateViewbox();
    }

    resize();
    window.addEventListener("resize", resize);

    // Configure the data storage for the current game
    // and attempt to load the saved data.
    storage.addSource(`${sid}.${gid}.model`, world.stateMachine);
    storage.addSource(`${sid}.${gid}.view.table`, tableView);
    storage.addSource(`${sid}.${gid}.view.diagram`, diagramView);
    const loaded = storage.load();

/*
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
*/

    // If no record exists for this game, we assume the user has never
    // played this game before and we show the instructions pane.
    if (!loaded) {
        helpView.show();
    }
}

window.addEventListener("load", main);
