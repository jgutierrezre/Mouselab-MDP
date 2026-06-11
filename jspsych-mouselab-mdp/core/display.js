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
            g.setLabel(parts.join("  "), r);
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
            g.setLabel(parts.join("  "), r);
        }
        return this.recordQuery("mouseover", "node", s);
    };

    proto.mouseoutNode = function (g, s) {
        ctx.LOG_DEBUG("mouseoutNode " + s);
        if (this.nodeDisplay === "hover") {
            g.setLabel("");
            if (this.player) this.canvas.bringToFront(this.player);
        }
        return this.recordQuery("mouseout", "node", s);
    };

    proto.clickEdge = function (g, s0, actionName, r) {
        ctx.LOG_DEBUG("clickEdge " + s0 + " " + actionName + " " + r);
        if (this.edgeDisplay === "click" && !g.label.text) {
            this.addScore(-this.edgeClickCost);
            g.setLabel(this.getEdgeLabel(s0, actionName, r));
            return this.recordQuery("click", "edge", s0 + "__" + actionName);
        }
    };

    proto.mouseoverEdge = function (g, s0, actionName, r) {
        ctx.LOG_DEBUG("mouseoverEdge " + s0 + " " + actionName + " " + r);
        if (this.edgeDisplay === "hover") {
            g.setLabel(this.getEdgeLabel(s0, actionName, r));
        }
        return this.recordQuery("mouseover", "edge", s0 + "__" + actionName);
    };

    proto.mouseoutEdge = function (g, s0, actionName, r) {
        ctx.LOG_DEBUG("mouseoutEdge " + s0 + " " + actionName + " " + r);
        if (this.edgeDisplay === "hover") {
            g.setLabel("");
        }
        return this.recordQuery("mouseout", "edge", s0 + "__" + actionName);
    };
})(window.MouselabMDPCtx);
