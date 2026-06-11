// Lifecycle: map construction, player init, trial start/end
(function (ctx) {
    var proto = ctx.MouselabMDP.prototype;

    proto.run = function () {
        ctx.LOG_DEBUG("run");
        this.buildMap();
        if (this._cachedPlayerImg && this._cachedPlayerImgUrl === this.playerImage) {
            var img = new fabric.Image(this._cachedPlayerImg, {
                left: 0,
                top: 0,
            });
            this.initPlayer(img);
            this.canvas.renderAll();
            this.initTime = Date.now();
            return this.arrive(this.initial);
        }
        return fabric.Image.fromURL(
            this.playerImage,
            (function (_this) {
                return function (img) {
                    _this._cachedPlayerImg = img.getElement();
                    _this._cachedPlayerImgUrl = _this.playerImage;
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
        if (!this.canvas) {
            this.canvas = new fabric.Canvas("mouselab-canvas", {
                selection: false,
                subTargetCheck: true,
                renderOnAddRemove: false,
            });
        } else {
            this.canvas.setWidth(gridWidth * this.SIZE);
            this.canvas.setHeight(gridHeight * this.SIZE);
        }
        this.edgeViews = {};
        this.nodes = {};

        for (s in this.layout) {
            location = this.layout[s];
            x = location[0];
            y = location[1];
            var alwaysLabel = "";
            var rv = this.nodeRewards[s];
            if (this.nodeDisplay === "always") {
                var lp = [];
                if (this.nodeLabels && this.nodeLabels[s] != null) {
                    lp.push(this.nodeLabels[s]);
                }
                lp.push("$" + (rv != null ? rv : 0));
                alwaysLabel = lp.join("  ");
            }
            this.nodes[s] = this.draw(
                new ctx.Node(s, x, y, {
                    fill: "#bbb",
                    label: alwaysLabel,
                    reward: rv,
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
                    groupLabels: this.groupLabels,
                    actionLabels: this.actionLabels,
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
                            s0: s0,
                            actionName: a,
                            label: this.edgeDisplay === "always"
                                ? this.getEdgeLabel(s0, a, reward)
                                : "",
                            SIZE: this.SIZE,
                            mdpInstance: this,
                        }),
                    );
                }
            }
        }
        for (s in this.nodes) {
            var node = this.nodes[s];
            if (node.initialLabel) {
                node.setLabel(node.initialLabel);
            }
        }
        this.canvas.renderAll();
    };

    proto.reset = function () {
        if (this.canvas) {
            this.canvas.clear();
        }
        if (this.keyListener) {
            jsPsych.pluginAPI.cancelKeyboardResponse(this.keyListener);
            this.keyListener = null;
        }
        this.edgeViews = {};
        this.nodes = {};
        this.player = null;
        this.complete = false;
        this.initTime = null;
        this.pendingTrail = null;
    };

    proto.reload = function (config) {
        this.initConfig(config);
        if ($("#mouselab-canvas").length === 0) {
            this.initDOM(config);
            if (this.canvas) {
                this.canvas.dispose();
                this.canvas = null;
            }
        }
        var c = config;
        var leftMessage = c.leftMessage != null ? c.leftMessage : "Round: 1/1";
        var centerMessage = c.centerMessage != null ? c.centerMessage : "&nbsp;";
        var rightMessage = c.rightMessage != null
            ? c.rightMessage
            : "Score: <span id=mouselab-score/>";
        var lowerMessage = c.lowerMessage != null ? c.lowerMessage : ctx.KEY_DESCRIPTION;
        $("#mouselab-msg-left").html(leftMessage);
        $("#mouselab-msg-center").html(centerMessage);
        $("#mouselab-msg-right").html(rightMessage);
        $("#mouselab-msg-bottom").html(lowerMessage);
        this.leftMessage = $("#mouselab-msg-left");
        this.centerMessage = $("#mouselab-msg-center");
        this.rightMessage = $("#mouselab-msg-right");
        this.lowerMessage = $("#mouselab-msg-bottom");
        this.canvasElement = $("#mouselab-canvas");
        this.addScore(0);
        this.reset();
        this.run();
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
