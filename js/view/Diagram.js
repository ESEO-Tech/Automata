namespace(this, "automata.view", function (exports, globals) {
    "use strict";

    var svg = {
        SVG_NS: "http://www.w3.org/2000/svg",

        create: function (tag, attrs) {
            var elt = document.createElementNS(this.SVG_NS, tag);
            switch (typeof attrs) {
                case "string": this.text(elt, attrs); break;
                case "object": this.attr(elt,  attrs); break;
            }
            return elt;
        },

        attr: function (elt, attrs) {
            if (typeof attrs === "string") {
                return elt.getAttribute(attrs);
            }
            else if (typeof attrs === "object") {
                for (var name in attrs) {
                    elt.setAttribute(name, attrs[name]);
                }
                return this;
            }
        },
        
        clear: function (elt) {
            while (elt.firstChild) {
                elt.firstChild.remove();
            }
        },
        
        text: function (elt, text) {
            this.clear(elt);
            elt.appendChild(document.createTextNode(text));
        },
        
        byTag: function (elt, tag) {
            return elt.getElementsByTagNameNS(this.SVG_NS, tag);
        }
    };
    
    exports.Diagram = {
        VIEWBOX_WIDTH: 400,
        VIEWBOX_HEIGHT: 600,
        STATE_RADIUS: 20,
        STATE_LR_PADDING: 6,
        STATE_TB_PADDING: 3,
        TRANSITION_RADIUS: 6,
        TRANSITION_END_FACTOR: 3,
        TRANSITION_MARK_FACTOR: 6,
        
        init: function (model, container) {
            this.model = model;
            this.stateViews = {};
            this.transitionViews = {};
            this.transitionViewsByStates = {};

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
            var circle = svg.create("circle", {cx: this.TRANSITION_RADIUS, cy: this.TRANSITION_RADIUS, r: this.TRANSITION_RADIUS});
            var path = svg.create("path", {
                "marker-end": "url(#arrow-head)",
                d: "M" + this.TRANSITION_RADIUS + "," + this.TRANSITION_RADIUS +
                   "c" +      this.TRANSITION_RADIUS  + "," + 0 + "," +
                         (3 * this.TRANSITION_RADIUS) + "," +      this.TRANSITION_RADIUS  + "," +
                         (3 * this.TRANSITION_RADIUS) + "," + (3 * this.TRANSITION_RADIUS)
            });

            this.resetView = svg.create("g", {"class": "reset transition"});
            this.resetView.appendChild(circle);
            this.resetView.appendChild(path);
            
            this.root = svg.create("svg", {
                "class": "automata-Diagram",
                viewBox: "0 0 " + this.VIEWBOX_WIDTH + " " + this.VIEWBOX_HEIGHT,
                preserveAspectRatio: "xMidYMid meet"
            });
            
            this.root.appendChild(defs);
            this.root.appendChild(this.resetView);

            container.append(this.root);

            model.addListener("createState", this)
                 .addListener("afterRemoveState", this)
                 .addListener("createTransition", this)
                 .addListener("afterRemoveTransition", this);

            return this;
        },
        
        setSize: function (width, height) {
            svg.attr(this.root, {width: width, height: height});
            return this;
        },
        
        createState: function (model, state) {
            state.addListener("changed", this.updateState, this);
            this.stateViews[state.id] = this.createStateView(state);
            this.updateStateView(state);
        },

        afterRemoveState: function (model, state) {
            this.root.removeChild(this.stateViews[state.id]);
            delete this.stateViews[state.id];
            this.updateResetView();
        },
        
        updateState: function (state) {
            this.updateStateView(state);

            // If the size of the state view has changed,
            // we need to redraw all transition paths to/from the given state
            state.outgoingTransitions.forEach(this.updateTransitionView, this);
            state.incomingTransitions.forEach(this.updateTransitionView, this);
        },

        createTransition: function (model, transition) {
            transition.addListener("changed", this.updateTransition, this)
            var viewIdByStates = transition.sourceState.id + "-" + transition.targetState.id;
            if (viewIdByStates in this.transitionViewsByStates) {
                this.transitionViews[transition.id] = this.transitionViewsByStates[viewIdByStates];
            }
            else {
                this.createTransitionView(transition);
            }
            
            // Update source state view if Moore actions have changed
            this.updateState(transition.sourceState);

            // TODO handle transition text
        },
        
        afterRemoveTransition: function (model, transition) {
            this.removeTransitionViewIfUnused(transition);
            // Update source state view if Moore actions have changed
            this.updateState(transition.sourceState);
        },
        
        updateTransition: function (transition) {
            var viewIdByStates = transition.sourceState.id + "-" + transition.targetState.id;
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
            this.updateState(transition.sourceState);

            // TODO handle transition text
        },
        
        getPoint: function (evt) {
            var p = this.root.createSVGPoint();
            p.x = evt.clientX;
            p.y = evt.clientY;
            return p.matrixTransform(this.root.getScreenCTM().inverse());
        },
        
        createStateView: function (state) {
            var rect = svg.create("rect", {x: 0, y: 0, rx: this.STATE_RADIUS, ry: this.STATE_RADIUS});
            var nameText = svg.create("text", "Qq");
            var actionsText = svg.create("text", "Qq");
            var line = svg.create("line");
            var g = svg.create("g");
            g.appendChild(rect);
            g.appendChild(nameText);
            g.appendChild(actionsText);
            g.appendChild(line);
            
            // Create wrapper group to correctly compute bounding box
            var w = svg.create("g", {"class": "state"});
            w.appendChild(g);

            this.root.appendChild(w);

            // Set vertical position of State name
            var nameBBox = nameText.getBBox();
            svg.attr(nameText, {y: -nameBBox.y + this.STATE_TB_PADDING});

            // Set vertical position of State actions
            var actionsBBox = nameText.getBBox();
            svg.attr(actionsText, {y: nameBBox.height + actionsBBox.height - actionsBBox.y + 2 * this.STATE_TB_PADDING});

            // Setup transition for initial state
            
            svg.attr(line, {
                x1: 0,
                y1: nameBBox.height + 2 * this.STATE_TB_PADDING,
                y2: nameBBox.height + 2 * this.STATE_TB_PADDING
            });
            
            svg.attr(rect, {height: nameBBox.height + actionsBBox.height + 4 * this.STATE_TB_PADDING});

            // Move state group to a random location
            var gx = this.VIEWBOX_WIDTH  * Math.random();
            var gy = this.VIEWBOX_HEIGHT * Math.random();
            svg.attr(g, {transform: "translate(" + gx + "," + gy + ")"});
            
            var self = this;
            var prev;
            
            function onMouseDown(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                if (evt.button === 0) {
                    prev = self.getPoint(evt);
                    document.documentElement.addEventListener("mouseup",   onMouseUp,   false);
                    document.documentElement.addEventListener("mousemove", onMouseMove, false);
                }
            }
            
            function onMouseMove(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                
                var bbox = w.getBBox();
                var current = self.getPoint(evt);
                
                var x = bbox.x + current.x - prev.x;
                if (x < 0) {
                    x = 0;
                }
                else if (x + bbox.width > self.VIEWBOX_WIDTH) {
                    x = self.VIEWBOX_WIDTH - bbox.width;
                }
                
                var y = bbox.y + current.y - prev.y;
                if (y < 0) {
                    y = 0;
                }
                else if (y + bbox.height > self.VIEWBOX_HEIGHT) {
                    y = self.VIEWBOX_HEIGHT - bbox.height;
                }
                
                svg.attr(g, {"transform": "translate(" + x + "," + y + ")"})
                
                prev = current;
                
                state.outgoingTransitions.forEach(self.updateTransitionView, self);
                state.incomingTransitions.forEach(self.updateTransitionView, self);
                
                if (state === self.model.states[0]) {
                    self.updateResetView();
                }
            }
            
            function onMouseUp(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                if (evt.button === 0) {
                    document.documentElement.removeEventListener("mouseup", onMouseUp, false);
                    document.documentElement.removeEventListener("mousemove", onMouseMove, false);
                }
            }
            
            w.addEventListener("mousedown", onMouseDown, false);
                
            return w;
        },
        
        updateStateView: function (state) {
            var view = this.stateViews[state.id];
            var rect = svg.byTag(view, "rect")[0];
            var texts = svg.byTag(view, "text");
            var nameText = texts[0];
            var actionsText = texts[1];
            var line = svg.byTag(view, "line")[0];
            var g    = svg.byTag(view, "g")[0];
            
            svg.text(nameText, state.name);
            svg.text(actionsText, state.getMooreActions().join(", "));

            var nameBBox = nameText.getBBox();
            var actionsBBox = actionsText.getBBox();
            var maxWidth = Math.max(nameBBox.width, actionsBBox.width);
            svg.attr(nameText,    {x:     maxWidth / 2 +     this.STATE_LR_PADDING});
            svg.attr(actionsText, {x:     maxWidth / 2 +     this.STATE_LR_PADDING});
            svg.attr(rect,        {width: maxWidth     + 2 * this.STATE_LR_PADDING});
            svg.attr(line,        {x2:    maxWidth     + 2 * this.STATE_LR_PADDING});
            
            var viewBBox = view.getBBox();
            var x = this.VIEWBOX_WIDTH - viewBBox.width;
            if (viewBBox.x < x) {
                x = viewBBox.x;
            }
            
            var y = this.VIEWBOX_HEIGHT - viewBBox.height;
            if (viewBBox.y < y) {
                y = viewBBox.y;
            }
            
            svg.attr(g, {transform: "translate(" + x + "," + y + ")"});
            
            if (state === this.model.states[0]) {
                this.updateResetView();
            }
        },
        
        updateResetView: function () {
            var state = this.model.states[0];
            if (state) {
                var bbox = this.stateViews[state.id].getBBox();
                svg.attr(this.resetView, {
                    "transform": "translate(" + (bbox.x + bbox.width / 2 - 4 * this.TRANSITION_RADIUS) + ","
                                              + (bbox.y                  - 4 * this.TRANSITION_RADIUS) + ")"
                });
            }
        },
        
        createTransitionView: function (transition) {
            var circle = svg.create("circle", {r: this.TRANSITION_RADIUS});
            var path = svg.create("path", {"marker-end": "url(#arrow-head)"});
            var g = svg.create("g", {"class": "transition"});
            g.appendChild(path);
            g.appendChild(circle);
            this.root.appendChild(g);

            var viewIdByStates = transition.sourceState.id + "-" + transition.targetState.id;
            this.transitionViews[transition.id] = this.transitionViewsByStates[viewIdByStates] = g;
            
            this.updateTransitionMark(transition);
            this.updateTransitionPath(transition);
            
            // Setup event handlers for transition
            var self = this;
            var prev;
            
            function onMouseDown(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                if (evt.button === 0 && transition.sourceState !== transition.targetState) {
                    prev = self.getPoint(evt);
                    document.documentElement.addEventListener("mouseup",   onMouseUp,   false);
                    document.documentElement.addEventListener("mousemove", onMouseMove, false);
                }
            }
            
            function onMouseMove(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                var current = self.getPoint(evt);
                svg.attr(circle, {
                    cx: Number(svg.attr(circle, "cx")) + current.x - prev.x,
                    cy: Number(svg.attr(circle, "cy")) + current.y - prev.y
                });
                prev = current;
                self.updateTransitionPath(transition);
            }
            
            function onMouseUp(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                if (evt.button === 0) {
                    document.documentElement.removeEventListener("mouseup",   onMouseUp,   false);
                    document.documentElement.removeEventListener("mousemove", onMouseMove, false);
                }
            }
            
            g.addEventListener("mousedown", onMouseDown, false);

            return g;
        },
        
        updateTransitionView: function (transition) {
            this.updateTransitionPath(transition);
            if (transition.sourceState === transition.targetState) {
                this.updateTransitionMark(transition);
            }
        },
            
        updateTransitionMark: function (transition) {
            var g = this.transitionViews[transition.id];
            var circle = svg.byTag(g, "circle")[0];

            var sourceBBox = this.stateViews[transition.sourceState.id].getBBox();
            var targetBBox = this.stateViews[transition.targetState.id].getBBox();
            
            if (transition.sourceState === transition.targetState) {
                svg.attr(circle, {
                    cx: sourceBBox.x - 4 * this.TRANSITION_RADIUS,
                    cy: sourceBBox.y + sourceBBox.height / 2
                });
            }
            else {
                svg.attr(circle, {
                    cx: (sourceBBox.x + sourceBBox.width  / 2 + targetBBox.x + targetBBox.width  / 2) / 2,
                    cy: (sourceBBox.y + sourceBBox.height / 2 + targetBBox.y + targetBBox.height / 2) / 2
                });
            }
        },
        
        updateTransitionPath: function (transition) {
            var g = this.transitionViews[transition.id];
            var circle = svg.byTag(g, "circle")[0];
            var path = svg.byTag(g, "path")[0];
            
            var sourceBBox = this.stateViews[transition.sourceState.id].getBBox();
            var targetBBox = this.stateViews[transition.targetState.id].getBBox();

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
            
            var cx = Number(svg.attr(circle, "cx"));
            var cy = Number(svg.attr(circle, "cy"));
            
            function getBestPoint(arr) {
                var dmin = -1, pmin = arr[0];
                for (var i = 0; i < arr.length; i ++) {
                    var p = arr[i];
                    var dx = p.x + p.dx * Math.abs(cx - p.x) - cx;
                    var dy = p.y + p.dy * Math.abs(cy - p.y) - cy;
                    var d = dx * dx + dy * dy;
                    if (dmin < 0 || d < dmin) {
                        dmin = d;
                        pmin = p;
                    }
                }
                return pmin;
            }
            
            var snp = getBestPoint(sp);
            var tnp = getBestPoint(tp);
            
            var vx = (tnp.x - snp.x) / this.TRANSITION_MARK_FACTOR;
            var vy = (tnp.y - snp.y) / this.TRANSITION_MARK_FACTOR;
            
            var scpx1 = snp.x + snp.dx * Math.abs(cx - snp.x) / this.TRANSITION_END_FACTOR;
            var scpy1 = snp.y + snp.dy * Math.abs(cy - snp.y) / this.TRANSITION_END_FACTOR;
            var scpx2 = cx - vx;
            var scpy2 = cy - vy;
            var tcpx1 = cx + vx;
            var tcpy1 = cy + vy;
            var tcpx2 = tnp.x + tnp.dx * Math.abs(cx - tnp.x) / this.TRANSITION_END_FACTOR;
            var tcpy2 = tnp.y + tnp.dy * Math.abs(cy - tnp.y) / this.TRANSITION_END_FACTOR;
            
            svg.attr(path, {
                d: "M" + snp.x + "," + snp.y
                 + "C" + scpx1 + "," + scpy1 + "," + scpx2 + "," + scpy2 + "," + cx    + "," + cy
                 + "C" + tcpx1 + "," + tcpy1 + "," + tcpx2 + "," + tcpy2 + "," + tnp.x + "," + tnp.y
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
                this.root.removeChild(viewByTransition);
                for (var id in this.transitionViewsByStates) {
                    if (this.transitionViewsByStates[id] === viewByTransition) {
                        delete this.transitionViewsByStates[id];
                        break;
                    }
                }
            }
            
            delete this.transitionViews[transition.id];
        }
    };
});
