// MouselabMDP class - main experiment controller
(function (ctx) {
    ctx.MouselabMDP = (function () {
        function MouselabMDP(config) {
            this.checkFinished = ctx.bind(this.checkFinished, this);
            this.endTrial = ctx.bind(this.endTrial, this);
            this.buildMap = ctx.bind(this.buildMap, this);
            this.initPlayer = ctx.bind(this.initPlayer, this);
            this.draw = ctx.bind(this.draw, this);
            this.run = ctx.bind(this.run, this);
            this.addScore = ctx.bind(this.addScore, this);
            this.arrive = ctx.bind(this.arrive, this);
            this.recordQuery = ctx.bind(this.recordQuery, this);
            this.getEdgeLabel = ctx.bind(this.getEdgeLabel, this);
            this.mouseoutEdge = ctx.bind(this.mouseoutEdge, this);
            this.mouseoverEdge = ctx.bind(this.mouseoverEdge, this);
            this.clickEdge = ctx.bind(this.clickEdge, this);
            this.mouseoutState = ctx.bind(this.mouseoutState, this);
            this.mouseoverState = ctx.bind(this.mouseoverState, this);
            this.clickState = ctx.bind(this.clickState, this);
            this.handleKey = ctx.bind(this.handleKey, this);
            var centerMessage,
                leftMessage,
                lowerMessage,
                ref,
                ref1,
                ref10,
                ref11,
                ref12,
                ref13,
                ref2,
                ref3,
                ref4,
                ref5,
                ref6,
                ref7,
                ref8,
                ref9,
                rightMessage;
            ((this.display = config.display),
                (this.graph = config.graph),
                (this.layout = config.layout),
                (this.initial = config.initial),
                (this.stateLabels = (ref = config.stateLabels) != null ? ref : null),
                (this.stateDisplay = (ref1 = config.stateDisplay) != null ? ref1 : "never"),
                (this.stateClickCost = (ref2 = config.stateClickCost) != null ? ref2 : 0),
                (this.edgeLabels = (ref3 = config.edgeLabels) != null ? ref3 : "reward"),
                (this.edgeDisplay = (ref4 = config.edgeDisplay) != null ? ref4 : "always"),
                (this.edgeClickCost = (ref5 = config.edgeClickCost) != null ? ref5 : 0),
                (this.keys = (ref6 = config.keys) != null ? ref6 : ctx.KEYS),
                (this.trialIndex = (ref7 = config.trialIndex) != null ? ref7 : ctx.TRIAL_INDEX),
                (this.playerImage =
                    (ref8 = config.playerImage) != null ? ref8 : "static/images/plane.png"),
                (this.SIZE = (ref9 = config.SIZE) != null ? ref9 : ctx.SIZE),
                (leftMessage = (ref10 = config.leftMessage) != null ? ref10 : "Round: 1/1"),
                (centerMessage = (ref11 = config.centerMessage) != null ? ref11 : "&nbsp;"),
                (rightMessage =
                    (ref12 = config.rightMessage) != null
                        ? ref12
                        : "Score: <span id=mouselab-score/>"),
                (lowerMessage =
                    (ref13 = config.lowerMessage) != null ? ref13 : ctx.KEY_DESCRIPTION));
            _.extend(this, config);
            ctx.checkObj(this);
            this.invKeys = _.invert(this.keys);
            this.data = {
                trialIndex: this.trialIndex,
                score: 0,
                path: [],
                rt: [],
                actions: [],
                actionTimes: [],
                transitions: [],
                queries: {
                    click: {
                        state: {
                            target: [],
                            time: [],
                        },
                        edge: {
                            target: [],
                            time: [],
                        },
                    },
                    mouseover: {
                        state: {
                            target: [],
                            time: [],
                        },
                        edge: {
                            target: [],
                            time: [],
                        },
                    },
                    mouseout: {
                        state: {
                            target: [],
                            time: [],
                        },
                        edge: {
                            target: [],
                            time: [],
                        },
                    },
                },
            };
            this.leftMessage = $("<div>", {
                id: "mouselab-msg-left",
                class: "mouselab-header",
                html: leftMessage,
            }).appendTo(this.display);
            this.centerMessage = $("<div>", {
                id: "mouselab-msg-center",
                class: "mouselab-header",
                html: centerMessage,
            }).appendTo(this.display);
            this.rightMessage = $("<div>", {
                id: "mouselab-msg-right",
                class: "mouselab-header",
                html: rightMessage,
            }).appendTo(this.display);
            this.addScore(0);
            this.canvasElement = $("<canvas>", {
                id: "mouselab-canvas",
            })
                .attr({
                    width: 500,
                    height: 500,
                })
                .appendTo(this.display);
            this.lowerMessage = $("<div>", {
                id: "mouselab-msg-bottom",
                html: lowerMessage || "&nbsp",
            }).appendTo(this.display);
            ctx.LOG_INFO("new MouselabMDP", this);
        }

        MouselabMDP.prototype.handleKey = function (s0, a) {
            var edgeView, r, ref, s1, s1g, transition;
            ctx.LOG_DEBUG("handleKey", s0, a);
            this.data.actions.push(a);
            this.data.actionTimes.push(Date.now() - this.initTime);
            transition = this.sampleTransition(this.graph[s0][a]);
            r = transition.reward;
            s1 = transition.nextState;
            edgeView =
                this.edgeViews != null
                    ? this.edgeViews[s0] != null
                        ? this.edgeViews[s0][a]
                        : void 0
                    : void 0;
            this.data.transitions.push({
                state: s0,
                action: a,
                reward: r,
                nextState: s1,
                probability: transition.probability,
            });
            ctx.LOG_DEBUG(s0 + ", " + a + " -> " + r + ", " + s1);
            s1g = this.states[s1];
            return this.animateMove(s1g, r, edgeView != null ? edgeView.branchPoint : void 0, s1);
        };

        MouselabMDP.prototype.sampleTransition = function (edge) {
            var outcome, roll, total, weight;
            if (!this.isStochasticEdge(edge)) {
                return {
                    reward: edge[0],
                    nextState: edge[1],
                    probability: 1,
                };
            }
            roll = Math.random();
            total = 0;
            for (weight = 0; weight < edge.length; weight++) {
                outcome = edge[weight];
                total += outcome[0];
                if (roll <= total) {
                    return {
                        reward: outcome[1],
                        nextState: outcome[2],
                        probability: outcome[0],
                    };
                }
            }
            outcome = edge[edge.length - 1];
            return {
                reward: outcome[1],
                nextState: outcome[2],
                probability: outcome[0],
            };
        };

        MouselabMDP.prototype.clickState = function (g, s) {
            ctx.LOG_DEBUG("clickState " + s);
            if (this.stateLabels && this.stateDisplay === "click" && !g.label.text) {
                this.addScore(-this.stateClickCost);
                g.setLabel(this.stateLabels[s]);
                return this.recordQuery("click", "state", s);
            }
        };

        MouselabMDP.prototype.animateMove = function (s1g, reward, via, finalState) {
            var duration, finalDuration, finalPoint, viaDuration, viaPoint;
            viaPoint = via != null ? via : null;
            finalPoint = {
                left: s1g.left,
                top: s1g.top,
            };
            duration = ctx.dist(this.player, s1g) * 4;
            if (!viaPoint) {
                return this.player.animate(finalPoint, {
                    duration: duration,
                    onChange: this.canvas.renderAll.bind(this.canvas),
                    onComplete: (function (_this) {
                        return function () {
                            _this.addScore(reward);
                            return _this.arrive(finalState);
                        };
                    })(this),
                });
            }
            viaDuration =
                duration *
                (ctx.dist(this.player, viaPoint) /
                    (ctx.dist(this.player, viaPoint) + ctx.dist(viaPoint, s1g)));
            finalDuration = duration - viaDuration;
            return this.player.animate(viaPoint, {
                duration: viaDuration,
                onChange: this.canvas.renderAll.bind(this.canvas),
                onComplete: (function (_this) {
                    return function () {
                        return _this.player.animate(finalPoint, {
                            duration: finalDuration,
                            onChange: _this.canvas.renderAll.bind(_this.canvas),
                            onComplete: (function (_this) {
                                return function () {
                                    _this.addScore(reward);
                                    return _this.arrive(finalState);
                                };
                            })(_this),
                        });
                    };
                })(this),
            });
        };

        MouselabMDP.prototype.clickEdge = function (g, s0, r, s1) {
            ctx.LOG_DEBUG("clickEdge " + s0 + " " + r + " " + s1);
            if (this.edgeLabels && this.edgeDisplay === "click" && !g.label.text) {
                this.addScore(-this.edgeClickCost);
                g.setLabel(this.getEdgeLabel(s0, r, s1));
                return this.recordQuery("click", "edge", s0 + "__" + s1);
            }
        };

        MouselabMDP.prototype.mouseoverEdge = function (g, s0, r, s1) {
            ctx.LOG_DEBUG("mouseoverEdge " + s0 + " " + r + " " + s1);
            if (this.edgeLabels && this.edgeDisplay === "hover") {
                g.setLabel(this.getEdgeLabel(s0, r, s1));
                return this.recordQuery("mouseover", "edge", s0 + "__" + s1);
            }
        };

        MouselabMDP.prototype.mouseoutEdge = function (g, s0, r, s1) {
            ctx.LOG_DEBUG("mouseoutEdge " + s0 + " " + r + " " + s1);
            if (this.edgeLabels && this.edgeDisplay === "hover") {
                g.setLabel("");
                return this.recordQuery("mouseout", "edge", s0 + "__" + s1);
            }
        };

        MouselabMDP.prototype.isStochasticEdge = function (edge) {
            return Array.isArray(edge[0]);
        };

        MouselabMDP.prototype.getEdgeLabel = function (s0, r, s1) {
            if (this.edgeLabels === "reward") {
                return String(r);
            } else {
                return this.edgeLabels[s0 + "__" + s1];
            }
        };

        MouselabMDP.prototype.recordQuery = function (queryType, targetType, target) {
            this.canvas.renderAll();
            ctx.LOG_DEBUG("recordQuery " + queryType + " " + targetType + " " + target);
            this.data.queries[queryType][targetType].target.push(target);
            return this.data.queries[queryType][targetType].time.push(Date.now() - this.initTime);
        };

        MouselabMDP.prototype.arrive = function (s) {
            var a, keys;
            ctx.LOG_DEBUG("arrive", s);
            this.data.path.push(s);
            if (this.graph[s]) {
                keys = function () {
                    var i, len, ref, results;
                    ref = Object.keys(this.graph[s]);
                    results = [];
                    for (i = 0, len = ref.length; i < len; i++) {
                        a = ref[i];
                        results.push(this.keys[a]);
                    }
                    return results;
                }.call(this);
            } else {
                keys = [];
            }
            if (!keys.length) {
                this.complete = true;
                this.checkFinished();
                return;
            }
            return (this.keyListener = jsPsych.pluginAPI.getKeyboardResponse({
                valid_responses: keys,
                rt_method: "date",
                persist: false,
                allow_held_key: false,
                callback_function: (function (_this) {
                    return function (info) {
                        var action;
                        action = _this.invKeys[info.key];
                        ctx.LOG_DEBUG("key", info.key);
                        _this.data.rt.push(info.rt);
                        return _this.handleKey(s, action);
                    };
                })(this),
            }));
        };

        MouselabMDP.prototype.addScore = function (v) {
            this.data.score = ctx.round(this.data.score + v);
            $("#mouselab-score").html("$" + this.data.score);
            return $("#mouselab-score").css("color", ctx.redGreen(this.data.score));
        };

        MouselabMDP.prototype.run = function () {
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

        MouselabMDP.prototype.draw = function (obj) {
            this.canvas.add(obj);
            return obj;
        };

        MouselabMDP.prototype.initPlayer = function (img) {
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

        MouselabMDP.prototype.buildMap = function () {
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
                        var children, probabilities, ref3, results1, splitEdge;
                        results1 = [];
                        for (a in actions) {
                            ((ref3 = actions[a]), (r = ref3[0]), (s1 = ref3[1]));
                            if (this.isStochasticEdge(ref3)) {
                                children = [this.states[ref3[0][2]], this.states[ref3[1][2]]];
                                probabilities = [ref3[0][0], ref3[1][0]];
                                this.edgeViews[s0] == null ? (this.edgeViews[s0] = {}) : void 0;
                                splitEdge = this.edgeViews[s0][a] = new ctx.SplitEdge(
                                    this.states[s0],
                                    children,
                                    probabilities,
                                    {
                                        actionName: a,
                                        edgeDisplay: this.edgeDisplay,
                                        SIZE: this.SIZE,
                                    },
                                );
                                splitEdge.attach(this);
                                results1.push(splitEdge);
                            } else {
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

        MouselabMDP.prototype.endTrial = function () {
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

        MouselabMDP.prototype.checkFinished = function () {
            if (this.complete) {
                return this.endTrial();
            }
        };

        return MouselabMDP;
    })();
})(window.MouselabMDPCtx);
