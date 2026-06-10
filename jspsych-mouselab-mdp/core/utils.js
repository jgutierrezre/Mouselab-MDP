// Utility functions, constants, and fabric patches
(function (ctx) {
    ctx.slice = [].slice;
    ctx.bind = function (fn, me) {
        return function () {
            return fn.apply(me, arguments);
        };
    };
    ctx.extend = function (child, parent) {
        for (var key in parent) {
            if (ctx.hasProp.call(parent, key)) child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    };
    ctx.hasProp = {}.hasOwnProperty;

    ctx.PRINT = function () {
        var args;
        args = 1 <= arguments.length ? ctx.slice.call(arguments, 0) : [];
        return console.log.apply(console, args);
    };
    ctx.NULL = function () {
        return null;
    };
    ctx.LOG_INFO = ctx.PRINT;
    ctx.LOG_DEBUG = ctx.PRINT;
    ctx.SIZE = 120;
    ctx.TRIAL_INDEX = 1;

    fabric.Object.prototype.originX = fabric.Object.prototype.originY = "center";
    fabric.Object.prototype.selectable = false;
    fabric.Object.prototype.hoverCursor = "plain";

    ctx.angle = function (x1, y1, x2, y2) {
        var ang, x, y;
        x = x2 - x1;
        y = y2 - y1;
        if (x === 0) {
            ang = y === 0 ? 0 : y > 0 ? Math.PI / 2 : (Math.PI * 3) / 2;
        } else if (y === 0) {
            ang = x > 0 ? 0 : Math.PI;
        } else {
            ang =
                x < 0
                    ? Math.atan(y / x) + Math.PI
                    : y < 0
                      ? Math.atan(y / x) + 2 * Math.PI
                      : Math.atan(y / x);
        }
        return ang + Math.PI / 2;
    };

    ctx.polarMove = function (x, y, ang, dist) {
        x += dist * Math.sin(ang);
        y -= dist * Math.cos(ang);
        return [x, y];
    };

    ctx.dist = function (o1, o2) {
        return Math.pow(Math.pow(o1.left - o2.left, 2) + Math.pow(o1.top - o2.top, 2), 0.5);
    };

    ctx.redGreen = function (val) {
        if (val > 0) {
            return "#080";
        } else if (val < 0) {
            return "#b00";
        } else {
            return "#888";
        }
    };

    ctx.round = function (x) {
        return Math.round(x * 100) / 100;
    };

    ctx.checkObj = function (obj, keys) {
        var i, k, len;
        if (keys == null) {
            keys = Object.keys(obj);
        }
        for (i = 0, len = keys.length; i < len; i++) {
            k = keys[i];
            if (obj[k] === void 0) {
                console.log("Bad Object: ", obj);
                throw new Error(k + " is undefined");
            }
        }
        return obj;
    };

    ctx.KEYS = _.mapObject(
        {
            up: "uparrow",
            down: "downarrow",
            right: "rightarrow",
            left: "leftarrow",
        },
        jsPsych.pluginAPI.convertKeyCharacterToKeyCode,
    );

    ctx.KEY_DESCRIPTION = "Navigate with the arrow keys.";
})((window.MouselabMDPCtx = window.MouselabMDPCtx || {}));
