namespace(this, "svg", function (exports, globals) {
    "use strict";

    var SVG_NS = "http://www.w3.org/2000/svg";
    
    exports.create = function (tag, attrs) {
        var elt = document.createElementNS(SVG_NS, tag);
        switch (typeof attrs) {
            case "string": this.text(elt, attrs); break;
            case "object": this.attr(elt,  attrs); break;
        }
        return elt;
    };

    exports.createText = function (text) {
        return document.createTextNode(text);
    };
        
    exports.attr = function (elt, attrs) {
        if (typeof attrs === "string") {
            return elt.getAttribute(attrs);
        }
        else if (typeof attrs === "object") {
            for (var name in attrs) {
                elt.setAttribute(name, attrs[name]);
            }
            return this;
        }
    };
        
    exports.clear = function (elt) {
        while (elt.firstChild) {
            elt.firstChild.remove();
        }
    };
        
    exports.text = function (elt, text) {
        this.clear(elt);
        elt.appendChild(this.createText(text));
    };
        
    exports.byTag = function (elt, tag) {
        return elt.getElementsByTagNameNS(SVG_NS, tag);
    };

    exports.center = function (circle) {
        return {
            cx: Number(svg.attr(circle, "cx")),
            cy: Number(svg.attr(circle, "cy"))
        };
    }
    
    // Drag and drop handlers
    
    var prev;
    
    function getSVGRoot(elt) {
        while (elt.tagName !== "svg") {
            elt = elt.parentNode;
        }
        return elt;
    }
    
    function getPoint(root, evt) {
        var p = root.createSVGPoint();
        p.x = evt.clientX;
        p.y = evt.clientY;
        return p.matrixTransform(root.getScreenCTM().inverse());
    }
        
    exports.setDraggable = function (elt, settings) {
        var root = getSVGRoot(elt);
        var context = settings.context || globals;
        
        function onMouseDown(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            var enable = !_.isFunction(settings.canDrag) || settings.canDrag.call(context);
            if (evt.button === 0 && enable) {
                prev = getPoint(root, evt);
                document.documentElement.addEventListener("mousemove", onMouseMove, false);
                document.documentElement.addEventListener("mouseup",   onMouseUp,   false);
            }
        }
    
        function onMouseMove(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            var current = getPoint(root, evt);
            if (_.isFunction(settings.onDrag)) {
                settings.onDrag.call(context, current.x - prev.x, current.y - prev.y);
            }
            prev = current;
        }
        
        function onMouseUp(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            if (_.isFunction(settings.onDrop)) {
                settings.onDrop.call(context);
            }
            if (evt.button === 0) {
                document.documentElement.removeEventListener("mouseup", onMouseUp, false);
                document.documentElement.removeEventListener("mousemove", onMouseMove, false);
            }
        }

        elt.addEventListener("mousedown", onMouseDown, false);
    };
});
