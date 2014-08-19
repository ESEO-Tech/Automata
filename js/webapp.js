
$(function () {
    "use strict";

    var MANIFEST = "http://tice.sea.eseo.fr/logique/automata/package.manifest";

    var mozApps = window.navigator.mozApps;

    function addInstallButton() {
        $('<span class="group"><button title="Install"><i class="fa fa-download"></i></span>')
            .appendTo($("#control-view"))
            .click(install);
    }

    function check() {
        var request = mozApps.checkInstalled(MANIFEST);
        request.onsuccess = function () {
            if (!this.result) {
                addInstallButton();
            }
        };
        request.onerror = function () {
            console.log("Web app installer: Failed to check installation status. " + this.error.name);
        };
    }

    function install() {
        var request = mozApps.installPackage(MANIFEST);
        request.onsuccess = function () {
            console.log("Web app installer: installed successfully. " + this.result.origin);
        };
        request.onerror = function () {
            console.log("Web app installer: installation failed. " + this.error.name);
        };
    }

    if (mozApps) {
        check();
    }
});
