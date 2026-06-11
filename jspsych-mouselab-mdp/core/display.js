// Display: node/edge click and hover handlers
(function (ctx) {
    var proto = ctx.MouselabMDP.prototype;

    proto.clickNode = function (g, s) {
        ctx.LOG_DEBUG("clickNode " + s);
        if (this.nodeDisplay === "click" && !g.label.text) {
            this.addScore(-this.nodeClickCost);
            var parts = [];
            if (this.nodeLabels && this.nodeLabels[s] != null) {
                parts.push(this.nodeLabels[s]);
            }
            var r = this.nodeRewards[s];
            parts.push("$" + (r != null ? r : 0));
            g.setLabel(parts.join("  "));
            return this.recordQuery("click", "node", s);
        }
    };

    proto.mouseoverNode = function (g, s) {
        ctx.LOG_DEBUG("mouseoverNode " + s);
        if (this.nodeDisplay === "hover") {
            var parts = [];
            if (this.nodeLabels && this.nodeLabels[s] != null) {
                parts.push(this.nodeLabels[s]);
            }
            var r = this.nodeRewards[s];
            parts.push("$" + (r != null ? r : 0));
            g.setLabel(parts.join("  "));
        }
        return this.recordQuery("mouseover", "node", s);
    };

    proto.mouseoutNode = function (g, s) {
        ctx.LOG_DEBUG("mouseoutNode " + s);
        if (this.nodeDisplay === "hover") {
            g.setLabel("");
        }
        return this.recordQuery("mouseout", "node", s);
    };

    proto.clickEdge = function (g, s0, r, s1) {
        ctx.LOG_DEBUG("clickEdge " + s0 + " " + r + " " + s1);
        if (this.edgeDisplay === "click" && !g.label.text) {
            this.addScore(-this.edgeClickCost);
            g.setLabel(this.getEdgeLabel(s0, r, s1));
            return this.recordQuery("click", "edge", s0 + "__" + s1);
        }
    };

    proto.mouseoverEdge = function (g, s0, r, s1) {
        ctx.LOG_DEBUG("mouseoverEdge " + s0 + " " + r + " " + s1);
        if (this.edgeDisplay === "hover") {
            g.setLabel(this.getEdgeLabel(s0, r, s1));
        }
        return this.recordQuery("mouseover", "edge", s0 + "__" + s1);
    };

    proto.mouseoutEdge = function (g, s0, r, s1) {
        ctx.LOG_DEBUG("mouseoutEdge " + s0 + " " + r + " " + s1);
        if (this.edgeDisplay === "hover") {
            g.setLabel("");
        }
        return this.recordQuery("mouseout", "edge", s0 + "__" + s1);
    };
})(window.MouselabMDPCtx);
