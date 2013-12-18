
namespace("automata.view", function (exports) {
    "use strict";

    exports.TransitionTable = exports.View.create().augment({
        templates: {
            main:       "templates/TransitionTable-main.tpl.html",
            state:      "templates/TransitionTable-state.tpl.html",
            transition: "templates/TransitionTable-transition.tpl.html"
        },
        
        init: function (model, container) {
            exports.View.init.call(this, model, container);

            model.addListener("createState",            this)
                 .addListener("afterRemoveState",       this)
                 .addListener("createTransition",       this)
                 .addListener("beforeRemoveTransition", this)
                 .addListener("afterRemoveTransition",  this)
                 .addListener("currentStateChanged",    this);

            this.zoom = 1;
            return this;
        },
        
        render: function () {
            this.root = $(this.renderTemplate("main", this.model)).appendTo(this.container);
            
            var model = this.model;
            $("input", this.root).click(function () {
                model.createState();
            });
        },
        
        scale: function () {
            // Adjust state name input width
            var stateNameInputs = $(".source-state-name input[type=text]", this.root);
            var size = -1;
            stateNameInputs.each(function () {
                if (size < 0 || $(this).val().length > size) {
                    size = $(this).val().length;
                }
            });
            stateNameInputs.attr("size", Math.max(4, size));
            
            // Adjust zoom level, preserving the current scroll position
            var scrollTop = this.container.scrollTop() / this.zoom;
            this.root.css("transform", "none");
            this.zoom = this.container.innerWidth() / this.root.width();
            this.root.css("transform", "scale(" + this.zoom + ")");
            this.container.scrollTop(scrollTop * this.zoom);
        },
        
        scrollTo: function (rows) {
            var rowsTop = rows.position().top;
            var rowsBottom = rows.last().position().top + rows.last().height();
            var containerTop = this.container.scrollTop();
            var containerHeight = this.container.height();
            if (rowsTop < 0 || rowsBottom - rowsTop > containerHeight) {
                this.container.scrollTop(containerTop + rowsTop);
            }
            else if (rowsBottom > containerHeight) {
                this.container.scrollTop(containerTop + rowsBottom - containerHeight);
            }
        },
        
        createState: function (model, state) {
            state.addListener("changed", this.updateState, this);
            
            // Update target state selectors
            $("td.target-state-name select", this.root).each(function () {
                $("<option>").val(state.id).text(state.name).insertBefore($("option:last()", $(this)));
            });
            
            // Create new row in the transition table
            var row = $(this.renderTemplate("state", {state: state, model: model})).insertBefore($("tr", this.root).last());
            
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
            
            this.scale();
            
            // Scroll to the new state row and focus the state name field
            this.scrollTo(row);
            $("input[type=text]", row).focus();
        },
        
        getRowsForState: function (state) {
            return $("tr.state-" + state.id, this.root);
        },
        
        afterRemoveState: function (model, state) {
            this.getRowsForState(state).remove();
            $("option[value='" + state.id + "']", this.root).remove();
            
            this.scale();
        },
        
        updateState: function (state) {
            var rows = this.getRowsForState(state);
            $("td.source-state-name input[type=text]", rows).val(state.name);
            $("table.state-encoding input", rows).each(function (index) {
                $(this).val(state.encoding[index]);
            });
            $("option[value='" + state.id + "']", this.root).text(state.name);
            
            this.scale();
            this.scrollTo(rows);
        },
        
        createTransition: function (model, transition) {
            var state = transition.sourceState;

            transition.addListener("changed", this.updateTransition, this);

            // Append transition data in place of the "Add transition" button
            var rows = this.getRowsForState(state);
            var transitionRow = rows.last();
            var tdnt = $("td.create-transition", transitionRow);
            tdnt.after(this.renderTemplate("transition", {transition: transition, model: model}));

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
                var targetId = $(this).val();
                if (targetId === "#NewState#") {
                    targetId = model.createState().id;
                }
                transition.setTargetState(model.statesById[targetId]);
            });
            
            // Create a new row and move the "Add transition" button
            $("<tr>").addClass("state-" + state.id).append(tdnt).insertAfter(transitionRow);
            
            $("td.remove-state, td.source-state-name", rows).attr("rowspan", rows.length + 1);
            
            this.showNonDeterministicTransitions(transition.sourceState);
            this.scale();
            this.scrollTo(transitionRow);
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
            
            this.showNonDeterministicTransitions(transition.sourceState);
            this.scale();
            this.scrollTo(row);
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
        },
        
        afterRemoveTransition: function (model, transition) {
            this.showNonDeterministicTransitions(transition.sourceState);
            this.scale();
        },
        
        showNonDeterministicTransitions: function (state) {
            forEach(transition of state.outgoingTransitions) {
                var index = transition.getIndex();
                var row = this.getRowsForState(state).slice(index, index + 1);
                if (transition.isNonDeterministic()) {
                    row.addClass("error");
                }
                else {
                    row.removeClass("error");
                }
            }
        },
        
        currentStateChanged: function (model, state) {
            $("tr", this.root).removeClass("current");
            if (state) {
                var rows = this.getRowsForState(state);
                rows.addClass("current");
                this.scrollTo(rows);
            }
        }
    });
});
