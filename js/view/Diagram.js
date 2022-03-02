
import {View} from "./View.js";

const STATE_RADIUS             = 20;
const STATE_LR_PADDING         = 6;
const STATE_TB_PADDING         = 3;
const TRANSITION_RADIUS        = 6;
const TRANSITION_HANDLE_FACTOR = 6;
const ZOOM_FACTOR              = 1.05;

const DEFAULT_SPRING_FACTOR    = 0.01;
const LAYOUT_DECAY             = 0.9;

/**
 * @class Diagram
 * @memberof automata.view
 *
 * @todo Add documentation
 */
export class Diagram extends View {
    constructor(model, container) {
        super(model, container);

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
    }

    toStorable() {
        const result = {
            x: this.x,
            y: this.y,
            zoom: this.zoom,
            states: {},
            transitions: {}
        };

        for (const sid in this.stateViewsById) {
            const stateView = this.stateViewsById[sid];
            result.states[sid] = {
                x: stateView.x,
                y: stateView.y
            };
        }

        for (const tid in this.transitionViewsById) {
            const transitionView = this.transitionViewsById[tid];
            result.transitions[tid] = {
                x: transitionView.x,
                y: transitionView.y
            };
        }

        return result;
    }

    fromStorable(obj, mapping) {
        this.x = obj.x;
        this.y = obj.y;
        this.zoom = obj.zoom;
        this.updateViewbox();

        for (const sid in obj.states) {
            if (sid in mapping && mapping[sid].id in this.stateViewsById) {
                this.putStateView(mapping[sid], obj.states[sid].x, obj.states[sid].y);
            }
        }

        for (const tid in obj.transitions) {
            if (tid in mapping && mapping[tid].id in this.transitionViewsById) {
                this.putTransitionHandle(mapping[tid], obj.transitions[tid].x, obj.transitions[tid].y);
            }
        }

        return this;
    }

    createState(model, state) {
        state.addListener("changed", this.updateState, this);
        this.createStateView(state);
        this.layout();
    }

    afterRemoveState(model, state) {
        const view = this.stateViewsById[state.id];
        view.group.remove();
        this.stateViews.splice(this.stateViews.indexOf(view), 1);
        delete this.stateViewsById[state.id];
        this.layout();
    }

    updateState(state) {
        this.updateStateView(state);
        this.layout();
    }

    createTransition(model, transition) {
        transition.addListener("changed", this.updateTransition, this);
        const viewIdByStates = this.getViewIdByStates(transition);
        if (viewIdByStates in this.transitionViewsByStates) {
            const view = this.transitionViewsById[transition.id] = this.transitionViewsByStates[viewIdByStates];
            view.transitions.push(transition);
        }
        else {
            this.createTransitionView(transition);
        }

        // Update source state view if Moore actions have changed
        this.updateStateView(transition.sourceState);

        this.layout();
    }

    afterRemoveTransition(model, transition) {
        this.removeTransitionViewIfUnused(transition);

        // Update source state view if Moore actions have changed
        this.updateStateView(transition.sourceState);

        this.layout();
    }

    updateTransition(transition) {
        const viewIdByStates = this.getViewIdByStates(transition);
        let viewByStates = this.transitionViewsByStates[viewIdByStates];
        let viewByTransition = this.transitionViewsById[transition.id];

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
        for (const t of transition.sourceState.outgoingTransitions) {
            this.updateTransitionText(t);
        }

        this.layout();
    }

    layoutStep() {
        // Speed decay, to reduce oscillations
        let defaultSpringLength = 0;
        for (const decayStateView of this.stateViews) {
            decayStateView.vx *= LAYOUT_DECAY;
            decayStateView.vy *= LAYOUT_DECAY;
            const l = 2.5 * (decayStateView.width + decayStateView.height);
            if (l > defaultSpringLength) {
                defaultSpringLength = l;
            }
        }

        for (const decayTransitionView of this.transitionViews) {
            decayTransitionView.vx *= LAYOUT_DECAY;
            decayTransitionView.vy *= LAYOUT_DECAY;
        }

        function updateSpeeds(v1, x1, y1, v2, x2, y2, l, factor) {
            const dx = x2 - x1;
            const dy = y2 - y1;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d !== 0) {
                const f = factor * (d - l) / d;
                v1.vx += f * dx;
                v1.vy += f * dy;
                v2.vx -= f * dx;
                v2.vy -= f * dy;
            }
        }

        const stateViewsLength      = this.stateViews.length;
        const transitionViewsLength = this.transitionViews.length;

        let done = true;

        for (let springStateIndex = 0; springStateIndex < stateViewsLength; springStateIndex ++) {
            const springStateView = this.stateViews[springStateIndex];
            const x1 = springStateView.x + springStateView.width / 2;
            const y1 = springStateView.y + springStateView.height / 2;

            // Compute forces between pairs of states
            for (let springOtherStateIndex = springStateIndex + 1; springOtherStateIndex < stateViewsLength; springOtherStateIndex ++) {
                const springOtherStateView = this.stateViews[springOtherStateIndex];
                updateSpeeds(springStateView, x1, y1,
                             springOtherStateView,
                             springOtherStateView.x + springOtherStateView.width / 2,
                             springOtherStateView.y + springOtherStateView.height / 2,
                             defaultSpringLength, DEFAULT_SPRING_FACTOR);
            }

            // Compute forces between states and transitions
            for (let springStateTransitionIndex = 0; springStateTransitionIndex < transitionViewsLength; springStateTransitionIndex ++) {
                const springStateTransitionView = this.transitionViews[springStateTransitionIndex];
                if (springStateTransitionView.transitions[0].sourceState === springStateView.state &&
                    springStateTransitionView.transitions[0].targetState === springStateView.state) {
                    updateSpeeds(springStateView, x1, y1,
                                 springStateTransitionView, springStateTransitionView.x, springStateTransitionView.y,
                                 springStateView.width, DEFAULT_SPRING_FACTOR);
                }
                else if (springStateTransitionView.transitions[0].sourceState === springStateView.state ||
                         springStateTransitionView.transitions[0].targetState === springStateView.state) {
                    updateSpeeds(springStateView, x1, y1,
                                 springStateTransitionView, springStateTransitionView.x, springStateTransitionView.y,
                                 springStateView.width + springStateView.height, DEFAULT_SPRING_FACTOR);
                }
                else {
                    updateSpeeds(springStateView, x1, y1,
                                 springStateTransitionView, springStateTransitionView.x, springStateTransitionView.y,
                                 defaultSpringLength, DEFAULT_SPRING_FACTOR / 100);
                }
            }

            if (springStateView.vx >= 0.5 || springStateView.vy >=0.5) {
                done = false;
            }

            this.putStateView(springStateView.state, springStateView.x + springStateView.vx, springStateView.y + springStateView.vy);
        }

        for (let springTransitionIndex = 0; springTransitionIndex < transitionViewsLength; springTransitionIndex ++) {
            const springTransitionView = this.transitionViews[springTransitionIndex];
            for (let springOtherTransitionIndex = springTransitionIndex + 1; springOtherTransitionIndex < transitionViewsLength; springOtherTransitionIndex ++) {
                const springOtherTransitionView = this.transitionViews[springOtherTransitionIndex];
                if (springTransitionView.transitions[0].sourceState === springOtherTransitionView.transitions[0].sourceState &&
                    springTransitionView.transitions[0].targetState === springOtherTransitionView.transitions[0].targetState ||
                    springTransitionView.transitions[0].sourceState === springOtherTransitionView.transitions[0].targetState &&
                    springTransitionView.transitions[0].targetState === springOtherTransitionView.transitions[0].sourceState) {
                    updateSpeeds(springTransitionView, springTransitionView.x, springTransitionView.y,
                                 springOtherTransitionView, springOtherTransitionView.x, springOtherTransitionView.y,
                                 Math.max((springTransitionView.width + springOtherTransitionView.width + springTransitionView.height + springOtherTransitionView.height) / 2, 4 * TRANSITION_RADIUS), 2 * DEFAULT_SPRING_FACTOR);
                }
                else {
                    updateSpeeds(springTransitionView, springTransitionView.x, springTransitionView.y,
                                 springOtherTransitionView, springOtherTransitionView.x, springOtherTransitionView.y,
                                 defaultSpringLength, DEFAULT_SPRING_FACTOR / 100);
                }
            }

            if (springTransitionView.vx >= 0.5 || springTransitionView.vy >=0.5) {
                done = false;
            }

            this.putTransitionHandle(springTransitionView.transitions[0], springTransitionView.x + springTransitionView.vx, springTransitionView.y + springTransitionView.vy);
        }

        if (done) {
            this.fire("changed");
        }

        return !done;
    }

    layout() {
        const step = () => {
            if (this.layoutStep()) {
                window.requestAnimationFrame(step);
            }
        }

        window.requestAnimationFrame(step);
    }

    render() {
        const fragment = Snap.parse(this.renderTemplate("Diagram-main.tpl.svg", this.model));
        this.container.append(fragment.node);
        this.paper = Snap("svg.automata-Diagram");
        this.resetView = this.paper.select("#reset");
        this.shadow = this.paper.select("#state-shadow");

        let startX, startY, startEvt;

        const onMouseDown = evt => {
            if (evt.button === 0) {
                startX = this.x;
                startY = this.y;
                startEvt = evt;

                $(document.documentElement).mousemove(onMouseMove);
                $(document.documentElement).mouseup(onMouseUp);

                evt.preventDefault();
                evt.stopPropagation();
            }
        }

        const onMouseMove = evt => {
            // The actual coordinates are computed each time the mouse moves
            // in case the document has been tranformed in between.
            this.x = startX - (evt.clientX - startEvt.clientX) / this.zoom;
            this.y = startY - (evt.clientY - startEvt.clientY) / this.zoom;
            this.updateViewbox();

            evt.preventDefault();
            evt.stopPropagation();
        }

        const onMouseUp = evt => {
            if (evt.button === 0) {
                this.fire("changed");

                $(document.documentElement).off("mouseup", onMouseUp);
                $(document.documentElement).off("mousemove", onMouseMove);

                evt.preventDefault();
                evt.stopPropagation();
            }
        }

        const onWheel = evt => {
            if (!evt) {
                evt = window.event;
            }

            let delta = 0;
            if (evt.wheelDelta) { // IE and Opera
                delta = evt.wheelDelta;
            }
            else if (evt.detail) { // Mozilla
                delta = -evt.detail;
            }

            let f = 1;
            if (delta > 0) {
                f = 1/ZOOM_FACTOR;
            }
            else if (delta < 0) {
                f = ZOOM_FACTOR;
            }
            this.zoom /= f;
            this.x += this.getWidth()  * (1 - f) / 2;
            this.y += this.getHeight() * (1 - f) / 2;
            this.updateViewbox();

            evt.stopPropagation();
            evt.preventDefault();
        }

        const onDoubleClick = evt => {
            const w = this.getWidth();
            const h = this.getHeight();
            const bb = this.paper.node.getBBox();
            this.zoom = Math.min(w / bb.width, h / bb.height);
            this.x = bb.x - (w / this.zoom - bb.width) / 2;
            this.y = bb.y - (h / this.zoom - bb.height) / 2;
            this.updateViewbox();

            evt.preventDefault();
            evt.stopPropagation();
        }

        this.paper.mousedown(onMouseDown).dblclick(onDoubleClick);
        this.paper.node.addEventListener("DOMMouseScroll", onWheel, false); // Mozilla
        this.paper.node.onmousewheel = onWheel;
    }

    getWidth() {
        return this.container.width();
    }

    getHeight() {
        return this.container.height();
    }

    updateViewbox() {
        const w = this.getWidth();
        const h = this.getHeight();
        this.paper.attr({
            viewBox: [this.x, this.y, w / this.zoom, h / this.zoom]
        });
    }

    getViewIdByStates(transition) {
        return transition.sourceState.id + "-" + transition.targetState.id;
    }

    createStateView(state) {
        const view = this.stateViewsById[state.id] = {
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
        const nameBBox = view.name.getBBox();
        view.name.attr({y: nameBBox.height});

        // Set vertical position of Moore actions
        const actionsBBox = view.actions.getBBox();
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
        const gx = this.x + (this.getWidth()  / this.zoom - view.width)   * Math.random();
        const gy = this.y + (this.getHeight() / this.zoom - view.height) * Math.random();
        this.putStateView(state, gx, gy);

        this.setDraggable(view, "group", (x, y) => {
            this.putStateView(state, x, y);
            for (const t of state.outgoingTransitions) {
                if (t.targetState === state) {
                    this.updateTransitionHandle(t);
                    this.updateTransitionPath(t);
                }
            }
        });
    }

    setDraggable(view, elt, fn) {
        let startX, startY;
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
    }

    putStateView(state, x, y) {
        const view = this.stateViewsById[state.id];
        view.x = x;
        view.y = y;
        view.group.transform("translate(" + x + "," + y + ")");

        for (const t of state.incomingTransitions) {
            this.updateTransitionPath(t);
        }
        for (const t of state.outgoingTransitions) {
            this.updateTransitionPath(t);
        }

        if (state === this.model.states[0]) {
            this.updateResetView();
        }
        return this;
    }

    updateStateView(state) {
        const view = this.stateViewsById[state.id];

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
    }

    updateResetView() {
        const state = this.model.states[0];
        if (state) {
            const view = this.stateViewsById[state.id];
            this.resetView.transform("translate(" + (view.x + view.width / 2 - 4 * TRANSITION_RADIUS) + "," +
                                                    (view.y                  - 4 * TRANSITION_RADIUS) + ")");
        }
    }

    createTransitionView(transition) {
        const viewIdByStates = this.getViewIdByStates(transition);

        const view = this.transitionViewsById[transition.id] = this.transitionViewsByStates[viewIdByStates] = {
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
        this.setDraggable(view, "handle", (x, y) => this.putTransitionHandle(transition, x, y));
    }

    putTransitionHandle(transition, x, y) {
        const view = this.transitionViewsById[transition.id];
        view.x = x;
        view.y = y;
        view.handle.attr({cx: x, cy: y});

        this.updateTransitionPath(transition);
        this.moveTransitionText(transition);
    }

    updateTransitionHandle(transition) {
        const view = this.transitionViewsById[transition.id];

        const sourceView = this.stateViewsById[transition.sourceState.id];
        const targetView = this.stateViewsById[transition.targetState.id];

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
    }

    updateTransitionText(transition) {
        const view = this.transitionViewsById[transition.id];

        view.text.selectAll("tspan.term").forEach(ts => ts.remove());

        const sensors      = transition.sourceState.stateMachine.world.sensors;
        const actuators    = transition.sourceState.stateMachine.world.actuators;
        const transitions  = transition.sourceState.getTransitionsToState(transition.targetState);
        const mooreActions = transition.sourceState.getMooreActions();

        view.height = 0;
        view.width  = 0;

        let hasTerms = false;
        for (const tr of transitions) {
            const termSpan = this.paper.el("tspan").attr({"class": "term"});

            // This is a workaround for the fact that tspan.getBBox().height==0
            let dy = parseFloat(getComputedStyle(termSpan.node, null).getPropertyValue("font-size"));
            if (hasTerms) {
                dy *= 1.5;
                termSpan.attr({"#text": "+"});
            }

            termSpan.attr({dy: dy + "px"});

            let hasInputs = false;
            const inputsLength = tr.inputs.length;
            for (let inputIndex = 0; inputIndex < inputsLength; inputIndex ++) {
                const value = tr.inputs[inputIndex];
                if (value !== "-") {
                    const inputSpan = this.paper.el("tspan").attr({"class": "automata-bool-" + value});
                    inputSpan.attr({"#text": sensors[inputIndex].name});
                    if (hasInputs) {
                        termSpan.add(this.paper.el("tspan").attr({"#text": "."}));
                    }
                    hasInputs = true;
                    termSpan.add(inputSpan);
                }
            }

            let hasActions = false;
            const outputsLength = tr.outputs.length;
            for (let outputIndex = 0; outputIndex < outputsLength; outputIndex ++) {
                if (tr.outputs[outputIndex] === "1" && mooreActions.indexOf(actuators[outputIndex].name) === -1) {
                    if (hasActions) {
                        termSpan.add(this.paper.el("tspan").attr({"#text": ", "}));
                    }
                    else {
                        termSpan.add(this.paper.el("tspan").attr({"#text": " / "}));
                        hasActions = true;
                    }
                    termSpan.add(this.paper.el("tspan").attr({"#text": actuators[outputIndex].name}));
                }
            }

            if (hasInputs || hasActions) {
                view.text.add(termSpan);

                // This is a workaround for the fact that tspan.getBBox().width==0
                const termSpanLength = termSpan.node.getComputedTextLength();
                if (termSpanLength > view.width) {
                    view.width = termSpanLength;
                }

                view.height += dy;

                hasTerms = true;
            }
        }

        this.moveTransitionText(transition);
    }

    moveTransitionText(transition) {
        const view = this.transitionViewsById[transition.id];
        const x = view.x + 2 * TRANSITION_RADIUS;
        const y = view.y - view.height / 2;

        view.text.attr({x: x, y: y});
        view.text.selectAll("tspan.term").attr({x: x});
    }

    updateTransitionPath(transition) {
        const view = this.transitionViewsById[transition.id];

        const sourceView = this.stateViewsById[transition.sourceState.id];
        const targetView = this.stateViewsById[transition.targetState.id];

        // Compute coordinates of source and target state views
        const sourceCenter = {
            x: sourceView.x + sourceView.width / 2,
            y: sourceView.y + sourceView.height / 2
        };

        const targetCenter = {
            x: targetView.x + targetView.width / 2,
            y: targetView.y + targetView.height / 2
        };

        // Compute Bezier control points
        const tangentVector = transition.sourceState !== transition.targetState ?
            {
                x: (targetCenter.x - sourceCenter.x) / TRANSITION_HANDLE_FACTOR,
                y: (targetCenter.y - sourceCenter.y) / TRANSITION_HANDLE_FACTOR
            } :
            {
                x: - view.y + sourceCenter.y,
                y:   view.x - sourceCenter.x
            };

        const sourceControl = {
            x: view.x - tangentVector.x,
            y: view.y - tangentVector.y
        };

        const targetControl = {
            x: view.x + tangentVector.x,
            y: view.y + tangentVector.y
        };

        // Compute source and target ends
        function intersection(cp, v, vc) {
            let xv = (cp.x < vc.x) ? v.x : v.x + v.width;
            let yv = (cp.y - vc.y) * (xv - vc.x) / (cp.x - vc.x) + vc.y;

            if (yv < v.y || yv > v.y + v.height) {
                yv = cp.y < vc.y ? v.y : v.y + v.height;
                xv = (cp.x - vc.x) * (yv - vc.y) / (cp.y - vc.y) + vc.x;
            }

            return {x : xv, y : yv};
        }

        const sourceIntersect = intersection(sourceControl, sourceView, sourceCenter);
        const targetIntersect = intersection(targetControl, targetView, targetCenter);

        view.path.attr({
            d: "M" + sourceIntersect.x     + "," + sourceIntersect.y +
               "Q" + sourceControl.x       + "," + sourceControl.y + "," + view.x            + "," + view.y +
               "Q" + targetControl.x       + "," + targetControl.y + "," + targetIntersect.x + "," + targetIntersect.y
        });
    }

    removeTransitionViewIfUnused(transition) {
        const viewByTransition = this.transitionViewsById[transition.id];
        viewByTransition.transitions.splice(viewByTransition.transitions.indexOf(transition), 1);

        // If no other transition uses the current transition view,
        // remove it from the DOM and from the dictionary of transition by states
        if (viewByTransition.transitions.length === 0) {
            viewByTransition.group.remove();
            this.transitionViews.splice(this.transitionViews.indexOf(viewByTransition), 1);
            for (const sid in this.transitionViewsByStates) {
                if (this.transitionViewsByStates[sid] === viewByTransition) {
                    delete this.transitionViewsByStates[sid];
                    break;
                }
            }
        }

        delete this.transitionViewsById[transition.id];
    }

    currentStateChanged(model, state) {
        this.paper.selectAll(".state").attr({"class": "state"});
        if (state) {
            this.stateViewsById[state.id].group.attr({"class": "state current"});
        }
    }
}
