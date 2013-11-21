namespace(this, "automata.games.powerWindow", function (exports) {

    exports.World = Object.create(automata.model.World).augment({
        key: "automata.games.powerWindow",
        sensors:   [
            {name: "OB",  desc: "Open Button"},
            {name: "CB",  desc: "Close Button"},
            {name: "WO",  desc: "Window completely Open"},
            {name: "WF",  desc: "Window completely Closed"},
            {name: "Sec", desc: "Second elapsed"}
        ],
        actuators: [
            {name: "OG",  desc: "Open Gate"},
            {name: "CG",  desc: "Close Gate"},
            {name: "Inc", desc: "Increment seconds counter"}
        ],
        solution: {
            stateVars: ["AA", "O", "OA", "F", "FA", "AR"],
            transitions: {
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
});
