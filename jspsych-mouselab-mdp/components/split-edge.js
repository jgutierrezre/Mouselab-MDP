// SplitEdge class - renders a stochastic branch in the graph
(function (ctx) {
    ctx.SplitEdge = (function () {
        function SplitEdge(c1, children, probabilities, config) {
            if (config == null) {
                config = {};
            }
            this.children = children;
            this.probabilities = probabilities;
            this.actionName = config.actionName != null ? config.actionName : "";
            this.parentActions = config.parentActions || {};
            this.edgeDisplay = config.edgeDisplay != null ? config.edgeDisplay : "hover";
            this.SIZE = config.SIZE || ctx.SIZE;
            this.parent = c1;
            this.branchPoint = null;
            this.objects = [];
            this.objectCaching = false;
        }

        SplitEdge.prototype.attach = function (mdpInstance) {
            var arrow,
                avgChildX,
                avgChildY,
                branchX,
                branchY,
                childState,
                i,
                j,
                labelParts,
                labelText,
                midX,
                midY,
                radiusGap,
                stemEnd,
                stemStart,
                targetName,
                allOutcomes,
                actName;
            radiusGap = 8;
            stemStart = this.parent.left + this.parent.radius + radiusGap;
            avgChildX = 0;
            avgChildY = 0;
            for (i = 0; i < this.children.length; i++) {
                avgChildX += this.children[i].left;
                avgChildY += this.children[i].top;
            }
            avgChildX /= this.children.length;
            avgChildY /= this.children.length;
            branchX = this.parent.left + 0.5 * (avgChildX - this.parent.left);
            branchY = this.parent.top + 0.5 * (avgChildY - this.parent.top);
            stemEnd = {
                left: branchX,
                top: branchY,
            };
            this.branchPoint = stemEnd;
            mdpInstance.draw(
                new fabric.Line([stemStart, this.parent.top, branchX, branchY], {
                    stroke: "#555",
                    selectable: false,
                    evented: false,
                    strokeWidth: 3,
                    strokeLineCap: "round",
                }),
            );
            for (i = 0; i < this.children.length; i++) {
                childState = this.children[i];
                targetName = childState.name;
                labelParts = [];
                for (actName in this.parentActions) {
                    allOutcomes = this.parentActions[actName];
                    for (j = 0; j < allOutcomes.length; j++) {
                        if (allOutcomes[j][2] === targetName) {
                            labelParts.push(
                                actName + " " + Math.round(allOutcomes[j][0] * 100) + "%",
                            );
                            break;
                        }
                    }
                }
                labelText = labelParts.join("\n");
                midX = branchX + 0.55 * (childState.left - branchX);
                midY = branchY + 0.55 * (childState.top - branchY);
                arrow = mdpInstance.draw(
                    new ctx.Arrow(
                        branchX,
                        branchY,
                        childState.left,
                        childState.top,
                        0,
                        childState.radius + radiusGap,
                    ),
                );
                arrow.objectCaching = false;
                arrow.branchLabel = new ctx.Text(labelText, midX, midY, {
                    fill: "#444",
                    fontSize: this.SIZE / 6,
                    textBackgroundColor: "white",
                });
                arrow.branchLabel.objectCaching = false;
                arrow.branchLabel.lineHeight = 1.1;
                arrow.branchLabel.evented = false;
                arrow.branchLabel.selectable = false;
                if (this.edgeDisplay !== "always") {
                    arrow.branchLabel.opacity = 0;
                }
                mdpInstance.draw(arrow.branchLabel);
                arrow.on(
                    "mouseover",
                    (function (_this, branchLabel, labelText) {
                        return function () {
                            if (_this.edgeDisplay === "hover" || _this.edgeDisplay === "always") {
                                branchLabel.opacity = 1;
                                branchLabel.setFill("#444");
                                branchLabel.dirty = true;
                                return mdpInstance.canvas.renderAll();
                            }
                        };
                    })(this, arrow.branchLabel, labelText),
                );
                arrow.on(
                    "mouseout",
                    (function (_this, branchLabel) {
                        return function () {
                            if (_this.edgeDisplay === "hover") {
                                branchLabel.opacity = 0;
                                branchLabel.dirty = true;
                                return mdpInstance.canvas.renderAll();
                            }
                        };
                    })(this, arrow.branchLabel),
                );
            }
            return this;
        };

        return SplitEdge;
    })();
})(window.MouselabMDPCtx);
