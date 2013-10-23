namespace(this, "automata.view", function (exports, globals) {
    "use strict";

    var STATE_RADIUS = 20;
    var STATE_LR_PADDING = 6;
    var STATE_TB_PADDING = 3;
    var TRANSITION_RADIUS = 6;
    var TRANSITION_END_FACTOR = 3;
    var TRANSITION_MARK_FACTOR = 6;
    var ZOOM_FACTOR = 1.05;

    exports.Diagram = Object.create(automata.model.Model).augment({
        
        init: function (model, container) {
            automata.model.Model.init.call(this);

            this.model = model;
            this.stateViews = {};
            this.transitionViews = {};
            this.transitionViewsByStates = {};

            this.x = 0;
            this.y = 0;
            this.zoom = 1;
            
            container.append(this.createView());

            this.setSize(100, 100);

            model.addListener("createState", this)
                 .addListener("afterRemoveState", this)
                 .addListener("createTransition", this)
                 .addListener("afterRemoveTransition", this);

            return this;
        },
        
        ready: function () {
            return $.when(true);
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
                var bbox = this.getStateBBox(this.model.statesById[sid]);
                result.states[sid] = {
                    x: bbox.x,
                    y: bbox.y
                };
            }
            
            for (var tid in this.transitionViews) {
                result.transitions[tid] = svg.center(this.transitionViews[tid].handle);
            }
            
            return result;
        },
        
        fromObject: function (obj, mapping) {
            this.x = obj.x;
            this.y = obj.y;
            this.zoom = obj.zoom;
            this.updateViewbox();
            
            for (var sid in obj.states) {
                this.putStateView(mapping[sid], obj.states[sid].x, obj.states[sid].y);
            }
            
            for (var tid in obj.transitions) {
                this.putTransitionHandle(mapping[tid], obj.transitions[tid].cx, obj.transitions[tid].cy);
            }
            
            return this;
        },
        
        createState: function (model, state) {
            state.addListener("changed", this.updateState, this);
            this.createStateView(state);
            this.fire("changed");
        },

        afterRemoveState: function (model, state) {
            this.root.removeChild(this.stateViews[state.id].wrapper);
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
        
        setSize: function (width, height) {
            svg.attr(this.root, {width: width, height: height});
            this.updateViewbox();
            return this;
        },
        
        updateViewbox: function () {
            svg.attr(this.root, {
                viewBox: this.x + " " + this.y + " " + this.getViewboxWidth() + " " + this.getViewboxHeight()
            })
        },
        
        getViewboxWidth: function () {
            return Number(svg.attr(this.root, "width")) / this.zoom;
        },
        
        getViewboxHeight: function () {
            return Number(svg.attr(this.root, "height")) / this.zoom;
        },
        
        getViewIdByStates: function (transition) {
            return transition.sourceState.id + "-" + transition.targetState.id;
        },
        
        createView: function () {
            // Create arrow head marker for transitions
            var path = svg.create("path", {d: "M0,0 L10,5 L0,10 L2,5 z"});
            
            var marker = svg.create("marker", {
                id: "arrow-head",
                viewBow: "0 0 10 10",
                refX: 10,
                refY: 5,
                markerWidth: 10,
                markerHeight: 10,
                markerUnits: "strokeWidth",
                orient: "auto"
            });
            marker.appendChild(path);
            
            var defs = svg.create("defs");
            defs.appendChild(marker);

            // Create dummy transition view for initial state
            var circle = svg.create("circle", {
                cx: TRANSITION_RADIUS,
                cy: TRANSITION_RADIUS,
                r:  TRANSITION_RADIUS
            });
            
            var path = svg.create("path", {
                "marker-end": "url(#arrow-head)",
                d: "M" + TRANSITION_RADIUS + "," + TRANSITION_RADIUS +
                   "c" +      TRANSITION_RADIUS  + "," + 0                       + "," +
                         (3 * TRANSITION_RADIUS) + "," +      TRANSITION_RADIUS  + "," +
                         (3 * TRANSITION_RADIUS) + "," + (3 * TRANSITION_RADIUS)
            });

            this.resetView = svg.create("g", {"class": "reset transition"});
            this.resetView.appendChild(circle);
            this.resetView.appendChild(path);
            
            this.root = svg.create("svg", {
                "class": "automata-Diagram",
                preserveAspectRatio: "xMidYMid meet"
            });
            
            svg.setDraggable(this.root, {
                onDrag: function (dx, dy) {
                    this.x -= dx / this.zoom;
                    this.y -= dy / this.zoom;
                    this.updateViewbox();
                },
                context: this
            });
            
            var self = this;
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
                self.x += self.getViewboxWidth()  * (1 - f) / 2;
                self.y += self.getViewboxHeight() * (1 - f) / 2;
                self.updateViewbox();
            }
            
            this.root.addEventListener("DOMMouseScroll", onWheel, false); // Mozilla
            this.root.onmousewheel = onWheel;

            this.root.appendChild(defs);
            this.root.appendChild(this.resetView);
            return this.root;
        },
        
        createStateView: function (state) {
            var view = this.stateViews[state.id] = {
                rect:      svg.create("rect", {x: 0, y: 0, rx: STATE_RADIUS, ry: STATE_RADIUS}),
                name:      svg.create("text", "Qq"),
                actions:   svg.create("text", "Qq"),
                separator: svg.create("line", {x1: 0}),
                group:     svg.create("g"),
                wrapper:   svg.create("g", {"class": "state"})
            };

            view.group.appendChild(view.rect);
            view.group.appendChild(view.name);
            view.group.appendChild(view.actions);
            view.group.appendChild(view.separator);
            view.wrapper.appendChild(view.group);
            this.root.appendChild(view.wrapper);

            // Set vertical position of State name
            var nameBBox = view.name.getBBox();
            svg.attr(view.name, {y: nameBBox.height});

            // Set vertical position of State actions
            var actionsBBox = view.actions.getBBox();
            svg.attr(view.actions, {y: nameBBox.height + actionsBBox.height + 2 * STATE_TB_PADDING});

            // Setup transition for initial state
            
            svg.attr(view.separator, {
                y1: nameBBox.height + 2 * STATE_TB_PADDING,
                y2: nameBBox.height + 2 * STATE_TB_PADDING
            });
            
            var rectHeight = nameBBox.height + actionsBBox.height + 4 * STATE_TB_PADDING;
            svg.attr(view.rect, {height: rectHeight});

            this.updateStateView(state);

            // Move state group to a random location
            var rectWidth = Number(svg.attr(view.rect, "width"));
            var gx = this.x + (this.getViewboxWidth() - rectWidth)   * Math.random();
            var gy = this.y + (this.getViewboxHeight() - rectHeight) * Math.random();
            this.putStateView(state, gx, gy);

            svg.setDraggable(view.wrapper, {
                onDrag: function (dx, dy) {
                    var bbox = view.wrapper.getBBox();
                    this.putStateView(state, bbox.x + dx, bbox.y + dy);
                },
                onDrop: function () {
                    this.fire("changed");
                },
                context: this
            });
        },
        
        putStateView: function (state, x, y) {
            svg.attr(this.stateViews[state.id].group, {"transform": "translate(" + x + "," + y + ")"});

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
            svg.text(view.name,    state.name                         || "\u2000");
            svg.text(view.actions, state.getMooreActions().join(", ") || "\u2000");

            var maxWidth = Math.max(view.name.getComputedTextLength(), view.actions.getComputedTextLength());
            svg.attr(view.name,      {x:     maxWidth / 2 +     STATE_LR_PADDING});
            svg.attr(view.actions,   {x:     maxWidth / 2 +     STATE_LR_PADDING});
            svg.attr(view.rect,      {width: maxWidth     + 2 * STATE_LR_PADDING});
            svg.attr(view.separator, {x2:    maxWidth     + 2 * STATE_LR_PADDING});

            if (state === this.model.states[0]) {
                this.updateResetView();
            }
        },
        
        getStateBBox: function (state) {
            return this.stateViews[state.id].wrapper.getBBox();
        },
        
        updateResetView: function () {
            var state = this.model.states[0];
            if (state) {
                var bbox = this.getStateBBox(state);
                svg.attr(this.resetView, {
                    "transform": "translate(" + (bbox.x + bbox.width / 2 - 4 * TRANSITION_RADIUS) + ","
                                              + (bbox.y                  - 4 * TRANSITION_RADIUS) + ")"
                });
            }
        },
        
        createTransitionView: function (transition) {
            var viewIdByStates = this.getViewIdByStates(transition);

            var view = this.transitionViews[transition.id] = this.transitionViewsByStates[viewIdByStates] = {
                handle: svg.create("circle", {r: TRANSITION_RADIUS}),
                path:   svg.create("path", {"marker-end": "url(#arrow-head)"}),
                text:   svg.create("text"),
                group:  svg.create("g", {"class": "transition"})
            };

            view.group.appendChild(view.path);
            view.group.appendChild(view.text);
            view.group.appendChild(view.handle);
            this.root.appendChild(view.group);

            this.updateTransitionHandle(transition);
            this.updateTransitionPath(transition);
            
            // Setup event handlers for transition
            svg.setDraggable(view.group, {
                canDrag: function () {
                    return transition.sourceState !== transition.targetState;
                },
                onDrag: function (dx, dy) {
                    var p = svg.center(view.handle);
                    this.putTransitionHandle(transition, p.cx + dx, p.cy + dy);
                },
                onDrop: function () {
                    this.fire("changed");
                },
                context: this
            });
        },
        
        putTransitionHandle: function (transition, x, y) {
            svg.attr(this.transitionViews[transition.id].handle, {
                cx: x,
                cy: y
            });
            
            this.updateTransitionPath(transition);
            this.moveTransitionText(transition);
        },
        
        updateTransitionHandle: function (transition) {
            var view = this.transitionViews[transition.id];

            var sourceBBox = this.getStateBBox(transition.sourceState);
            var targetBBox = this.getStateBBox(transition.targetState);
            
            var cx, cy;
            if (transition.sourceState === transition.targetState) {
                cx = sourceBBox.x + sourceBBox.width + 4 * TRANSITION_RADIUS;
                cy = sourceBBox.y + sourceBBox.height / 2;
            }
            else {
                cx = (sourceBBox.x + sourceBBox.width  / 2 + targetBBox.x + targetBBox.width  / 2) / 2;
                cy = (sourceBBox.y + sourceBBox.height / 2 + targetBBox.y + targetBBox.height / 2) / 2;
            }

            svg.attr(view.handle, {cx: cx, cy: cy});
            this.moveTransitionText(transition);
        },
        
        updateTransitionText: function (transition) {
            var view = this.transitionViews[transition.id];

            svg.clear(view.text);
            
            var sensors = transition.sourceState.stateMachine.world.sensors;
            var actuators = transition.sourceState.stateMachine.world.actuators;
            var transitions = transition.sourceState.getTransitionsToState(transition.targetState);
            var mooreActions = transition.sourceState.getMooreActions();
            
            var hasTerms = false;
            transitions.forEach(function (tr) {
                var termSpan = svg.create("tspan", {dy: "1em"});
                
                if (hasTerms) {
                    svg.text(termSpan, "+");
                }

                var hasInputs = false;
                tr.inputs.forEach(function (value, index) {
                    if (value !== "-") {
                        var inputSpan = svg.create("tspan", sensors[index]);
                        svg.attr(inputSpan, {"class": "automata-bool-" + value});
                        if (hasInputs) {
                            termSpan.appendChild(svg.createText("."));
                        }
                        hasInputs = true;
                        termSpan.appendChild(inputSpan);
                    }
                }, this);
                
                var hasActions = false;
                tr.outputs.forEach(function (value, index) {
                    if (value === "1" && mooreActions.indexOf(actuators[index]) === -1) {
                        if (hasActions) {
                            termSpan.appendChild(svg.createText(", "));
                        }
                        else {
                            termSpan.appendChild(svg.createText(" / "));
                            hasActions = true;
                        }
                        termSpan.appendChild(svg.createText(actuators[index]));
                    }
                }, this);
                
                if (hasInputs || hasActions) {
                    hasTerms = true;
                    view.text.appendChild(termSpan);
                }
            }, this);
            
            this.moveTransitionText(transition);
        },
        
        moveTransitionText: function (transition) {
            var view = this.transitionViews[transition.id];
            var p = svg.center(view.handle);

            var x = p.cx + 2 * TRANSITION_RADIUS;
            var y = p.cy - view.text.getBBox().height / 2;

            svg.attr(view.text, {y: y});
            
            var tspans = view.text.childNodes;
            for (var t = 0; t < tspans.length; t ++) {
                svg.attr(tspans[t], {x: x});
            }
        },
        
        updateTransitionPath: function (transition) {
            var view = this.transitionViews[transition.id];
            
            var sourceBBox = this.getStateBBox(transition.sourceState);
            var targetBBox = this.getStateBBox(transition.targetState);

            var scx = sourceBBox.x + sourceBBox.width  / 2;
            var scy = sourceBBox.y + sourceBBox.height / 1.5;

            var sp = [
                {x: scx,                             y: sourceBBox.y,                     dx:  0, dy: -1},
                {x: scx,                             y: sourceBBox.y + sourceBBox.height, dx:  0, dy:  1},
                {x: sourceBBox.x,                    y: scy,                              dx: -1, dy:  0},
                {x: sourceBBox.x + sourceBBox.width, y: scy,                              dx:  1, dy:  0}
            ];

            var tcx = targetBBox.x + targetBBox.width  / 2;
            var tcy = targetBBox.y + targetBBox.height / 3;
            
            var tp = [
                {x: tcx,                             y: targetBBox.y,                     dx:  0, dy: -1},
                {x: tcx,                             y: targetBBox.y + targetBBox.height, dx:  0, dy:  1},
                {x: targetBBox.x,                    y: tcy,                              dx: -1, dy:  0},
                {x: targetBBox.x + targetBBox.width, y: tcy,                              dx:  1, dy:  0}
            ];
            
            var p = svg.center(view.handle);
            
            function getBestPoint(arr) {
                var dmin = -1, qmin = arr[0];
                for (var i = 0; i < arr.length; i ++) {
                    var q = arr[i];
                    var dx = q.x + q.dx * Math.abs(p.cx - q.x) - p.cx;
                    var dy = q.y + q.dy * Math.abs(p.cy - q.y) - p.cy;
                    var d = dx * dx + dy * dy;
                    if (dmin < 0 || d < dmin) {
                        dmin = d;
                        qmin = q;
                    }
                }
                return qmin;
            }
            
            var snp = getBestPoint(sp);
            var tnp = getBestPoint(tp);
            
            var vx = (tnp.x - snp.x) / TRANSITION_MARK_FACTOR;
            var vy = (tnp.y - snp.y) / TRANSITION_MARK_FACTOR;
            
            var scpx1 = snp.x + snp.dx * Math.abs(p.cx - snp.x) / TRANSITION_END_FACTOR;
            var scpy1 = snp.y + snp.dy * Math.abs(p.cy - snp.y) / TRANSITION_END_FACTOR;
            var scpx2 = p.cx - vx;
            var scpy2 = p.cy - vy;
            var tcpx1 = p.cx + vx;
            var tcpy1 = p.cy + vy;
            var tcpx2 = tnp.x + tnp.dx * Math.abs(p.cx - tnp.x) / TRANSITION_END_FACTOR;
            var tcpy2 = tnp.y + tnp.dy * Math.abs(p.cy - tnp.y) / TRANSITION_END_FACTOR;
            
            svg.attr(view.path, {
                d: "M" + snp.x + "," + snp.y
                 + "C" + scpx1 + "," + scpy1 + "," + scpx2 + "," + scpy2 + "," + p.cx  + "," + p.cy
                 + "C" + tcpx1 + "," + tcpy1 + "," + tcpx2 + "," + tcpy2 + "," + tnp.x + "," + tnp.y
            });
            
            if (transition.sourceState === transition.targetState) {
                this.updateTransitionHandle(transition);
            }
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
                this.root.removeChild(viewByTransition.group);
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
