// Lifecycle: map construction, player init, trial start/end
(function (ctx) {
    var proto = ctx.MouselabMDP.prototype;

    proto.run = function () {
        ctx.LOG_DEBUG("run");
        this.buildMap();
        return fabric.Image.fromURL(
            this.playerImage,
            (function (_this) {
                return function (img) {
                    _this.initPlayer(img);
                    _this.canvas.renderAll();
                    _this.initTime = Date.now();
                    return _this.arrive(_this.initial);
                };
            })(this),
        );
    };

    proto.draw = function (obj) {
        this.canvas.add(obj);
        return obj;
    };

    proto.initPlayer = function (img) {
        var left, top;
        ctx.LOG_DEBUG("initPlayer");
        top = this.states[this.initial].top;
        left = this.states[this.initial].left;
        var scale = this.playerImageScale != null ? this.playerImageScale : 0.3;
        img.scale(scale);
        img.set("top", top).set("left", left);
        this.draw(img);
        return (this.player = img);
    };

    proto.buildMap = function () {
        var a, actions, height, location, r, ref, ref1, ref2, results, s, s0, s1, width, x, y;
        ((ref = (function (_this) {
            return function () {
                var ref, xs, ys;
                ((ref = _.unzip(_.values(_this.layout))), (xs = ref[0]), (ys = ref[1]));
                return [_.max(xs) + 1, _.max(ys) + 1];
            };
        })(this)()),
            (width = ref[0]),
            (height = ref[1]));
        this.canvasElement.attr({
            width: width * this.SIZE,
            height: height * this.SIZE,
        });
        this.canvas = new fabric.Canvas("mouselab-canvas", {
            selection: false,
            subTargetCheck: true,
        });
        this.edgeViews = {};
        this.states = {};
        ref1 = this.layout;
        for (s in ref1) {
            location = ref1[s];
            ((x = location[0]), (y = location[1]));
            this.states[s] = this.draw(
                new ctx.State(s, x, y, {
                    fill: "#bbb",
                    label: this.stateDisplay === "always" ? this.stateLabels[s] : "",
                    SIZE: this.SIZE,
                    mdpInstance: this,
                }),
            );
        }
        ref2 = this.graph;
        results = [];
        for (s0 in ref2) {
            actions = ref2[s0];
            results.push(
                function () {
                    var a, children, firstStochastic, ref3, results1, splitEdge, stochasticActions;
                    results1 = [];
                    stochasticActions = {};
                    for (a in actions) {
                        if (this.isStochasticEdge(actions[a])) {
                            stochasticActions[a] = actions[a];
                        }
                    }
                    if (Object.keys(stochasticActions).length > 0) {
                        firstStochastic = Object.keys(stochasticActions)[0];
                        ref3 = stochasticActions[firstStochastic];
                        children = ref3.map(function (outcome) {
                            return this.states[outcome[2]];
                        }, this);
                        this.edgeViews[s0] == null ? (this.edgeViews[s0] = {}) : void 0;
                        splitEdge = new ctx.SplitEdge(this.states[s0], children, {
                            allActions: stochasticActions,
                            edgeDisplay: this.edgeDisplay,
                            SIZE: this.SIZE,
                        });
                        splitEdge.attach(this);
                        for (a in stochasticActions) {
                            this.edgeViews[s0][a] = splitEdge;
                        }
                        results1.push(splitEdge);
                    }
                    for (a in actions) {
                        ((ref3 = actions[a]), (r = ref3[0]), (s1 = ref3[1]));
                        if (!this.isStochasticEdge(ref3)) {
                            results1.push(
                                this.draw(
                                    new ctx.Edge(this.states[s0], r, this.states[s1], {
                                        label:
                                            this.edgeDisplay === "always"
                                                ? this.getEdgeLabel(s0, r, s1)
                                                : "",
                                        SIZE: this.SIZE,
                                        mdpInstance: this,
                                    }),
                                ),
                            );
                        }
                    }
                    return results1;
                }.call(this),
            );
        }
        return results;
    };

    proto.endTrial = function () {
        this.lowerMessage.html("<b>Press any key to continue.</br>");
        return (this.keyListener = jsPsych.pluginAPI.getKeyboardResponse({
            valid_responses: [],
            rt_method: "date",
            persist: false,
            allow_held_key: false,
            callback_function: (function (_this) {
                return function (info) {
                    _this.display.empty();
                    return jsPsych.finishTrial(_this.data);
                };
            })(this),
        }));
    };

    proto.checkFinished = function () {
        if (this.complete) {
            return this.endTrial();
        }
    };
})(window.MouselabMDPCtx);
