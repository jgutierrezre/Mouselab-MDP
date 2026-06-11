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
        top = this.nodes[this.initial].top;
        left = this.nodes[this.initial].left;
        var scale = this.playerImageScale != null ? this.playerImageScale : 0.3;
        img.scale(scale);
        img.set("top", top).set("left", left);
        this.draw(img);
        return (this.player = img);
    };

    proto.buildMap = function () {
        var s, s0, a, x, y, location;
        var gridWidth, gridHeight;

        gridWidth = _.max(_.unzip(_.values(this.layout))[0]) + 1;
        gridHeight = _.max(_.unzip(_.values(this.layout))[1]) + 1;
        this.canvasElement.attr({
            width: gridWidth * this.SIZE,
            height: gridHeight * this.SIZE,
        });
        this.canvas = new fabric.Canvas("mouselab-canvas", {
            selection: false,
            subTargetCheck: true,
        });
        this.edgeViews = {};
        this.nodes = {};

        for (s in this.layout) {
            location = this.layout[s];
            x = location[0];
            y = location[1];
            var alwaysLabel = "";
            if (this.nodeDisplay === "always") {
                var lp = [];
                if (this.nodeLabels && this.nodeLabels[s] != null) {
                    lp.push(this.nodeLabels[s]);
                }
                var rv = this.nodeRewards[s];
                lp.push("$" + (rv != null ? rv : 0));
                alwaysLabel = lp.join("  ");
            }
            this.nodes[s] = this.draw(
                new ctx.Node(s, x, y, {
                    fill: "#bbb",
                    label: alwaysLabel,
                    SIZE: this.SIZE,
                    mdpInstance: this,
                }),
            );
        }

        for (s0 in this.graph) {
            var actions = this.graph[s0];

            var stochActions = {};
            for (a in actions) {
                if (this.isStochasticEdge(actions[a])) {
                    stochActions[a] = actions[a];
                }
            }

            if (Object.keys(stochActions).length > 0) {
                var firstAction = Object.keys(stochActions)[0];
                var firstOutcomes = stochActions[firstAction].outcomes;
                var children = firstOutcomes.map(function (outcome) {
                    return this.nodes[outcome.target];
                }, this);
                this.edgeViews[s0] == null ? (this.edgeViews[s0] = {}) : void 0;
                var splitEdge = new ctx.SplitEdge(this.nodes[s0], children, {
                    allActions: stochActions,
                    edgeDisplay: this.edgeDisplay,
                    SIZE: this.SIZE,
                    edgeLabels: this.edgeLabels,
                    actionLabels: this.actionLabels || {},
                });
                splitEdge.attach(this);
                for (a in stochActions) {
                    this.edgeViews[s0][a] = splitEdge;
                }
            }

            for (a in actions) {
                var edge = actions[a];
                if (!this.isStochasticEdge(edge) && edge.outcomes) {
                    var outcome = edge.outcomes[0];
                    var reward = outcome.reward;
                    var s1 = outcome.target;
                    this.draw(
                        new ctx.Edge(this.nodes[s0], reward, this.nodes[s1], {
                            label: this.edgeDisplay === "always"
                                ? this.getEdgeLabel(s0, reward, s1)
                                : "",
                            SIZE: this.SIZE,
                            mdpInstance: this,
                        }),
                    );
                }
            }
        }
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
