
namespace(this, "automata.view", function (exports, globals) {
    "use strict";

    exports.TransitionTable = Object.create(exports.View).augment({
        templateFiles: {
            main:       "templates/TransitionTable-main.tpl.html",
            state:      "templates/TransitionTable-state.tpl.html",
            transition: "templates/TransitionTable-transition.tpl.html"
        },
        
        init: function (model, container) {
            exports.View.init.call(this, model, container);

            model.addListener("createState",            this)
                 .addListener("beforeRemoveState",      this)
                 .addListener("createTransition",       this)
                 .addListener("beforeRemoveTransition", this);

            return this;
        },
        
        onLoad: function () {
            this.root = $(this.templates.main(this.model)).appendTo(this.container);
            
            var model = this.model;
            $("input", this.root).click(function () {
                model.createState();
            });
        },
        
        createState: function (model, state) {
            state.addListener("changed", this.updateState, this);
            
            // Update target state selectors
            $("<option>").val(state.id).text(state.name).appendTo($("td.target-state-name select", this.root))
            
            // Create new row in the transition table
            var row = $(this.templates.state({state: state, model: model})).insertBefore($("tr", this.root).last());
            
            $("td.remove-state input", row).click(function () {
                model.removeState(state);
            });
            
            $("td.source-state-name input[type=text]", row).change(function () {
                state.setName($(this).val());
            });
            
            $("td.create-transition input", row).click(function () {
                model.createTransition(state, state);
            });
            
            $("table.state-encoding input", row).each(function (index) {
                $(this).click(function () {
                    var value = $(this).val() === "0" ? "1" : "0";
                    state.setEncoding(index, value);
                });
            });
        },
        
        getRowsForState: function (state) {
            return $("tr.state-" + state.id, this.root);
        },
        
        beforeRemoveState: function (model, state) {
            this.getRowsForState(state).remove();
            $("option[value='" + state.id + "']", this.root).remove();
        },
        
        updateState: function (state) {
            var rows = this.getRowsForState(state);
            $("td.source-state-name input[type=text]", rows).val(state.name);
            $("table.state-encoding input", rows).each(function (index) {
                $(this).val(state.encoding[index]);
            });
            $("option[value='" + state.id + "']", this.root).text(state.name);
        },
        
        createTransition: function (model, transition) {
            var state = transition.sourceState;

            transition.addListener("changed", this.updateTransition, this);

            // Append transition data in place of the "Add transition" button
            var rows = this.getRowsForState(state);
            var transitionRow = rows.last();
            var tdnt = $("td.create-transition", transitionRow);
            tdnt.after(this.templates.transition({transition: transition, model: model}));

            // Add handler for the "Remove transition" button
            $("td.remove-transition input", transitionRow).click(function () {
                model.removeTransition(transition);
            });
            
            // Add handlers for boolean values
            $("td.transition-input input", transitionRow).each(function (index) {
                $(this).click(function () {
                    var value = "0";
                    switch ($(this).val()) {
                        case "0": value = "1"; break;
                        case "1": value = "-"; break;
                        case "-": value = "0"; break;
                    }
                    transition.setInput(index, value);
                });
            });
            
            $("td.transition-output input", transitionRow).each(function (index) {
                $(this).click(function () {
                    var value = $(this).val() === "0" ? "1" : "0";
                    transition.setOutput(index, value);
                });
            });
            
            // Add handler for target state
            $("td.target-state-name select", transitionRow).change(function () {
                transition.setTargetState(model.statesById[$(this).val()]);
            });
            
            // Create a new row and move the "Add transition" button
            $("<tr>").addClass("state-" + state.id).append(tdnt).insertAfter(transitionRow);
            
            $("td.remove-state, td.source-state-name", rows).attr("rowspan", rows.length + 1);
        },
        
        updateTransition: function (transition) {
            var index = transition.getIndex();
            var row = this.getRowsForState(transition.sourceState).slice(index, index + 1);
            $("td.transition-input input", row).each(function (i) {
                $(this).val(transition.inputs[i]);
            });
            $("option[value=" + transition.targetState.id + "]", row).prop("selected", true);
            $("td.transition-output input", row).each(function (i) {
                $(this).val(transition.outputs[i]);
            });
        },
        
        beforeRemoveTransition: function (model, transition) {
            var index = transition.getIndex();
            var rows = this.getRowsForState(transition.sourceState);
            if (index > 0) {
                rows[index].remove();
            }
            else {
                var stn = $("td.source-state-name", rows);
                stn.nextAll().remove();
                stn.after(rows.slice(1, 2).children());
                rows.slice(1, 2).remove();
            }
            $("td.remove-state, td.source-state-name", rows.first()).attr("rowspan", rows.length - 1);
        }
    });
});
