// Navigation: movement, transitions, and keyboard input
(function (ctx) {
    var proto = ctx.MouselabMDP.prototype;

    proto.handleKey = function (s0, a) {
        var edgeView, reward, s1, s1g, transition;
        ctx.LOG_DEBUG("handleKey", s0, a);
        this.data.actions.push(a);
        this.data.actionTimes.push(Date.now() - this.initTime);
        transition = this.sampleTransition(this.graph[s0][a]);
        reward = transition.reward;
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
            reward: reward,
            nextState: s1,
            probability: transition.probability,
        });
        if (edgeView != null && transition.outcomeIndex != null) {
            this.pendingTrail = {
                edgeView: edgeView,
                outcomeIndex: transition.outcomeIndex,
                actionChar: a.toUpperCase(),
            };
        }
        if (this.player) {
            this.canvas.bringToFront(this.player);
        }
        ctx.LOG_DEBUG(s0 + ", " + a + " -> " + reward + ", " + s1);
        s1g = this.nodes[s1];
        return this.animateMove(s1g, reward, edgeView != null ? edgeView.branchPoint : void 0, s1);
    };

    proto.sampleTransition = function (edge) {
        var outcomes = edge.outcomes;
        if (outcomes.length === 1) {
            return {
                reward: outcomes[0].reward,
                nextState: outcomes[0].target,
                probability: 1,
                outcomeIndex: void 0,
            };
        }
        var roll = Math.random();
        var cumulative = 0;
        for (var i = 0; i < outcomes.length; i++) {
            var outcome = outcomes[i];
            cumulative += outcome.prob;
            if (roll <= cumulative) {
                return {
                    reward: outcome.reward,
                    nextState: outcome.target,
                    probability: outcome.prob,
                    outcomeIndex: i,
                };
            }
        }
        var last = outcomes[outcomes.length - 1];
        return {
            reward: last.reward,
            nextState: last.target,
            probability: last.prob,
            outcomeIndex: outcomes.length - 1,
        };
    };

    proto.animateMove = function (s1g, reward, via, finalState) {
        var waypoints, segments, totalDist, i, d, duration;
        var trailInfo = null;
        waypoints = [{ left: this.player.left, top: this.player.top }];
        if (via != null) {
            waypoints.push(via);
        }
        waypoints.push({ left: s1g.left, top: s1g.top });
        segments = [];
        totalDist = 0;
        for (i = 1; i < waypoints.length; i++) {
            d = ctx.dist(waypoints[i - 1], waypoints[i]);
            segments.push({
                from: waypoints[i - 1],
                to: waypoints[i],
                dist: d,
                accum: totalDist,
            });
            totalDist += d;
        }
        var pendingTrail = this.pendingTrail;
        if (pendingTrail && waypoints.length >= 3) {
            var edgeView = pendingTrail.edgeView;
            var childNode = edgeView.children[pendingTrail.outcomeIndex];
            var nodeGap = edgeView.stemStart.left - edgeView.parent.left - edgeView.parent.radius;
            var ang = ctx.angle(
                edgeView.branchPoint.left,
                edgeView.branchPoint.top,
                childNode.left,
                childNode.top,
            );
            var ae = ctx.polarMove(
                childNode.left,
                childNode.top,
                ang,
                -(childNode.radius + nodeGap + 7.5),
            );
            var arrowEnd = { left: ae[0], top: ae[1] };
            var seg0dx = waypoints[1].left - waypoints[0].left;
            var seg0dy = waypoints[1].top - waypoints[0].top;
            var seg0Len = segments[0].dist;
            var stemProj =
                ((edgeView.stemStart.left - waypoints[0].left) * seg0dx +
                    (edgeView.stemStart.top - waypoints[0].top) * seg0dy) /
                seg0Len;
            var stemOffset = Math.max(0, Math.min(seg0Len, stemProj));
            var seg1dx = waypoints[2].left - waypoints[1].left;
            var seg1dy = waypoints[2].top - waypoints[1].top;
            var seg1Len = segments[1].dist;
            var arrowProj =
                ((arrowEnd.left - waypoints[1].left) * seg1dx +
                    (arrowEnd.top - waypoints[1].top) * seg1dy) /
                seg1Len;
            var arrowLen = Math.max(0, Math.min(seg1Len, arrowProj));
            var color =
                ctx.CONFIG.ACTION_COLORS[pendingTrail.actionChar.charCodeAt(0) - 65] ||
                ctx.CONFIG.TRAIL_COLOR;
            trailInfo = {
                stemStart: edgeView.stemStart,
                branchPoint: edgeView.branchPoint,
                arrowEnd: arrowEnd,
                color: color,
                width: ctx.CONFIG.TRAIL_WIDTH,
                stemOffset: stemOffset,
                stemLen: seg0Len - stemOffset,
                arrowLen: arrowLen,
                seg0Dist: seg0Len,
            };
        }
        duration = totalDist * this.ANIMATION_SPEED;
        return fabric.util.animate({
            startValue: 0,
            endValue: totalDist,
            duration: duration,
            onChange: (function (_this, _segments, _trailInfo) {
                return function (traveled) {
                    var seg, k, segT, pos;
                    for (k = _segments.length - 1; k >= 0; k--) {
                        if (traveled >= _segments[k].accum) break;
                    }
                    seg = _segments[k];
                    segT = Math.min((traveled - seg.accum) / seg.dist, 1);
                    pos = {
                        left: seg.from.left + (seg.to.left - seg.from.left) * segT,
                        top: seg.from.top + (seg.to.top - seg.from.top) * segT,
                    };
                    _this.player.set(pos);
                    if (_trailInfo) {
                        var stemRevealed = Math.max(
                            0,
                            Math.min(traveled - _trailInfo.stemOffset, _trailInfo.stemLen),
                        );
                        var branchRevealed = Math.max(
                            0,
                            Math.min(traveled - _trailInfo.seg0Dist, _trailInfo.arrowLen),
                        );
                        if (stemRevealed > 0) {
                            var stemT = stemRevealed / _trailInfo.stemLen;
                            var stemEnd = {
                                left:
                                    _trailInfo.stemStart.left +
                                    (_trailInfo.branchPoint.left - _trailInfo.stemStart.left) *
                                        stemT,
                                top:
                                    _trailInfo.stemStart.top +
                                    (_trailInfo.branchPoint.top - _trailInfo.stemStart.top) * stemT,
                            };
                            var lineOpts = {
                                stroke: _trailInfo.color,
                                strokeWidth: _trailInfo.width,
                                selectable: false,
                                evented: false,
                                strokeLineCap: "round",
                            };
                            if (!_this._trailStemLine) {
                                _this._trailStemLine = new fabric.Line(
                                    [
                                        _trailInfo.stemStart.left,
                                        _trailInfo.stemStart.top,
                                        stemEnd.left,
                                        stemEnd.top,
                                    ],
                                    lineOpts,
                                );
                                _this.canvas.add(_this._trailStemLine);
                            } else {
                                _this._trailStemLine.set({
                                    x1: _trailInfo.stemStart.left,
                                    y1: _trailInfo.stemStart.top,
                                    x2: stemEnd.left,
                                    y2: stemEnd.top,
                                });
                                _this._trailStemLine.setCoords();
                            }
                        }
                        if (branchRevealed > 0) {
                            var branchT = branchRevealed / _trailInfo.arrowLen;
                            var branchEnd = {
                                left:
                                    _trailInfo.branchPoint.left +
                                    (_trailInfo.arrowEnd.left - _trailInfo.branchPoint.left) *
                                        branchT,
                                top:
                                    _trailInfo.branchPoint.top +
                                    (_trailInfo.arrowEnd.top - _trailInfo.branchPoint.top) *
                                        branchT,
                            };
                            if (!_this._trailBranchLine) {
                                _this._trailBranchLine = new fabric.Line(
                                    [
                                        _trailInfo.branchPoint.left,
                                        _trailInfo.branchPoint.top,
                                        branchEnd.left,
                                        branchEnd.top,
                                    ],
                                    {
                                        stroke: _trailInfo.color,
                                        strokeWidth: _trailInfo.width,
                                        selectable: false,
                                        evented: false,
                                        strokeLineCap: "round",
                                    },
                                );
                                _this.canvas.add(_this._trailBranchLine);
                            } else {
                                _this._trailBranchLine.set({
                                    x1: _trailInfo.branchPoint.left,
                                    y1: _trailInfo.branchPoint.top,
                                    x2: branchEnd.left,
                                    y2: branchEnd.top,
                                });
                                _this._trailBranchLine.setCoords();
                            }
                        }
                        _this.canvas.bringToFront(_this.player);
                    }
                    return _this.canvas.renderAll();
                };
            })(this, segments, trailInfo),
            onComplete: (function (_this) {
                return function () {
                    if (_this._trailStemLine) {
                        _this.canvas.remove(_this._trailStemLine);
                        _this._trailStemLine = null;
                    }
                    if (_this._trailBranchLine) {
                        _this.canvas.remove(_this._trailBranchLine);
                        _this._trailBranchLine = null;
                    }
                    _this.addScore(reward);
                    return _this.arrive(finalState);
                };
            })(this),
        });
    };

    proto.arrive = function (s) {
        var a, keys;
        ctx.LOG_DEBUG("arrive", s);
        if (this.pendingTrail) {
            var trailColor =
                ctx.CONFIG.ACTION_COLORS[this.pendingTrail.actionChar.charCodeAt(0) - 65] ||
                ctx.CONFIG.TRAIL_COLOR;
            this.pendingTrail.edgeView.paintTrail(
                this.pendingTrail.outcomeIndex,
                trailColor,
                ctx.CONFIG.TRAIL_WIDTH,
            );
            this.pendingTrail = null;
            this.canvas.renderAll();
        }
        this.data.path.push(s);
        var nodeReward = this.nodeRewards[s];
        if (nodeReward != null) this.addScore(nodeReward);
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
})(window.MouselabMDPCtx);
