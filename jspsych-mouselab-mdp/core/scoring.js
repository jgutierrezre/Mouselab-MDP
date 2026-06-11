// Scoring: data recording and scoring utilities
(function (ctx) {
    var proto = ctx.MouselabMDP.prototype;

    proto.addScore = function (v) {
        this.data.score = ctx.round(this.data.score + v);
        $("#mouselab-score").html("$" + this.data.score);
        return $("#mouselab-score").css("color", ctx.redGreen(this.data.score));
    };

    proto.recordQuery = function (queryType, targetType, target) {
        this.canvas.renderAll();
        ctx.LOG_DEBUG("recordQuery " + queryType + " " + targetType + " " + target);
        this.data.queries[queryType][targetType].target.push(target);
        return this.data.queries[queryType][targetType].time.push(Date.now() - this.initTime);
    };

    proto.getEdgeLabel = function (s0, r, s1) {
        if (this.edgeLabels === "reward") {
            return String(r);
        }
        return this.edgeLabels[s0 + "__" + s1];
    };

    proto.isStochasticEdge = function (edge) {
        return edge.outcomes && edge.outcomes.length > 1;
    };
})(window.MouselabMDPCtx);
