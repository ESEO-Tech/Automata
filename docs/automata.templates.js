(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["templates/Diagram-main.tpl.svg"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<svg class=\"automata-Diagram\">\n    <defs>\n        <marker id=\"arrow-head\"\n                viewBox=\"0 0 10 10\" refX=\"10\" refY=\"5\"\n                markerWidth=\"10\" markerHeight=\"10\"\n                markerUnits=\"strokeWidth\"\n                orient=\"auto\">\n            <path d=\"M0,0 L10,5 L0,10 L2,5 z\" />\n        </marker>\n        <filter id=\"state-shadow\"\n                x=\"-25%\" y=\"-20%\" width=\"150%\" height=\"150%\">\n            <feGaussianBlur in=\"SourceAlpha\" stdDeviation=\"3\" />\n            <feOffset dx=\"0\" dy=\"2\" />\n            <feComponentTransfer>\n                <feFuncA type=\"linear\" slope=\"0.4\" />\n            </feComponentTransfer>\n            <feMerge>\n                <feMergeNode />\n                <feMergeNode in=\"SourceGraphic\" />\n            </feMerge>\n        </filter>\n    </defs>\n    <g id=\"reset\" class=\"transition\">\n        <path marker-end=\"url(#arrow-head)\" d=\"M6,6 c6,0 18,6 18,18\" />\n        <circle r=\"6\" cx=\"6\" cy=\"6\" filter=\"url(#state-shadow)\" />\n    </g>\n</svg>";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["templates/ScoreView-main.tpl.html"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<div>\n    <div class=\"score-status\">\n        ";
if(runtime.contextOrFrameLookup(context, frame, "status") == "success") {
output += " <i class=\"fa fa-thumbs-up\"></i>\n        ";
;
}
else {
if(runtime.contextOrFrameLookup(context, frame, "status") == "warning") {
output += " <i class=\"fa fa-warning\"></i>\n        ";
;
}
else {
if(runtime.contextOrFrameLookup(context, frame, "status") == "error") {
output += " <i class=\"fa fa-thumbs-down\"></i>\n        ";
;
}
;
}
;
}
output += "\n    </div>\n    <div class=\"score-message\">";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "message"), env.autoesc);
output += "</div>\n    <div>\n        <button title=\"Close\"><i class=\"fa fa-times\"></i></button>\n    </div>\n</div>";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["templates/TransitionTable-main.tpl.html"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<table class=\"automata-TransitionTable\">\n    <tr>\n        <th></th>\n        <th>Source state</th>\n        <th></th>\n        ";
frame = frame.push();
var t_3 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "world")),"sensors", env.autoesc);
if(t_3) {for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("s", t_4);
output += "\n            <th title=\"";
output += runtime.suppressValue(runtime.memberLookup((t_4),"desc", env.autoesc), env.autoesc);
output += "\">";
output += runtime.suppressValue(runtime.memberLookup((t_4),"name", env.autoesc), env.autoesc);
output += "</th>\n        ";
;
}
}
frame = frame.pop();
output += "\n        <th>&rarr;</th>\n        ";
frame = frame.push();
var t_7 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "world")),"actuators", env.autoesc);
if(t_7) {for(var t_5=0; t_5 < t_7.length; t_5++) {
var t_8 = t_7[t_5];
frame.set("a", t_8);
output += "\n            <th title=\"";
output += runtime.suppressValue(runtime.memberLookup((t_8),"desc", env.autoesc), env.autoesc);
output += "\">";
output += runtime.suppressValue(runtime.memberLookup((t_8),"name", env.autoesc), env.autoesc);
output += "</th>\n        ";
;
}
}
frame = frame.pop();
output += "\n        <th>Target state</th>\n    </tr>\n    <tr>\n        <td class=\"create-state\" colspan=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "world")),"sensors", env.autoesc)),"length", env.autoesc) + runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "world")),"actuators", env.autoesc)),"length", env.autoesc) + 5, env.autoesc);
output += "\">\n            <button title=\"Create a state\"><i class=\"fa fa-plus-circle\"></i></button>\n        </td>\n    </tr>\n</table>\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["templates/TransitionTable-state.tpl.html"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<tr class=\"state-";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "state")),"id", env.autoesc), env.autoesc);
output += "\">\n    <td class=\"remove-state\"><button title=\"Remove this state\"><i class=\"fa fa-minus-circle\"></i></button></td>\n    <td class=\"source-state-name\">\n        <input type=\"text\" size=\"10\" value=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "state")),"name", env.autoesc), env.autoesc);
output += "\">\n        ";
if(runtime.memberLookup(((lineno = 4, colno = 30, runtime.callWrap(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "model")),"getStateVars", env.autoesc), "model[\"getStateVa\"]", []))),"length", env.autoesc)) {
output += "\n            <table class=\"state-encoding\">\n                <tr>\n                    ";
frame = frame.push();
var t_3 = (lineno = 7, colno = 51, runtime.callWrap(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "model")),"getStateVars", env.autoesc), "model[\"getStateVa\"]", []));
if(t_3) {for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("name", t_4);
output += "\n                        <th>s<sub>";
output += runtime.suppressValue(t_4, env.autoesc);
output += "</sub></th>\n                    ";
;
}
}
frame = frame.pop();
output += "\n                </tr>\n                <tr>\n                    ";
frame = frame.push();
var t_7 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "state")),"encoding", env.autoesc);
if(t_7) {for(var t_5=0; t_5 < t_7.length; t_5++) {
var t_8 = t_7[t_5];
frame.set("value", t_8);
output += "\n                        <td><input type=\"button\" class=\"automata-bool\" value=\"";
output += runtime.suppressValue(t_8, env.autoesc);
output += "\"></td>\n                    ";
;
}
}
frame = frame.pop();
output += "\n                </tr>\n            </table>\n        ";
;
}
output += "\n    </td>\n    <td class=\"create-transition\" colspan=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "model")),"world", env.autoesc)),"sensors", env.autoesc)),"length", env.autoesc) + runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "model")),"world", env.autoesc)),"actuators", env.autoesc)),"length", env.autoesc) + 3, env.autoesc);
output += "\">\n        <button title=\"Create a transition\"><i class=\"fa fa-plus-circle\"></i></button>\n    </td>\n</tr>\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["templates/TransitionTable-transition.tpl.html"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<td class=\"remove-transition\"><button title=\"Remove this transition\"><i class=\"fa fa-minus-circle\"></i></button></td>\n";
frame = frame.push();
var t_3 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "transition")),"inputs", env.autoesc);
if(t_3) {for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("value", t_4);
output += "\n    <td class=\"transition-input\"><input type=\"button\" class=\"automata-bool\" value=\"";
output += runtime.suppressValue(t_4, env.autoesc);
output += "\"></td>\n";
;
}
}
frame = frame.pop();
output += "\n<td class=\"arrow\">&rarr;</td>\n";
frame = frame.push();
var t_7 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "transition")),"outputs", env.autoesc);
if(t_7) {for(var t_5=0; t_5 < t_7.length; t_5++) {
var t_8 = t_7[t_5];
frame.set("value", t_8);
output += "\n    <td class=\"transition-output\"><input type=\"button\" class=\"automata-bool\" value=\"";
output += runtime.suppressValue(t_8, env.autoesc);
output += "\"></td>\n";
;
}
}
frame = frame.pop();
output += "\n<td class=\"target-state-name\">\n    <select>\n        ";
frame = frame.push();
var t_11 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "model")),"states", env.autoesc);
if(t_11) {for(var t_9=0; t_9 < t_11.length; t_9++) {
var t_12 = t_11[t_9];
frame.set("targetState", t_12);
output += "\n            <option value=\"";
output += runtime.suppressValue(runtime.memberLookup((t_12),"id", env.autoesc), env.autoesc);
output += "\"\n                    ";
if(runtime.memberLookup((t_12),"id", env.autoesc) == runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "transition")),"targetState", env.autoesc)),"id", env.autoesc)) {
output += " selected ";
;
}
output += ">\n                ";
output += runtime.suppressValue(runtime.memberLookup((t_12),"name", env.autoesc), env.autoesc);
output += "\n            </option>\n        ";
;
}
}
frame = frame.pop();
output += "\n        <option value=\"#NewState#\">New state</option>\n    </select>\n</td>\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["templates/game.tpl.html"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<!doctype html>\n<html>\n    <head>\n        <meta charset=\"utf-8\">\n        <title>Automata</title>\n\n        <meta name=\"viewport\" content=\"width=device-width, user-scalable=no\">\n\n        <link rel=\"icon\" type=\"image/png\" href=\"icons/32.png\" />\n\n        <link rel=\"stylesheet\" href=\"bower_components/normalize.css/normalize.css\">\n        <link rel=\"stylesheet\" href=\"bower_components/fontawesome/css/font-awesome.css\">\n        <link rel=\"stylesheet\" href=\"css/automata.core.min.css\">\n        <link rel=\"stylesheet\" href=\"css/";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "key"), env.autoesc);
output += ".min.css\">\n\n        <script src=\"bower_components/jquery/dist/jquery.min.js\"></script>\n        <script src=\"bower_components/nunjucks/browser/nunjucks-slim.min.js\"></script>\n        <script src=\"bower_components/snap.svg/dist/snap.svg-min.js\"></script>\n        <script src=\"js/automata.core.min.js\"></script>\n        <script src=\"js/";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "key"), env.autoesc);
output += ".min.js\"></script>\n\n        <script>\n            automata.main(";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "key"), env.autoesc);
output += ");\n        </script>\n    </head>\n    <body>\n        <div id=\"main\">\n            <div id=\"control-view\">\n                <span class=\"group\">\n                    <a href=\"index.html\"><i class=\"fa fa-home\"></i></a>\n                </span>\n                <span class=\"group\">\n                    <button id=\"control-play\" title=\"Play/Pause\"><i class=\"fa fa-play\"></i></button>\n                    <button id=\"control-stop\" title=\"Stop\"><i class=\"fa fa-stop\"></i></button>\n                    <label for=\"control-speed\">Speed:</label>\n                    <input type=\"range\" id=\"control-speed\" value=\"20\" min=\"0\" max=\"10\" step=\"1\" title=\"Speed\">\n                </span>\n                <span class=\"group\">\n                    <button id=\"control-left\" title=\"Show previous pane\"><i class=\"fa fa-chevron-left\"></i></button>\n                    <button id=\"control-right\" title=\"Show next pane\"><i class=\"fa fa-chevron-right\"></i></button>\n                </span>\n                <span class=\"group\">\n                    <button id=\"control-help\" title=\"Help\"><i class=\"fa fa-info-circle\"></i></button>\n                </span>\n                <a class=\"export\" download=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "key"), env.autoesc);
output += ".json\"></a>\n                <input class=\"import\" type=\"file\">\n            </div>\n            <div id=\"world-view\" class=\"left-pane\"></div>\n            <div id=\"table-view\" class=\"right-pane\"></div>\n            <div id=\"diagram-view\" class=\"hidden\"></div>\n            <div id=\"help-view\">\n                <div>\n                    <h1>";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "title"), env.autoesc);
output += "</h1>\n                    <div>";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "content"), env.autoesc);
output += "</div>\n                </div>\n                <button title=\"Close\"><i class=\"fa fa-times\"></i></button>\n            </div>\n            <div id=\"score-view\"></div>\n        </div>\n    </body>\n</html>\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["templates/index.tpl.html"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<!doctype html>\n<html>\n    <head>\n        <meta charset=\"utf-8\">\n        <title>Automata</title>\n\n        <meta name=\"viewport\" content=\"width=device-width, user-scalable=no\">\n        \n        <link rel=\"icon\" type=\"image/png\" href=\"icons/32.png\">\n        <link rel=\"stylesheet\" href=\"bower_components/normalize.css/normalize.css\">\n        <link rel=\"stylesheet\" href=\"bower_components/fontawesome/css/font-awesome.css\">\n        <link rel=\"stylesheet\" href=\"css/automata.core.min.css\">\n\n        <script src=\"bower_components/jquery/dist/jquery.min.js\"></script>\n        <script src=\"js/webapp.js\"></script>\n    </head>\n    <body>\n        <div id=\"main\">\n            <div id=\"control-view\">\n                <span class=\"group\">Automata</span>\n            </div>\n            <div id=\"games-menu\">\n                ";
frame = frame.push();
var t_3 = runtime.contextOrFrameLookup(context, frame, "categories");
if(t_3) {for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("cat", t_4);
output += "\n                    <h1>";
output += runtime.suppressValue(runtime.memberLookup((t_4),"title", env.autoesc), env.autoesc);
output += "</h1>\n                    \n                    <ul>\n                        ";
frame = frame.push();
var t_7 = runtime.memberLookup((t_4),"games", env.autoesc);
if(t_7) {for(var t_5=0; t_5 < t_7.length; t_5++) {
var t_8 = t_7[t_5];
frame.set("game", t_8);
output += "\n                            <li><a href=\"";
output += runtime.suppressValue(runtime.memberLookup((t_8),"key", env.autoesc), env.autoesc);
output += ".html\"><img src=\"icons/";
output += runtime.suppressValue(runtime.memberLookup((t_8),"key", env.autoesc), env.autoesc);
output += ".svg\">";
output += runtime.suppressValue(runtime.memberLookup((t_8),"title", env.autoesc), env.autoesc);
output += "</a></li>\n                        ";
;
}
}
frame = frame.pop();
output += "\n                    </ul>\n                ";
;
}
}
frame = frame.pop();
output += "\n            </div>\n        </div>\n    </body>\n</html>\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
