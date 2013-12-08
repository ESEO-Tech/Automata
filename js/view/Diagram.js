namespace(this, "automata.view", function (exports) {
    "use strict";

    var STATE_RADIUS = 20;
    var STATE_LR_PADDING = 6;
    var STATE_TB_PADDING = 3;
    var TRANSITION_RADIUS = 6;
    var TRANSITION_HANDLE_FACTOR = 6;
    var ZOOM_FACTOR = 1.05;

    exports.Diagram = exports.View.create().augment({
        templates: {
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
                 .addListener("afterRemoveTransition", this)
                 .addListener("currentStateChanged", this);

            return this;
        },
        
        toStorable: function () {
            var result = {
                x: this.x,
                y: this.y,
                zoom: this.zoom,
                states: {},
                transitions: {}
            };
            
            for (var sid in this.stateViews) {
                var stateView = this.stateViews[sid];
                result.states[sid] = {
                    x: stateView.x,
                    y: stateView.y
                };
            }
            
            for (var tid in this.transitionViews) {
                var transitionView = this.transitionViews[tid];
                result.transitions[tid] = {
                    x: transitionView.x,
                    y: transitionView.y
                };
            }
            
            return result;
        },
        
        fromStorable: function (obj, mapping) {
            this.x = obj.x;
            this.y = obj.y;
            this.zoom = obj.zoom;
            this.updateViewbox();
            
            for (var sid in obj.states) {
                if (sid in mapping && mapping[sid].id in this.stateViews) {
                    this.putStateView(mapping[sid], obj.states[sid].x, obj.states[sid].y);
                }
            }
            
            for (var tid in obj.transitions) {
                if (tid in mapping && mapping[tid].id in this.transitionViews) {
                    this.putTransitionHandle(mapping[tid], obj.transitions[tid].x, obj.transitions[tid].y);
                }
            }
            
            return this;
        },
        
        createState: function (model, state) {
            state.addListener("changed", this.updateState, this);
            this.createStateView(state);
            this.layout();
        },

        afterRemoveState: function (model, state) {
            this.stateViews[state.id].group.remove();
            delete this.stateViews[state.id];
            this.layout();
        },
        
        updateState: function (state) {
            this.updateStateView(state);
            this.layout();
        },

        createTransition: function (model, transition) {
            transition.addListener("changed", this.updateTransition, this);
            var viewIdByStates = this.getViewIdByStates(transition);
            if (viewIdByStates in this.transitionViewsByStates) {
                this.transitionViews[transition.id] = this.transitionViewsByStates[viewIdByStates];
            }
            else {
                this.createTransitionView(transition);
            }

            // Update source state view if Moore actions have changed
            this.updateStateView(transition.sourceState);

            this.layout();
        },
        
        afterRemoveTransition: function (model, transition) {
            this.removeTransitionViewIfUnused(transition);

            // Update source state view if Moore actions have changed
            this.updateStateView(transition.sourceState);

            this.layout();
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
            forEach(ot of transition.sourceState.outgoingTransitions) {
                this.updateTransitionText(ot);
            }

            this.layout();
        },
        
        layoutStep: function () {
            var done = true;
            
            // TODO compute new position
            this.updateResetView();

            forEach(transition of this.model.transitions) {
                this.updateTransitionPath(transition);
            }

            if (done) {
                this.fire("changed");
            }
            
            return !done;
        },
        
        layout: function () {
            var self = this;
            function step() {
                if (self.layoutStep()) {
                    requestAnimationFrame(step);
                }
            }

            requestAnimationFrame(step);
        },
        
        render: function () {
            var fragment = Snap.parse(this.renderTemplate("main", this.model));
            this.container.append(fragment.node);
            this.paper = Snap("svg.automata-Diagram");
            this.resetView = this.paper.select("#reset");
            this.shadow = this.paper.select("#state-shadow");
            
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
            var w = this.getWidth();
            var h = this.getHeight();
            this.paper.attr({
                viewBox: [this.x, this.y, w / this.zoom, h / this.zoom]
            });
        },
        
        getViewIdByStates: function (transition) {
            return transition.sourceState.id + "-" + transition.targetState.id;
        },
        
        createStateView: function (state) {
            var view = this.stateViews[state.id] = {
                x:         0,
                y:         0,
                vx:        0,
                vy:        0,
                width:     0,
                height:    0,
                rect:      this.paper.rect(0, 0, 0, 0, STATE_RADIUS, STATE_RADIUS).attr({filter: this.shadow}),
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

            this.setDraggable(view, "group", function (x, y) {
                this.putStateView(state, x, y);
                forEach(transition of state.outgoingTransitions) {
                    if (transition.targetState === state) {
                        this.updateTransitionHandle(transition);
                        this.updateTransitionPath(transition);
                    }
                }
            });
        },
        
        setDraggable: function (view, elt, fn) {
            var startX, startY;
            view[elt].drag(
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

            forEach(transition of state.incomingTransitions) {
                this.updateTransitionPath(transition);
            }
            forEach(transition of state.outgoingTransitions) {
                this.updateTransitionPath(transition);
            }

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
                this.resetView.transform("translate(" + (view.x + view.width / 2 - 4 * TRANSITION_RADIUS) + "," +
                                                        (view.y                  - 4 * TRANSITION_RADIUS) + ")");
            }
        },
        
        createTransitionView: function (transition) {
            var viewIdByStates = this.getViewIdByStates(transition);

            var view = this.transitionViews[transition.id] = this.transitionViewsByStates[viewIdByStates] = {
                x:      0,
                y:      0,
                vx:     0,
                vy:     0,
                width:  0,
                height: 0,
                handle: this.paper.circle(0, 0, TRANSITION_RADIUS).attr({filter: this.shadow}),
                path:   this.paper.path().attr({markerEnd: this.paper.select("#arrow-head")}),
                text:   this.paper.text(""),
                textHandleGroup: this.paper.g(),
                group:  this.paper.g().attr({"class": "transition"})
            };

            view.textHandleGroup.add(view.text, view.handle);
            view.group.add(view.path, view.textHandleGroup);

            this.updateTransitionHandle(transition);
            this.updateTransitionPath(transition);
            
            // Setup event handlers for transition
            this.setDraggable(view, "handle", function (x, y) {
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
                view.x = sourceView.x + sourceView.width + sourceView.height;
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
            
            view.height = 0;
            view.width = 0;
            
            var hasTerms = false;
            forEach(tr of transitions) {
                var termSpan = this.paper.el("tspan").attr({"class": "term"});
                
                var dy = parseFloat(getComputedStyle(termSpan.node, null).getPropertyValue("font-size"));
                if (hasTerms) {
                    dy *= 1.5;
                }
                termSpan.attr({"#text": "+", dy: dy + "px"});

                var hasInputs = false;
                forEach(value, index of tr.inputs) {
                    if (value !== "-") {
                        var inputSpan = this.paper.el("tspan").attr({"class": "automata-bool-" + value});
                        inputSpan.attr({"#text": sensors[index].name});
                        if (hasInputs) {
                            termSpan.add(this.paper.el("tspan").attr({"#text": "."}));
                        }
                        hasInputs = true;
                        termSpan.add(inputSpan);
                    }
                }
                
                var hasActions = false;
                forEach(value, index of tr.outputs) {
                    if (value === "1" && mooreActions.indexOf(actuators[index].name) === -1) {
                        if (hasActions) {
                            termSpan.add(this.paper.el("tspan").attr({"#text": ", "}));
                        }
                        else {
                            termSpan.add(this.paper.el("tspan").attr({"#text": " / "}));
                            hasActions = true;
                        }
                        termSpan.add(this.paper.el("tspan").attr({"#text": actuators[index].name}));
                    }
                }
                
                if (hasInputs || hasActions) {
                    view.text.add(termSpan);

                    var l = termSpan.node.getComputedTextLength();
                    if (l > view.width) {
                        view.width = l;
                    }

                    view.height += dy;

                    hasTerms = true;
                }
            }
            
            this.moveTransitionText(transition);
        },
        
        moveTransitionText: function (transition) {
            var view = this.transitionViews[transition.id];
            var x = view.x + 2 * TRANSITION_RADIUS;
            console.log(view.width + " " + view.height);
            var y = view.y - view.height / 2;

            view.text.attr({x: x, y: y});
            view.text.selectAll("tspan.term").attr({x: x});
        },
        
        updateTransitionPath: function (transition) {
            var view = this.transitionViews[transition.id];
            
            var sourceView = this.stateViews[transition.sourceState.id];
            var targetView = this.stateViews[transition.targetState.id];

            // Compute coordinates of source and target state views
            var sourceCenter = {
                x: sourceView.x + sourceView.width / 2,
                y: sourceView.y + sourceView.height / 2
            };
            var targetCenter = {
                x: targetView.x + targetView.width / 2,
                y: targetView.y + targetView.height / 2
            };

            // Compute Bezier control points
            var tangentVector;
            if (transition.sourceState !== transition.targetState) {
                tangentVector = {
                    x: (targetCenter.x - sourceCenter.x) / TRANSITION_HANDLE_FACTOR,
                    y: (targetCenter.y - sourceCenter.y) / TRANSITION_HANDLE_FACTOR
                };
            }
            else {
                tangentVector = {
                    x: 0,
                    y: sourceView.height
                };
            }
            
            var sourceControl = {
                x: view.x - tangentVector.x,
                y: view.y - tangentVector.y
            };
            
            var targetControl = {
                x: view.x + tangentVector.x,
                y: view.y + tangentVector.y
            };
            
            // Compute source and target ends
            function intersection(cp, v, vc) {
                var xv = (cp.x < vc.x) ? v.x : v.x + v.width;
                var yv = (cp.y - vc.y) * (xv - vc.x) / (cp.x - vc.x) + vc.y;

                if (yv < v.y || yv > v.y + v.height) {
                    yv = cp.y < vc.y ? v.y : v.y + v.height;
                    xv = (cp.x - vc.x) * (yv - vc.y) / (cp.y - vc.y) + vc.x;
                }

                return {x : xv, y : yv};
            }
            
            var sourceIntersect = intersection(sourceControl, sourceView, sourceCenter);
            var targetIntersect = intersection(targetControl, targetView, targetCenter);

            view.path.attr({
                d: "M" + sourceIntersect.x     + "," + sourceIntersect.y +
                   "Q" + sourceControl.x       + "," + sourceControl.y + "," + view.x            + "," + view.y +
                   "Q" + targetControl.x       + "," + targetControl.y + "," + targetIntersect.x + "," + targetIntersect.y
            });
        },
        
        removeTransitionViewIfUnused: function (transition) {
            var viewByTransition = this.transitionViews[transition.id];

            // Find whether another transition uses the same view as the given transition
            var obsolete = true;
            for (var tid in this.transitionViews) {
                if (tid !== transition.id && this.transitionViews[tid] === viewByTransition) {
                    obsolete = false;
                    break;
                }
            }
            
            // If no other transition uses the current transition view,
            // remove it from the DOM and from the dictionary of transition by states
            if (obsolete) {
                viewByTransition.group.remove();
                for (var sid in this.transitionViewsByStates) {
                    if (this.transitionViewsByStates[sid] === viewByTransition) {
                        delete this.transitionViewsByStates[sid];
                        break;
                    }
                }
            }
            
            delete this.transitionViews[transition.id];
        },
        
        currentStateChanged: function (model, state) {
            this.paper.selectAll(".state").attr({"class": "state"});
            if (state) {
                this.stateViews[state.id].group.attr({"class": "state current"});
            }
        }
    });
});
