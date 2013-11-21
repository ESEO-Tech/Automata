/*
 * Automata - A game to learn finite-state machines
 *
 * Copyright (C) 2013 Guillaume Savaton
 *
 * This program is dual licensed under the terms of
 * the GNU General Public License (GPL) version 3.
 * A copy of both licenses is provided in the doc/
 * folder of the official release of Automata.
 */

/**
 * Create or augment a namespace.
 *
 * <p>A typical use of this function is:</p>
 *
 * <pre>
 * namespace(this, "a.b.c", function (exports, globals) {
 *     exports.foo = function (x) {
 *         ...
 *     };
 * });
 * </pre>
 *
 * <p>where <code>this</code> is the global object.</p>
 *
 * <p>In this example, function <code>foo</code> is exported and can be
 * called as <code>a.b.c.foo(someValue)</code>.</p>
 *
 * @memberOf _global_
 * @param globals The global object
 * @param {String} path The dot-separated path to the namespace
 * @param {Function} body A function to execute in the context of the namespace
 */
function namespace(globals, path, body) {
    "use strict";

    // Start name lookup in the global object
	var current = globals;

	// For each name in the given path
	path.split(".").forEach(function (name) {
        // If the current path element does not exist
        // in the current namespace, create a new sub-namespace
		if (typeof current[name] === "undefined") {
			current[name] = {};
		}

		// Move to the namespace for the current path element
		current = current[name];
	});

	// Execute the given function in the last namespace
	if (body) {
        body(current, globals);
	}

	return current;
}

