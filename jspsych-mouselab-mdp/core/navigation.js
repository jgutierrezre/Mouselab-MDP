// Navigation: movement, transitions, and keyboard input
(function (ctx) {
    var proto = ctx.MouselabMDP.prototype;

    proto.handleKey = function (s0, a) {
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
        if (edgeView != null && transition.outcomeIndex != null) {
            var trailColor =
                ctx.CONFIG.ACTION_COLORS[a.toUpperCase().charCodeAt(0) - 65] ||
                ctx.CONFIG.TRAIL_COLOR;
            edgeView.paintTrail(transition.outcomeIndex, trailColor, ctx.CONFIG.TRAIL_WIDTH);
        }
        if (this.player) {
            this.canvas.bringToFront(this.player);
        }
        ctx.LOG_DEBUG(s0 + ", " + a + " -> " + r + ", " + s1);
        s1g = this.states[s1];
        return this.animateMove(s1g, r, edgeView != null ? edgeView.branchPoint : void 0, s1);
    };

    proto.sampleTransition = function (edge) {
        var outcome, roll, total, weight;
        if (!this.isStochasticEdge(edge)) {
            return {
                reward: edge[0],
                nextState: edge[1],
                probability: 1,
                outcomeIndex: void 0,
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
                    outcomeIndex: weight,
                };
            }
        }
        outcome = edge[edge.length - 1];
        return {
            reward: outcome[1],
            nextState: outcome[2],
            probability: outcome[0],
            outcomeIndex: edge.length - 1,
        };
    };

    proto.animateMove = function (s1g, reward, via, finalState) {
        var waypoints, segments, totalDist, i, d, duration;
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
        duration = totalDist * this.ANIMATION_SPEED;
        return fabric.util.animate({
            startValue: 0,
            endValue: totalDist,
            duration: duration,
            onChange: (function (_this, _segments) {
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
                    return _this.canvas.renderAll();
                };
            })(this, segments),
            onComplete: (function (_this) {
                return function () {
                    _this.addScore(reward);
                    return _this.arrive(finalState);
                };
            })(this),
        });
    };

    proto.arrive = function (s) {
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
})(window.MouselabMDPCtx);
