(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["Diagram-main.tpl.svg"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "<svg class=\"automata-Diagram\">\n    <defs>\n        <marker id=\"arrow-head\"\n                viewBox=\"0 0 10 10\" refX=\"10\" refY=\"5\"\n                markerWidth=\"10\" markerHeight=\"10\"\n                markerUnits=\"strokeWidth\"\n                orient=\"auto\">\n            <path d=\"M0,0 L10,5 L0,10 L2,5 z\" />\n        </marker>\n        <filter id=\"state-shadow\"\n                x=\"-25%\" y=\"-20%\" width=\"150%\" height=\"150%\">\n            <feGaussianBlur in=\"SourceAlpha\" stdDeviation=\"3\" />\n            <feOffset dx=\"0\" dy=\"2\" />\n            <feComponentTransfer>\n                <feFuncA type=\"linear\" slope=\"0.4\" />\n            </feComponentTransfer>\n            <feMerge>\n                <feMergeNode />\n                <feMergeNode in=\"SourceGraphic\" />\n            </feMerge>\n        </filter>\n    </defs>\n    <g id=\"reset\" class=\"transition\">\n        <path marker-end=\"url(#arrow-head)\" d=\"M6,6 c6,0 18,6 18,18\" />\n        <circle r=\"6\" cx=\"6\" cy=\"6\" filter=\"url(#state-shadow)\" />\n    </g>\n</svg>";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
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
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["ScoreView-main.tpl.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "<div>\n    <div class=\"score-status\">\n        ";
if(runtime.contextOrFrameLookup(context, frame, "status") == "success") {
output += " <i class=\"fas fa-thumbs-up\"></i>\n        ";
;
}
else {
if(runtime.contextOrFrameLookup(context, frame, "status") == "warning") {
output += " <i class=\"fas fa-exclamation-triangle\"></i>\n        ";
;
}
else {
if(runtime.contextOrFrameLookup(context, frame, "status") == "error") {
output += " <i class=\"fas fa-thumbs-down\"></i>\n        ";
;
}
;
}
;
}
output += "\n    </div>\n    <div class=\"score-message\">";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "message"), env.opts.autoescape);
output += "</div>\n    <div>\n        <button title=\"Close\"><i class=\"fa fa-times\"></i></button>\n    </div>\n</div>\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
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
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["TransitionTable-main.tpl.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "<table class=\"automata-TransitionTable\">\n    <tr>\n        <th></th>\n        <th>Source state</th>\n        <th></th>\n        ";
frame = frame.push();
var t_3 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "world")),"sensors");
if(t_3) {t_3 = runtime.fromIterator(t_3);
var t_2 = t_3.length;
for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("s", t_4);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "\n            <th title=\"";
output += runtime.suppressValue(runtime.memberLookup((t_4),"desc"), env.opts.autoescape);
output += "\">";
output += runtime.suppressValue(runtime.memberLookup((t_4),"name"), env.opts.autoescape);
output += "</th>\n        ";
;
}
}
frame = frame.pop();
output += "\n        <th>&rarr;</th>\n        ";
frame = frame.push();
var t_7 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "world")),"actuators");
if(t_7) {t_7 = runtime.fromIterator(t_7);
var t_6 = t_7.length;
for(var t_5=0; t_5 < t_7.length; t_5++) {
var t_8 = t_7[t_5];
frame.set("a", t_8);
frame.set("loop.index", t_5 + 1);
frame.set("loop.index0", t_5);
frame.set("loop.revindex", t_6 - t_5);
frame.set("loop.revindex0", t_6 - t_5 - 1);
frame.set("loop.first", t_5 === 0);
frame.set("loop.last", t_5 === t_6 - 1);
frame.set("loop.length", t_6);
output += "\n            <th title=\"";
output += runtime.suppressValue(runtime.memberLookup((t_8),"desc"), env.opts.autoescape);
output += "\">";
output += runtime.suppressValue(runtime.memberLookup((t_8),"name"), env.opts.autoescape);
output += "</th>\n        ";
;
}
}
frame = frame.pop();
output += "\n        <th>Target state</th>\n    </tr>\n    <tr>\n        <td class=\"create-state\" colspan=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "world")),"sensors")),"length") + runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "world")),"actuators")),"length") + 5, env.opts.autoescape);
output += "\">\n            <button title=\"Create a state\"><i class=\"fa fa-plus-circle\"></i></button>\n        </td>\n    </tr>\n</table>\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
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
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["TransitionTable-state.tpl.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "<tr class=\"state-";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "state")),"id"), env.opts.autoescape);
output += "\">\n    <td class=\"remove-state\"><button title=\"Remove this state\"><i class=\"fa fa-minus-circle\"></i></button></td>\n    <td class=\"source-state-name\">\n        <input type=\"text\" size=\"10\" value=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "state")),"name"), env.opts.autoescape);
output += "\">\n        ";
if(runtime.memberLookup(((lineno = 4, colno = 32, runtime.callWrap(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "model")),"getStateVars"), "model[\"getStateVars\"]", context, []))),"length")) {
output += "\n            <table class=\"state-encoding\">\n                <tr>\n                    ";
frame = frame.push();
var t_3 = (lineno = 7, colno = 53, runtime.callWrap(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "model")),"getStateVars"), "model[\"getStateVars\"]", context, []));
if(t_3) {t_3 = runtime.fromIterator(t_3);
var t_2 = t_3.length;
for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("name", t_4);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "\n                        <th>s<sub>";
output += runtime.suppressValue(t_4, env.opts.autoescape);
output += "</sub></th>\n                    ";
;
}
}
frame = frame.pop();
output += "\n                </tr>\n                <tr>\n                    ";
frame = frame.push();
var t_7 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "state")),"encoding");
if(t_7) {t_7 = runtime.fromIterator(t_7);
var t_6 = t_7.length;
for(var t_5=0; t_5 < t_7.length; t_5++) {
var t_8 = t_7[t_5];
frame.set("value", t_8);
frame.set("loop.index", t_5 + 1);
frame.set("loop.index0", t_5);
frame.set("loop.revindex", t_6 - t_5);
frame.set("loop.revindex0", t_6 - t_5 - 1);
frame.set("loop.first", t_5 === 0);
frame.set("loop.last", t_5 === t_6 - 1);
frame.set("loop.length", t_6);
output += "\n                        <td><input type=\"button\" class=\"automata-bool\" value=\"";
output += runtime.suppressValue(t_8, env.opts.autoescape);
output += "\"></td>\n                    ";
;
}
}
frame = frame.pop();
output += "\n                </tr>\n            </table>\n        ";
;
}
output += "\n    </td>\n    <td class=\"create-transition\" colspan=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "model")),"world")),"sensors")),"length") + runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "model")),"world")),"actuators")),"length") + 3, env.opts.autoescape);
output += "\">\n        <button title=\"Create a transition\"><i class=\"fa fa-plus-circle\"></i></button>\n    </td>\n</tr>\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
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
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["TransitionTable-transition.tpl.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "<td class=\"remove-transition\"><button title=\"Remove this transition\"><i class=\"fa fa-minus-circle\"></i></button></td>\n";
frame = frame.push();
var t_3 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "transition")),"inputs");
if(t_3) {t_3 = runtime.fromIterator(t_3);
var t_2 = t_3.length;
for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("value", t_4);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "\n    <td class=\"transition-input\"><input type=\"button\" class=\"automata-bool\" value=\"";
output += runtime.suppressValue(t_4, env.opts.autoescape);
output += "\"></td>\n";
;
}
}
frame = frame.pop();
output += "\n<td class=\"arrow\">&rarr;</td>\n";
frame = frame.push();
var t_7 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "transition")),"outputs");
if(t_7) {t_7 = runtime.fromIterator(t_7);
var t_6 = t_7.length;
for(var t_5=0; t_5 < t_7.length; t_5++) {
var t_8 = t_7[t_5];
frame.set("value", t_8);
frame.set("loop.index", t_5 + 1);
frame.set("loop.index0", t_5);
frame.set("loop.revindex", t_6 - t_5);
frame.set("loop.revindex0", t_6 - t_5 - 1);
frame.set("loop.first", t_5 === 0);
frame.set("loop.last", t_5 === t_6 - 1);
frame.set("loop.length", t_6);
output += "\n    <td class=\"transition-output\"><input type=\"button\" class=\"automata-bool\" value=\"";
output += runtime.suppressValue(t_8, env.opts.autoescape);
output += "\"></td>\n";
;
}
}
frame = frame.pop();
output += "\n<td class=\"target-state-name\">\n    <select>\n        ";
frame = frame.push();
var t_11 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "model")),"states");
if(t_11) {t_11 = runtime.fromIterator(t_11);
var t_10 = t_11.length;
for(var t_9=0; t_9 < t_11.length; t_9++) {
var t_12 = t_11[t_9];
frame.set("targetState", t_12);
frame.set("loop.index", t_9 + 1);
frame.set("loop.index0", t_9);
frame.set("loop.revindex", t_10 - t_9);
frame.set("loop.revindex0", t_10 - t_9 - 1);
frame.set("loop.first", t_9 === 0);
frame.set("loop.last", t_9 === t_10 - 1);
frame.set("loop.length", t_10);
output += "\n            <option value=\"";
output += runtime.suppressValue(runtime.memberLookup((t_12),"id"), env.opts.autoescape);
output += "\"\n                    ";
if(runtime.memberLookup((t_12),"id") == runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "transition")),"targetState")),"id")) {
output += " selected ";
;
}
output += ">\n                ";
output += runtime.suppressValue(runtime.memberLookup((t_12),"name"), env.opts.autoescape);
output += "\n            </option>\n        ";
;
}
}
frame = frame.pop();
output += "\n        <option value=\"#NewState#\">New state</option>\n    </select>\n</td>\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
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

