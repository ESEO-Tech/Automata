namespace(this, "automata.view", function (exports, globals) {
    "use strict";

    var STATE_RADIUS = 20;
    var STATE_LR_PADDING = 6;
    var STATE_TB_PADDING = 3;
    var TRANSITION_RADIUS = 6;
    var TRANSITION_END_FACTOR = 3;
    var TRANSITION_MARK_FACTOR = 6;
    var ZOOM_FACTOR = 1.05;

    exports.Diagram = Object.create(exports.View).augment({
        templateFiles: {
            main: "templates/Diagram-main.tpl.svg"
        },        
        
        init: function (model, container) {
            exports.View.init.call(this, model, container);

            this.model = model;
            this.stateViews = {};
            this.transitionViews = {};
            this.transitionViewsByStates = {};

            this.x = 0;
            this.y = 0;
            this.zoom = 1;
            
            model.addListener("createState", this)
                 .addListener("afterRemoveState", this)
                 .addListener("createTransition", this)
                 .addListener("afterRemoveTransition", this);

            return this;
        },
        
        toObject: function () {
            var result = {
                x: this.x,
                y: this.y,
                zoom: this.zoom,
                states: {},
                transitions: {}
            };
            
            for (var sid in this.stateViews) {
                var view = this.stateViews[sid];
                result.states[sid] = {
                    x: view.x,
                    y: view.y
                };
            }
            
            for (var tid in this.transitionViews) {
                var view = this.transitionViews[tid];
                result.transitions[tid] = {
                    x: view.x,
                    y: view.y
                };
            }
            
            return result;
        },
        
        fromObject: function (obj, mapping) {
            this.x = obj.x;
            this.y = obj.y;
            this.zoom = obj.zoom;
            this.updateViewbox();
            
            for (var sid in obj.states) {
                if (mapping[sid].id in this.stateViews) {
                    this.putStateView(mapping[sid], obj.states[sid].x, obj.states[sid].y);
                }
            }
            
            for (var tid in obj.transitions) {
                if (mapping[tid].id in this.transitionViews) {
                    this.putTransitionHandle(mapping[tid], obj.transitions[tid].x, obj.transitions[tid].y);
                }
            }
            
            return this;
        },
        
        createState: function (model, state) {
            state.addListener("changed", this.updateState, this);
            this.createStateView(state);
            this.fire("changed");
        },

        afterRemoveState: function (model, state) {
            this.stateViews[state.id].group.remove();
            delete this.stateViews[state.id];
            this.updateResetView();
            this.fire("changed");
        },
        
        updateState: function (state) {
            this.updateStateView(state);

            // If the size of the state view has changed,
            // we need to redraw all transition paths to/from the given state
            state.outgoingTransitions.forEach(this.updateTransitionPath, this);
            state.incomingTransitions.forEach(this.updateTransitionPath, this);
            this.fire("changed");
        },

        createTransition: function (model, transition) {
            transition.addListener("changed", this.updateTransition, this)
            var viewIdByStates = this.getViewIdByStates(transition);
            if (viewIdByStates in this.transitionViewsByStates) {
                this.transitionViews[transition.id] = this.transitionViewsByStates[viewIdByStates];
            }
            else {
                this.createTransitionView(transition);
            }
            
            // Update source state view if Moore actions have changed
            this.updateState(transition.sourceState);
        },
        
        afterRemoveTransition: function (model, transition) {
            this.removeTransitionViewIfUnused(transition);
            // Update source state view if Moore actions have changed
            this.updateState(transition.sourceState);
        },
        
        updateTransition: function (transition) {
            var viewIdByStates = this.getViewIdByStates(transition);
            var viewByStates = this.transitionViewsByStates[viewIdByStates];
            var viewByTransition = this.transitionViews[transition.id];
            
            if (viewByStates !== viewByTransition) {
                // It the target state has changed, check if the view
                // for the given transition should be removed
                this.removeTransitionViewIfUnused(transition);
                
                // If no view exists for the updated transition ends,
                // create a new transition view
                if (viewByStates) {
                    this.transitionViews[transition.id] = viewByStates;
                }
                else {
                    viewByStates = this.createTransitionView(transition);
                }
                
                // Confirm the change of view for the given transition
                viewByTransition = viewByStates;
            }
            
            // Update source state view if Moore actions have changed
            this.updateStateView(transition.sourceState);

            // Update incoming and outgoing transition paths if Moore actions have changed.
            // Update outgoing transition conditions if conditions have changed.
            transition.sourceState.outgoingTransitions.forEach(function (ot) {
                this.updateTransitionPath(ot);
                this.updateTransitionText(ot);
            }, this);
            transition.sourceState.incomingTransitions.forEach(this.updateTransitionPath, this);
            this.fire("changed");
        },
        
        render: function () {
            var fragment = Snap.parse(this.templates.main(this.model));
            this.container.append(fragment.node);
            this.paper = Snap("svg.automata-Diagram");
            this.resetView = this.paper.select("#reset");
            
            var self = this;
            var startX, startY, startEvt;
            
            function onMouseDown(evt) {
                if (evt.button === 0) {
                    startX = self.x;
                    startY = self.y;
                    startEvt = evt;
                    
                    $(document.documentElement).mousemove(onMouseMove);
                    $(document.documentElement).mouseup(onMouseUp);

                    evt.preventDefault();
                    evt.stopPropagation();
                }                
            }
            
            function onMouseMove(evt) {
                // The actual coordinates are computed each time the mouse moves
                // in case the document has been tranformed in between.
                self.x = startX - (evt.clientX - startEvt.clientX) / self.zoom;
                self.y = startY - (evt.clientY - startEvt.clientY) / self.zoom;
                self.updateViewbox();

                evt.preventDefault();
                evt.stopPropagation();
            }
            
            function onMouseUp(evt) {
                self.fire("changed");
                
                if (evt.button === 0) {
                    $(document.documentElement).off("mouseup", onMouseUp);
                    $(document.documentElement).off("mousemove", onMouseMove);
                }
                
                evt.preventDefault();
                evt.stopPropagation();
            }
            
            function onWheel(evt) {
                evt.stopPropagation();
                evt.preventDefault();
                if (!evt) {
                    evt = window.event;
                }

                var delta = 0;
                if (evt.wheelDelta) { // IE and Opera
                    delta = evt.wheelDelta;
                }
                else if (evt.detail) { // Mozilla
                    delta = -evt.detail;
                }
                
                var f = 1;
                if (delta > 0) {
                    f = 1/ZOOM_FACTOR;
                }
                else if (delta < 0) {
                    f = ZOOM_FACTOR;
                }
                self.zoom /= f;
                self.x += self.getWidth()  * (1 - f) / 2;
                self.y += self.getHeight() * (1 - f) / 2;
                self.updateViewbox();
            }
            
            this.paper.mousedown(onMouseDown);
            this.paper.node.addEventListener("DOMMouseScroll", onWheel, false); // Mozilla
            this.paper.node.onmousewheel = onWheel;
        },
        
        getWidth: function () {
            return this.container.width();
        },
        
        getHeight: function () {
            return this.container.height();
        },
        
        updateViewbox: function () {
            this.paper.attr({viewBox: this.x + " " + this.y + " " + (this.getWidth() / this.zoom) + " " + (this.getHeight() / this.zoom)})
        },
        
        getViewIdByStates: function (transition) {
            return transition.sourceState.id + "-" + transition.targetState.id;
        },
        
        createStateView: function (state) {
            var view = this.stateViews[state.id] = {
                x:         0,
                y:         0,
                width:     0,
                height:    0,
                rect:      this.paper.rect(0, 0, 0, 0, STATE_RADIUS, STATE_RADIUS),
                name:      this.paper.text(0, 0, "State name"),
                actions:   this.paper.text(0, 0, "Moore actions"),
                separator: this.paper.line(0, 0, 0, 0),
                group:     this.paper.g().attr({"class": "state"})
            };

            view.group.add(view.rect, view.name, view.actions, view.separator);

            // Set vertical position of state name
            var nameBBox = view.name.getBBox();
            view.name.attr({y: nameBBox.height});

            // Set vertical position of Moore actions
            var actionsBBox = view.actions.getBBox();
            view.actions.attr({y: nameBBox.height + actionsBBox.height + 2 * STATE_TB_PADDING});

            // Set separator
            view.separator.attr({
                y1: nameBBox.height + 2 * STATE_TB_PADDING,
                y2: nameBBox.height + 2 * STATE_TB_PADDING
            });
            
            view.height = nameBBox.height + actionsBBox.height + 4 * STATE_TB_PADDING;
            view.rect.attr({height: view.height});

            this.updateStateView(state);

            // Move state group to a random location
            var gx = this.x + (this.getWidth()  / this.zoom - view.width)   * Math.random();
            var gy = this.y + (this.getHeight() / this.zoom - view.height) * Math.random();
            this.putStateView(state, gx, gy);

            this.setDraggable(view, function (x, y) {
                this.putStateView(state, x, y);
                state.outgoingTransitions.forEach(function (transition) {
                    if (transition.targetState === state) {
                        this.updateTransitionHandle(transition);
                        this.updateTransitionPath(transition);
                    }
                }, this)
            });
        },
        
        setDraggable: function (view, fn) {
            var startX, startY;
            view.group.drag(
                function onMove(dx, dy, x, y, evt) {
                    fn.call(this, startX + dx / this.zoom, startY + dy / this.zoom);
                    evt.stopPropagation();
                    evt.preventDefault();
                },
                function onStart(x, y, evt) {
                    startX = view.x;
                    startY = view.y;
                    evt.stopPropagation();
                    evt.preventDefault();
                },
                function onEnd(evt) {
                    this.fire("changed");
                    evt.stopPropagation();
                    evt.preventDefault();
                },
                this, this, this);
        },
        
        putStateView: function (state, x, y) {
            var view = this.stateViews[state.id];
            view.x = x;
            view.y = y;
            view.group.transform("translate(" + x + "," + y + ")");

            state.outgoingTransitions.forEach(this.updateTransitionPath, this);
            state.incomingTransitions.forEach(this.updateTransitionPath, this);

            if (state === this.model.states[0]) {
                this.updateResetView();
            }
            return this;
        },
        
        updateStateView: function (state) {
            var view = this.stateViews[state.id];
            
            // Replace empty strings with non-breaking spaces to ensure correct bounding box in Webkit
            view.name.attr({text: state.name || "\u2000"});
            view.actions.attr({text: state.getMooreActions().join(", ") || "\u2000"});

            view.width = Math.max(view.name.node.getComputedTextLength(), view.actions.node.getComputedTextLength()) + 2 * STATE_LR_PADDING;
            view.name.attr({x: view.width / 2});
            view.actions.attr({x: view.width / 2});
            view.rect.attr({width: view.width});
            view.separator.attr({x2: view.width});

            if (state === this.model.states[0]) {
                this.updateResetView();
            }
        },
        
        updateResetView: function () {
            var state = this.model.states[0];
            if (state) {
                var view = this.stateViews[state.id];
                this.resetView.transform("translate(" + (view.x + view.width / 2 - 4 * TRANSITION_RADIUS) + ","
                                                      + (view.y                  - 4 * TRANSITION_RADIUS) + ")");
            }
        },
        
        createTransitionView: function (transition) {
            var viewIdByStates = this.getViewIdByStates(transition);

            var view = this.transitionViews[transition.id] = this.transitionViewsByStates[viewIdByStates] = {
                x:      0,
                y:      0,
                handle: this.paper.circle(0, 0, TRANSITION_RADIUS),
                path:   this.paper.path().attr({markerEnd: this.paper.select("#arrow-head")}),
                text:   this.paper.text(""),
                group:  this.paper.g().attr({"class": "transition"})
            };

            view.group.add(view.path, view.text, view.handle);

            this.updateTransitionHandle(transition);
            this.updateTransitionPath(transition);
            
            // Setup event handlers for transition
            this.setDraggable(view, function (x, y) {
                this.putTransitionHandle(transition, x, y);
            });
        },
        
        putTransitionHandle: function (transition, x, y) {
            var view = this.transitionViews[transition.id];
            view.x = x;
            view.y = y;
            view.handle.attr({cx: x, cy: y});
            
            this.updateTransitionPath(transition);
            this.moveTransitionText(transition);
        },
        
        updateTransitionHandle: function (transition) {
            var view = this.transitionViews[transition.id];

            var sourceView = this.stateViews[transition.sourceState.id];
            var targetView = this.stateViews[transition.targetState.id];
            
            if (transition.sourceState === transition.targetState) {
                view.x = sourceView.x + sourceView.width + 4 * TRANSITION_RADIUS;
                view.y = sourceView.y + sourceView.height / 2;
            }
            else {
                view.x = (sourceView.x + sourceView.width  / 2 + targetView.x + targetView.width  / 2) / 2;
                view.y = (sourceView.y + sourceView.height / 2 + targetView.y + targetView.height / 2) / 2;
            }

            view.handle.attr({cx: view.x, cy: view.y});
            this.moveTransitionText(transition);
        },
        
        updateTransitionText: function (transition) {
            var view = this.transitionViews[transition.id];

            view.text.selectAll("tspan.term").forEach(function (ts) {
                ts.remove();
            });
            
            var sensors = transition.sourceState.stateMachine.world.sensors;
            var actuators = transition.sourceState.stateMachine.world.actuators;
            var transitions = transition.sourceState.getTransitionsToState(transition.targetState);
            var mooreActions = transition.sourceState.getMooreActions();
            
            var hasTerms = false;
            transitions.forEach(function (tr) {
                var termSpan = this.paper.el("tspan").attr({"class": "term", dy: "1em"});
                
                if (hasTerms) {
                    termSpan.attr({text: "+"});
                }

                var hasInputs = false;
                tr.inputs.forEach(function (value, index) {
                    if (value !== "-") {
                        var inputSpan = this.paper.el("tspan").attr({"class": "automata-bool-" + value});
                        inputSpan.attr({text: sensors[index]});
                        if (hasInputs) {
                            termSpan.add(this.paper.el("tspan").attr({text: "."}));
                        }
                        hasInputs = true;
                        termSpan.add(inputSpan);
                    }
                }, this);
                
                var hasActions = false;
                tr.outputs.forEach(function (value, index) {
                    if (value === "1" && mooreActions.indexOf(actuators[index]) === -1) {
                        if (hasActions) {
                            termSpan.add(this.paper.el("tspan").attr({text: ", "}));
                        }
                        else {
                            termSpan.add(this.paper.el("tspan").attr({text: " / "}));
                            hasActions = true;
                        }
                        termSpan.add(this.paper.el("tspan").attr({text: actuators[index]}));
                    }
                }, this);
                
                if (hasInputs || hasActions) {
                    hasTerms = true;
                    view.text.add(termSpan);
                }
            }, this);
            
            this.moveTransitionText(transition);
        },
        
        moveTransitionText: function (transition) {
            var view = this.transitionViews[transition.id];
            var x = view.x + 2 * TRANSITION_RADIUS;
            var y = view.y - view.text.getBBox().height / 2;

            view.text.attr({y: y});
            view.text.selectAll("tspan.term").attr({x: x});
        },
        
        updateTransitionPath: function (transition) {
            var view = this.transitionViews[transition.id];
            
            var sourceView = this.stateViews[transition.sourceState.id];
            var targetView = this.stateViews[transition.targetState.id];

            var scx = sourceView.x + sourceView.width  / 2;
            var scy = sourceView.y + sourceView.height / 1.5;

            var sp = [
                {x: scx,                             y: sourceView.y,                     dx:  0, dy: -1},
                {x: scx,                             y: sourceView.y + sourceView.height, dx:  0, dy:  1},
                {x: sourceView.x,                    y: scy,                              dx: -1, dy:  0},
                {x: sourceView.x + sourceView.width, y: scy,                              dx:  1, dy:  0}
            ];

            var tcx = targetView.x + targetView.width  / 2;
            var tcy = targetView.y + targetView.height / 3;
            
            var tp = [
                {x: tcx,                             y: targetView.y,                     dx:  0, dy: -1},
                {x: tcx,                             y: targetView.y + targetView.height, dx:  0, dy:  1},
                {x: targetView.x,                    y: tcy,                              dx: -1, dy:  0},
                {x: targetView.x + targetView.width, y: tcy,                              dx:  1, dy:  0}
            ];
            
            function getBestPoint(arr, other) {
                var dmin = -1, result = arr[0];
                for (var i = 0; i < arr.length; i ++) {
                    var p = arr[i];
                    if (!other || other.x !== p.x || other.y !== p.y) {
                        var dx = p.x + p.dx * Math.abs(view.x - p.x) - view.x;
                        var dy = p.y + p.dy * Math.abs(view.y - p.y) - view.y;
                        var d = dx * dx + dy * dy;
                        if (dmin < 0 || d < dmin) {
                            dmin = d;
                            result = p;
                        }
                    }
                }
                return result;
            }
            
            var snp = getBestPoint(sp);
            var tnp = getBestPoint(tp, snp);
            
            var vx = (tnp.x - snp.x) / TRANSITION_MARK_FACTOR;
            var vy = (tnp.y - snp.y) / TRANSITION_MARK_FACTOR;
            
            var scpx1 = snp.x + snp.dx * Math.abs(view.x - snp.x) / TRANSITION_END_FACTOR;
            var scpy1 = snp.y + snp.dy * Math.abs(view.y - snp.y) / TRANSITION_END_FACTOR;
            var scpx2 = view.x - vx;
            var scpy2 = view.y - vy;
            var tcpx1 = view.x + vx;
            var tcpy1 = view.y + vy;
            var tcpx2 = tnp.x + tnp.dx * Math.abs(view.x - tnp.x) / TRANSITION_END_FACTOR;
            var tcpy2 = tnp.y + tnp.dy * Math.abs(view.y - tnp.y) / TRANSITION_END_FACTOR;
            
            view.path.attr({
                d: "M" + snp.x + "," + snp.y
                 + "C" + scpx1 + "," + scpy1 + "," + scpx2 + "," + scpy2 + "," + view.x  + "," + view.y
                 + "C" + tcpx1 + "," + tcpy1 + "," + tcpx2 + "," + tcpy2 + "," + tnp.x   + "," + tnp.y
            });
        },
        
        removeTransitionViewIfUnused: function (transition) {
            var viewByTransition = this.transitionViews[transition.id];

            // Find whether another transition uses the same view as the given transition
            var obsolete = true;
            for (var id in this.transitionViews) {
                if (id !== transition.id && this.transitionViews[id] === viewByTransition) {
                    obsolete = false;
                    break;
                }
            }
            
            // If no other transition uses the current transition view,
            // remove it from the DOM and from the dictionary of transition by states
            if (obsolete) {
                viewByTransition.group.remove();
                for (var id in this.transitionViewsByStates) {
                    if (this.transitionViewsByStates[id] === viewByTransition) {
                        delete this.transitionViewsByStates[id];
                        break;
                    }
                }
            }
            
            delete this.transitionViews[transition.id];
        }
    });
});
