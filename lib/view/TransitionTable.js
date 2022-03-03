
import {View} from "./View.js";

/**
 * @class TransitionTable
 * @memberof automata.view
 *
 * @todo Add documentation
 */
export class TransitionTable extends View {
    constructor(model, container) {
        super(model, container);

        model.addListener("createState",            this)
             .addListener("afterRemoveState",       this)
             .addListener("createTransition",       this)
             .addListener("beforeRemoveTransition", this)
             .addListener("afterRemoveTransition",  this)
             .addListener("currentStateChanged",    this);

        this.zoom = 1;
    }

    render() {
        this.container.innerHTML = nunjucks.render("TransitionTable-main.tpl.html", this.model);
        this.root = this.container.firstElementChild;
        this.root.querySelector(".create-state button").addEventListener("click", () => this.model.createState());
    }

    scale() {
        // Adjust state name input width
        const stateNameInputs = this.root.querySelectorAll(".source-state-name input[type=text]");
        let size = -1;
        for (const st of stateNameInputs) {
            if (size < 0 || st.value.length > size) {
                size = st.value.length;
            }
        }
        for (const st of stateNameInputs) {
            st.size = Math.max(4, size);
        }

        // Adjust zoom level, preserving the current scroll position
        const scrollTop = this.container.scrollTop / this.zoom;
        this.root.style.transform = "none";
        this.zoom = this.container.clientWidth / this.root.clientWidth; // FIXME compute innerWidth, width
        this.root.style.transform = `scale(${this.zoom})`;
        this.container.scrollTop = scrollTop * this.zoom;
    }

    scrollTo(elt) {
        scrollIntoView(elt, {scrollMode: "if-needed", block: "nearest", inline: "nearest"});
    }

    createState(model, state) {
        state.addListener("changed", this.updateState, this);

        // Add option to all target state selectors.
        for (const sel of this.root.querySelectorAll("td.target-state-name select")) {
            sel.lastElementChild.insertAdjacentHTML("beforebegin", `<option value="${state.id}">${state.name}</option>`);
        }

        // Create new row in the transition table
        this.root.querySelector("tr:last-child").insertAdjacentHTML("beforebegin", nunjucks.render("TransitionTable-state.tpl.html", {state: state, model: model}));

        // Add event handlers in new row.
        const row = this.root.querySelector(`.state-${state.id}`);
        row.querySelector("td.remove-state button").addEventListener("click", () => model.removeState(state));
        row.querySelector("td.source-state-name input[type=text]").addEventListener("change", evt => state.setName(evt.target.value));
        row.querySelector("td.create-transition button").addEventListener("click", () => model.createTransition(state, state));

        row.querySelectorAll("table.state-encoding input").forEach((td, index) => {
            td.addEventListener("click", () => state.setEncoding(index, td.textContext === "0" ? "1" : "0"));
        });

        this.scale();

        // Scroll to the new state row and focus the state name field
        this.scrollTo(row.firstElementChild);
        row.querySelector("input[type=text]").focus();
    }

    getRowsForState(state) {
        return Array.from(this.root.querySelectorAll("tr.state-" + state.id));
    }

    afterRemoveState(model, state) {
        for (const row of this.getRowsForState(state)) {
            row.parentElement.removeChild(row);
        }
        for (const opt of this.root.querySelectorAll(`option[value='${state.id}']`)) {
            opt.parentElement.removeChild(opt);
        }

        this.scale();
    }

    updateState(state) {
        const rows = this.getRowsForState(state);
        rows[0].querySelector(".source-state-name input[type=text]").value = state.name;
        rows[0].querySelectorAll(".state-encoding input").forEach((elt, index) => {
            elt.value = state.encoding[index];
        });

        for (const opt of this.root.querySelectorAll(`option[value='${state.id}']`)) {
            opt.innerHTML = state.name;
        }

        this.scale();
        this.scrollTo(rows[0].firstElementChild);
    }

    createTransition(model, transition) {
        const state = transition.sourceState;

        transition.addListener("changed", this.updateTransition, this);

        // Append transition data after the "Add transition" button.
        // Then move the "Add transition" button to a new row.
        const td = this.root.querySelector(`.state-${state.id} .create-transition`);
        const transitionRow = td.parentElement;
        transitionRow.insertAdjacentHTML("beforeend", nunjucks.render("TransitionTable-transition.tpl.html", {transition: transition, model: model}));
        transitionRow.insertAdjacentHTML("afterend", `<tr class="state-${state.id}"></tr>`);
        transitionRow.nextElementSibling.appendChild(td);

        // Add handler for the "Remove transition" button
        transitionRow.querySelector(".remove-transition button").addEventListener("click", () => model.removeTransition(transition));

        // Add handlers for boolean values
        transitionRow.querySelectorAll(".transition-input input").forEach((elt, index) => {
            elt.addEventListener("click", () => {
                let value = "0";
                switch (elt.value) {
                    case "0": value = "1"; break;
                    case "1": value = "-"; break;
                    case "-": value = "0"; break;
                }
                transition.setInput(index, value);
            });
        });

        transitionRow.querySelectorAll(".transition-output input").forEach((elt, index) => {
            elt.addEventListener("click", () => {
                transition.setOutput(index, elt.value === "0" ? "1" : "0");
            });
        });

        // Add handler for target state.
        transitionRow.querySelector(".target-state-name select").addEventListener("change", evt => {
            let targetId = evt.target.value;
            if (targetId === "#NewState#") {
                targetId = model.createState().id;
            }
            transition.setTargetState(model.statesById[targetId]);
        });

        const rows = this.getRowsForState(state);
        rows[0].querySelector(".remove-state").setAttribute("rowspan", rows.length);
        rows[0].querySelector(".source-state-name").setAttribute("rowspan", rows.length);

        this.showNonDeterministicTransitions(transition.sourceState);
        this.scale();
        this.scrollTo(transitionRow);
    }

    updateTransition(transition) {
        const index = transition.getIndex();
        const row = this.getRowsForState(transition.sourceState)[index];

        const inputs  = row.querySelectorAll("td.transition-input input");
        const outputs = row.querySelectorAll("td.transition-output input");
        const target  = row.querySelector(`option[value='${transition.targetState.id}']`);

        transition.inputs.forEach((v, i) => inputs[i].value = v);
        transition.outputs.forEach((v, i) => outputs[i].value = v);
        target.selected = "selected";

        this.showNonDeterministicTransitions(transition.sourceState);
        this.scale();
        this.scrollTo(row);
    }

    beforeRemoveTransition(model, transition) {
        const index = transition.getIndex();
        const rows = this.getRowsForState(transition.sourceState);
        let firstRow = rows[0];
        if (index === 0) {
            // Move the "remove state" button and the source state name to the next transition.
            firstRow = rows[1];
            firstRow.insertAdjacentElement("afterbegin", rows[0].querySelector(".source-state-name"));
            firstRow.insertAdjacentElement("afterbegin", rows[0].querySelector(".remove-state"));
        }
        rows[index].parentElement.removeChild(rows[index]);
        firstRow.querySelector(".remove-state").setAttribute("rowspan", rows.length - 1);
        firstRow.querySelector(".source-state-name").setAttribute("rowspan", rows.length - 1);
    }

    afterRemoveTransition(model, transition) {
        this.showNonDeterministicTransitions(transition.sourceState);
        this.scale();
    }

    showNonDeterministicTransitions(state) {
        const rows = this.getRowsForState(state);
        for (const t of state.outgoingTransitions) {
            const index = t.getIndex();
            if (t.isNonDeterministic()) {
                rows[index].classList.add("error");
            }
            else {
                rows[index].classList.remove("error");
            }
        }
    }

    currentStateChanged(model, state) {
        let scrolled = false;
        for (const tr of this.root.querySelectorAll("tr")) {
            if (state && tr.classList.contains(`state-${state.id}`)) {
                tr.classList.add("current");
                if (!scrolled) {
                    this.scrollTo(tr.firstElementChild);
                    scrolled = true;
                }
            }
            else {
                tr.classList.remove("current");
            }
        }
    }
}
