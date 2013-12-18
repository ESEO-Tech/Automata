
namespace("automata.view", function (exports) {
    "use strict";

    var STATE_RADIUS = 20;
    var STATE_LR_PADDING = 6;
    var STATE_TB_PADDING = 3;
    var TRANSITION_RADIUS = 6;
    var TRANSITION_HANDLE_FACTOR = 6;
    var ZOOM_FACTOR = 1.05;

    var DEFAULT_SPRING_FACTOR = 0.01;
    var LAYOUT_DECAY = 0.9;
    
    exports.Diagram = exports.View.create().augment({
        templates: {
            main: "templates/Diagram-main.tpl.svg"
        },        
        
        init: function (model, container) {
            exports.View.init.call(this, model, container);

            this.model = model;
            
            this.stateViews = [];
            this.stateViewsById = {};
            
            this.transitionViews = [];
            this.transitionViewsById = {};
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
            
            for (var sid in this.stateViewsById) {
                var stateView = this.stateViewsById[sid];
                result.states[sid] = {
                    x: stateView.x,
                    y: stateView.y
                };
            }
            
            for (var tid in this.transitionViewsById) {
                var transitionView = this.transitionViewsById[tid];
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
                if (sid in mapping && mapping[sid].id in this.stateViewsById) {
                    this.putStateView(mapping[sid], obj.states[sid].x, obj.states[sid].y);
                }
            }
            
            for (var tid in obj.transitions) {
                if (tid in mapping && mapping[tid].id in this.transitionViewsById) {
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
            var view = this.stateViewsById[state.id];
            view.group.remove();
            this.stateViews.splice(this.stateViews.indexOf(view), 1);
            delete this.stateViewsById[state.id];
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
                var view = this.transitionViewsById[transition.id] = this.transitionViewsByStates[viewIdByStates];
                view.transitions.push(transition);
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
            var viewByTransition = this.transitionViewsById[transition.id];
            
            if (viewByStates !== viewByTransition) {
                // It the target state has changed, check if the view
                // for the given transition should be removed
                this.removeTransitionViewIfUnused(transition);
                
                // If no view exists for the updated transition ends,
                // create a new transition view
                if (viewByStates) {
                    this.transitionViewsById[transition.id] = viewByStates;
                    viewByStates.transitions.push(transition);
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
            for (var i = 0; i < transition.sourceState.outgoingTransitions.length; i ++) {
                this.updateTransitionText(transition.sourceState.outgoingTransitions[i]);
            }

            this.layout();
        },
        
        layoutStep: function () {
            var done = true;
            
            var defaultSpringLength = 0;
            
            // Speed decay, to reduce oscillations
            for (var i1 = 0; i1 < this.stateViews.length; i1 ++) {
                var v1 = this.stateViews[i1];
                v1.vx *= LAYOUT_DECAY;
                v1.vy *= LAYOUT_DECAY;
                var l = 4 * (v1.width + v1.height);
                if (l > defaultSpringLength) {
                    defaultSpringLength = l;
                }
            }
            
            for (var i1 = 0; i1 < this.transitionViews.length; i1 ++) {
                var v1 = this.transitionViews[i1];
                v1.vx *= LAYOUT_DECAY;
                v1.vy *= LAYOUT_DECAY;
            }
            
            function updateSpeeds(v1, x1, y1, v2, x2, y2, l, factor) {
                var dx = x2 - x1;
                var dy = y2 - y1;
                var d = Math.sqrt(dx * dx + dy * dy);
                if (d !== 0) {
                    var f = factor * (d - l) / d;
                    v1.vx += f * dx;
                    v1.vy += f * dy;
                    v2.vx -= f * dx;
                    v2.vy -= f * dy;
                }
            }
            
            for (var i1 = 0; i1 < this.stateViews.length; i1 ++) {
                var v1 = this.stateViews[i1];
                var x1 = v1.x + v1.width / 2;
                var y1 = v1.y + v1.height / 2;
                
                // Compute forces between pairs of states
                for (var i2 = i1 + 1; i2 < this.stateViews.length; i2 ++) {
                    var v2 = this.stateViews[i2];
                    updateSpeeds(v1, x1, y1,
                                 v2, v2.x + v2.width / 2, v2.y + v2.height / 2,
                                 defaultSpringLength, DEFAULT_SPRING_FACTOR);
                }
                
                // Compute forces between states and transitions
                for (var i2 = 0; i2 < this.transitionViews.length; i2 ++) {
                    var v2 = this.transitionViews[i2];
                    if (v2.transitions[0].sourceState === v1.state && v2.transitions[0].targetState === v1.state) {
                        updateSpeeds(v1, x1, y1, v2, v2.x, v2.y, v1.width, DEFAULT_SPRING_FACTOR);
                    }
                    else if (v2.transitions[0].sourceState === v1.state || v2.transitions[0].targetState === v1.state) {
                        updateSpeeds(v1, x1, y1, v2, v2.x, v2.y, v1.width + v1.height, DEFAULT_SPRING_FACTOR);
                    }
                    else {
                        updateSpeeds(v1, x1, y1, v2, v2.x, v2.y, defaultSpringLength, DEFAULT_SPRING_FACTOR / 100);
                    }
                }
                
                if (v1.vx >= 0.5 || v1.vy >=0.5) {
                    done = false;
                }
                
                this.putStateView(v1.state, v1.x + v1.vx, v1.y + v1.vy);
            }

            for (var i1 = 0; i1 < this.transitionViews.length; i1 ++) {
                var v1 = this.transitionViews[i1];
                for (var i2 = i1 + 1; i2 < this.transitionViews.length; i2 ++) {
                    var v2 = this.transitionViews[i2];
                    if (v1.transitions[0].sourceState === v2.transitions[0].sourceState && v1.transitions[0].targetState === v2.transitions[0].targetState ||
                        v1.transitions[0].sourceState === v2.transitions[0].targetState && v1.transitions[0].targetState === v2.transitions[0].sourceState) {
                        updateSpeeds(v1, v1.x, v1.y, v2, v2.x, v2.y, Math.max((v1.width + v2.width + v1.height + v2.height) / 2, 4 * TRANSITION_RADIUS), 2 * DEFAULT_SPRING_FACTOR);
                    }
                    else {
                        updateSpeeds(v1, v1.x, v1.y, v2, v2.x, v2.y, defaultSpringLength, DEFAULT_SPRING_FACTOR / 100);
                    }
                }

                if (v1.vx >= 0.5 || v1.vy >=0.5) {
                    done = false;
                }
                
                this.putTransitionHandle(v1.transitions[0], v1.x + v1.vx, v1.y + v1.vy);
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
            var view = this.stateViewsById[state.id] = {
                state:     state,
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
            this.stateViews.push(view);
            
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
                for (var i = 0; i < state.outgoingTransitions.length; i ++) {
                    var transition = state.outgoingTransitions[i];
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
                    this.layout();
                    evt.stopPropagation();
                    evt.preventDefault();
                },
                this, this, this);
        },
        
        putStateView: function (state, x, y) {
            var view = this.stateViewsById[state.id];
            view.x = x;
            view.y = y;
            view.group.transform("translate(" + x + "," + y + ")");

            for (var i = 0; i < state.incomingTransitions.length; i ++) {
                this.updateTransitionPath(state.incomingTransitions[i]);
            }
            for (var i = 0; i < state.outgoingTransitions.length; i ++) {
                this.updateTransitionPath(state.outgoingTransitions[i]);
            }

            if (state === this.model.states[0]) {
                this.updateResetView();
            }
            return this;
        },
        
        updateStateView: function (state) {
            var view = this.stateViewsById[state.id];
            
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
                var view = this.stateViewsById[state.id];
                this.resetView.transform("translate(" + (view.x + view.width / 2 - 4 * TRANSITION_RADIUS) + "," +
                                                        (view.y                  - 4 * TRANSITION_RADIUS) + ")");
            }
        },
        
        createTransitionView: function (transition) {
            var viewIdByStates = this.getViewIdByStates(transition);

            var view = this.transitionViewsById[transition.id] = this.transitionViewsByStates[viewIdByStates] = {
                transitions: [transition],
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
            this.transitionViews.push(view);

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
            var view = this.transitionViewsById[transition.id];
            view.x = x;
            view.y = y;
            view.handle.attr({cx: x, cy: y});
            
            this.updateTransitionPath(transition);
            this.moveTransitionText(transition);
        },
        
        updateTransitionHandle: function (transition) {
            var view = this.transitionViewsById[transition.id];

            var sourceView = this.stateViewsById[transition.sourceState.id];
            var targetView = this.stateViewsById[transition.targetState.id];
            
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
            var view = this.transitionViewsById[transition.id];

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
            for (var i = 0; i < transitions.length; i ++) {
                var tr = transitions[i];
                
                var termSpan = this.paper.el("tspan").attr({"class": "term"});
                
                // This is a workaround for the fact that tspan.getBBox().height==0
                var dy = parseFloat(getComputedStyle(termSpan.node, null).getPropertyValue("font-size"));
                if (hasTerms) {
                    dy *= 1.5;
                    termSpan.attr({"#text": "+"});
                }

                termSpan.attr({dy: dy + "px"});
                    
                var hasInputs = false;
                for (var j = 0; j < tr.inputs.length; j ++) {
                    var value = tr.inputs[j];
                    if (value !== "-") {
                        var inputSpan = this.paper.el("tspan").attr({"class": "automata-bool-" + value});
                        inputSpan.attr({"#text": sensors[j].name});
                        if (hasInputs) {
                            termSpan.add(this.paper.el("tspan").attr({"#text": "."}));
                        }
                        hasInputs = true;
                        termSpan.add(inputSpan);
                    }
                }
                
                var hasActions = false;
                for (var j = 0; j < tr.outputs.length; j ++) {
                    if (tr.outputs[j] === "1" && mooreActions.indexOf(actuators[j].name) === -1) {
                        if (hasActions) {
                            termSpan.add(this.paper.el("tspan").attr({"#text": ", "}));
                        }
                        else {
                            termSpan.add(this.paper.el("tspan").attr({"#text": " / "}));
                            hasActions = true;
                        }
                        termSpan.add(this.paper.el("tspan").attr({"#text": actuators[j].name}));
                    }
                }
                
                if (hasInputs || hasActions) {
                    view.text.add(termSpan);

                    // This is a workaround for the fact that tspan.getBBox().width==0
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
            var view = this.transitionViewsById[transition.id];
            var x = view.x + 2 * TRANSITION_RADIUS;
            var y = view.y - view.height / 2;

            view.text.attr({x: x, y: y});
            view.text.selectAll("tspan.term").attr({x: x});
        },
        
        updateTransitionPath: function (transition) {
            var view = this.transitionViewsById[transition.id];
            
            var sourceView = this.stateViewsById[transition.sourceState.id];
            var targetView = this.stateViewsById[transition.targetState.id];

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
                    x: - view.y + sourceCenter.y,
                    y:   view.x - sourceCenter.x
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
            var viewByTransition = this.transitionViewsById[transition.id];
            viewByTransition.transitions.splice(viewByTransition.transitions.indexOf(transition), 1);
            
            // If no other transition uses the current transition view,
            // remove it from the DOM and from the dictionary of transition by states
            if (viewByTransition.transitions.length === 0) {
                viewByTransition.group.remove();
                this.transitionViews.splice(this.transitionViews.indexOf(viewByTransition), 1);
                for (var sid in this.transitionViewsByStates) {
                    if (this.transitionViewsByStates[sid] === viewByTransition) {
                        delete this.transitionViewsByStates[sid];
                        break;
                    }
                }
            }
            
            delete this.transitionViewsById[transition.id];
        },
        
        currentStateChanged: function (model, state) {
            this.paper.selectAll(".state").attr({"class": "state"});
            if (state) {
                this.stateViewsById[state.id].group.attr({"class": "state current"});
            }
        }
    });
});
