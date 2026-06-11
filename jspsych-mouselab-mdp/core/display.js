// Display: state/edge click and hover handlers
(function (ctx) {
    var proto = ctx.MouselabMDP.prototype;

    proto.clickState = function (g, s) {
        ctx.LOG_DEBUG("clickState " + s);
        if (this.stateLabels && this.stateDisplay === "click" && !g.label.text) {
            this.addScore(-this.stateClickCost);
            g.setLabel(this.stateLabels[s]);
            return this.recordQuery("click", "state", s);
        }
    };

    proto.mouseoverState = function (g, s) {
        ctx.LOG_DEBUG("mouseoverState " + s);
        if (this.stateLabels && this.stateDisplay === "hover") {
            g.setLabel(this.stateLabels[s]);
        }
        return this.recordQuery("mouseover", "state", s);
    };

    proto.mouseoutState = function (g, s) {
        ctx.LOG_DEBUG("mouseoutState " + s);
        if (this.stateLabels && this.stateDisplay === "hover") {
            g.setLabel("");
        }
        return this.recordQuery("mouseout", "state", s);
    };

    proto.clickEdge = function (g, s0, r, s1) {
        ctx.LOG_DEBUG("clickEdge " + s0 + " " + r + " " + s1);
        if (this.edgeLabels && this.edgeDisplay === "click" && !g.label.text) {
            this.addScore(-this.edgeClickCost);
            g.setLabel(this.getEdgeLabel(s0, r, s1));
            return this.recordQuery("click", "edge", s0 + "__" + s1);
        }
    };

    proto.mouseoverEdge = function (g, s0, r, s1) {
        ctx.LOG_DEBUG("mouseoverEdge " + s0 + " " + r + " " + s1);
        if (this.edgeLabels && this.edgeDisplay === "hover") {
            g.setLabel(this.getEdgeLabel(s0, r, s1));
        }
        return this.recordQuery("mouseover", "edge", s0 + "__" + s1);
    };

    proto.mouseoutEdge = function (g, s0, r, s1) {
        ctx.LOG_DEBUG("mouseoutEdge " + s0 + " " + r + " " + s1);
        if (this.edgeLabels && this.edgeDisplay === "hover") {
            g.setLabel("");
        }
        return this.recordQuery("mouseout", "edge", s0 + "__" + s1);
    };
})(window.MouselabMDPCtx);
