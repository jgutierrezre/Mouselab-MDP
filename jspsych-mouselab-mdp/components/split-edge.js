// SplitEdge class - renders a stochastic branch in the graph
(function (ctx) {
    ctx.SplitEdge = (function () {
        function SplitEdge(c1, children, config) {
            if (config == null) {
                config = {};
            }
            this.children = children;
            this.allActions = config.allActions || {};
            this.edgeDisplay = config.edgeDisplay != null ? config.edgeDisplay : "hover";
            this.SIZE = config.SIZE || ctx.SIZE;
            this.parent = c1;
            this.branchPoint = null;
            this.stemStart = null;
            this.stemLine = null;
            this.arrows = [];
            this.hitBoxes = [];
            this.labels = [];
            this.objects = [];
            this.objectCaching = false;
        }

        function actionColorForName(name) {
            return (
                ctx.CONFIG.ACTION_COLORS[name.toUpperCase().charCodeAt(0) - 65] ||
                ctx.CONFIG.DEFAULT_EDGE_COLOR
            );
        }

        SplitEdge.prototype.paintTrail = function (index, color, width) {
            var arrow;
            if (this.stemLine) {
                this.stemLine.set({ stroke: color, strokeWidth: width });
                this.stemLine.dirty = true;
            }
            if (index < 0 || index >= this.arrows.length) {
                return;
            }
            arrow = this.arrows[index];
            if (arrow && arrow._objects && arrow._objects[0]) {
                arrow._objects[0].set({ stroke: color, strokeWidth: width });
                if (arrow._objects[1]) {
                    arrow._objects[1].set({ fill: color });
                }
                arrow.dirty = true;
            }
            if (this.mdpInstance && this.stemLine) {
                this.mdpInstance.canvas.bringToFront(this.stemLine);
                if (arrow) {
                    this.mdpInstance.canvas.bringToFront(arrow);
                }
            }
        };

        SplitEdge.prototype._buildArrowLabels = function (targetName, midX, midY, mdpInstance) {
            var actName, allOutcomes, j, prob, reward, actColor;
            var letterText, probText, rewardText, lineHeight;
            var texts = [];
            var maxLabelWidth = 0;
            var labelY = 0;
            var fontSize = ctx.CONFIG.BRANCH_LABEL_FONT_SIZE;
            lineHeight = fontSize * 1.3;

            for (actName in this.allActions) {
                allOutcomes = this.allActions[actName].outcomes;
                for (j = 0; j < allOutcomes.length; j++) {
                    if (allOutcomes[j].target === targetName) {
                        prob = Math.round(allOutcomes[j].prob * 100);
                        reward = allOutcomes[j].reward;
                        actColor = actionColorForName(actName);

                        letterText = new fabric.Text(actName, {
                            fontSize: fontSize,
                            fill: actColor,
                            fontFamily: "helvetica",
                            fontWeight: "bold",
                            originX: "left",
                            originY: "top",
                            selectable: false,
                            evented: false,
                        });
                        letterText.objectCaching = false;

                        probText = new fabric.Text(" " + prob + "%", {
                            fontSize: fontSize,
                            fill: "#333",
                            fontFamily: "helvetica",
                            originX: "left",
                            originY: "top",
                            selectable: false,
                            evented: false,
                        });
                        probText.objectCaching = false;

                        rewardText = new fabric.Text(" $" + reward, {
                            fontSize: fontSize,
                            fill: ctx.redGreen(reward),
                            fontFamily: "helvetica",
                            originX: "left",
                            originY: "top",
                            selectable: false,
                            evented: false,
                        });
                        rewardText.objectCaching = false;

                        texts.push({ letter: letterText, prob: probText, reward: rewardText, y: labelY });
                        maxLabelWidth = Math.max(
                            maxLabelWidth,
                            letterText.width + probText.width + rewardText.width + 14,
                        );
                        labelY += lineHeight;
                    }
                }
            }

            if (texts.length === 0) {
                return null;
            }

            var rectW = maxLabelWidth;
            var rectH = labelY + 8;

            var bgRect = new fabric.Rect({
                width: rectW,
                height: rectH,
                rx: 4,
                ry: 4,
                fill: "white",
                stroke: "#444",
                strokeWidth: 1,
                selectable: false,
                evented: false,
                originX: "center",
                originY: "center",
                left: midX,
                top: midY,
            });
            bgRect.objectCaching = false;
            if (this.edgeDisplay !== "always") {
                bgRect.opacity = 0;
            }
            mdpInstance.draw(bgRect);

            var result = { rect: bgRect, items: [] };
            var firstLineCenter = midY - (labelY - lineHeight) / 2;
            for (var t = 0; t < texts.length; t++) {
                var tObj = texts[t];
                var lx = midX - maxLabelWidth / 2 + 7;
                var ly = firstLineCenter + t * lineHeight;
                tObj.letter.set({ left: lx, top: ly, originY: "center" });
                tObj.prob.set({ left: lx + tObj.letter.width, top: ly, originY: "center" });
                tObj.reward.set({ left: lx + tObj.letter.width + tObj.prob.width, top: ly, originY: "center" });
                if (this.edgeDisplay !== "always") {
                    tObj.letter.opacity = 0;
                    tObj.prob.opacity = 0;
                    tObj.reward.opacity = 0;
                }
                mdpInstance.draw(tObj.letter);
                mdpInstance.draw(tObj.prob);
                mdpInstance.draw(tObj.reward);
                result.items.push(tObj.letter);
                result.items.push(tObj.prob);
                result.items.push(tObj.reward);
            }
            return result;
        };

        SplitEdge.prototype.attach = function (mdpInstance) {
            var avgChildX, avgChildY, branchX, branchY, childState, i;
            var midX, midY, radiusGap, stemStart, stemStartY, arrow, labelObj, hitBox;
            this.mdpInstance = mdpInstance;

            radiusGap = 8;
            stemStart = this.parent.left + this.parent.radius + radiusGap;
            stemStartY = this.parent.top;
            this.stemStart = { left: stemStart, top: stemStartY };

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
            this.branchPoint = { left: branchX, top: branchY };

            this.stemLine = new fabric.Line([stemStart, stemStartY, branchX, branchY], {
                stroke: ctx.CONFIG.DEFAULT_EDGE_COLOR,
                selectable: false,
                evented: false,
                strokeWidth: ctx.CONFIG.STEM_WIDTH,
                strokeLineCap: "round",
            });
            mdpInstance.draw(this.stemLine);

            var arrowPositions = [];
            for (i = 0; i < this.children.length; i++) {
                childState = this.children[i];
                midX = branchX + 0.55 * (childState.left - branchX);
                midY = branchY + 0.55 * (childState.top - branchY);

                arrow = new ctx.Arrow(
                    branchX,
                    branchY,
                    childState.left,
                    childState.top,
                    0,
                    childState.radius + radiusGap,
                    ctx.CONFIG.DEFAULT_EDGE_COLOR,
                    ctx.CONFIG.EDGE_WIDTH,
                );
                arrow.set({
                    selectable: false,
                    evented: false,
                });
                arrow.objectCaching = false;
                mdpInstance.draw(arrow);
                this.arrows.push(arrow);

                var hitDx = childState.left - branchX;
                var hitDy = childState.top - branchY;
                var hitLen = Math.sqrt(hitDx * hitDx + hitDy * hitDy);
                var hitAngle = (Math.atan2(hitDy, hitDx) * 180) / Math.PI;

                hitBox = new fabric.Rect({
                    left: branchX,
                    top: branchY,
                    width: hitLen,
                    height: ctx.CONFIG.EDGE_WIDTH + 15,
                    originX: "left",
                    originY: "center",
                    angle: hitAngle,
                    fill: "rgba(0,0,0,0)",
                    selectable: false,
                    evented: true,
                });
                this.hitBoxes.push(hitBox);
                mdpInstance.draw(hitBox);

                arrowPositions.push({ midX: midX, midY: midY, childName: childState.name });
            }

            for (i = 0; i < arrowPositions.length; i++) {
                var pos = arrowPositions[i];
                labelObj = this._buildArrowLabels(pos.childName, pos.midX, pos.midY, mdpInstance);
                this.labels.push(labelObj);
                this._attachArrowHover(this.hitBoxes[i], i, labelObj, mdpInstance);
            }

            return this;
        };

        SplitEdge.prototype._setLabelVisibility = function (labelObj, visible) {
            if (!labelObj) return;
            labelObj.rect.opacity = visible ? 1 : 0;
            labelObj.rect.dirty = true;
            for (var m = 0; m < labelObj.items.length; m++) {
                labelObj.items[m].opacity = visible ? 1 : 0;
                labelObj.items[m].dirty = true;
            }
            if (visible && this.mdpInstance) {
                this.mdpInstance.canvas.bringToFront(labelObj.rect);
                for (var m = 0; m < labelObj.items.length; m++) {
                    this.mdpInstance.canvas.bringToFront(labelObj.items[m]);
                }
            }
        };

        SplitEdge.prototype._attachArrowHover = function (hitBox, index, labelObj, mdpInstance) {
            var self = this;
            hitBox.on("mouseover", function () {
                self._highlightLine(self.stemLine, true);
                for (var k = 0; k < self.arrows.length; k++) {
                    self._highlightLine(self.arrows[k], k === index);
                }
                for (var k = 0; k < self.labels.length; k++) {
                    self._setLabelVisibility(self.labels[k], k === index);
                }
                mdpInstance.recordQuery(
                    "mouseover",
                    "edge",
                    self.parent.name + "__" + self.children[index].name,
                );
                return mdpInstance.canvas.renderAll();
            });
            hitBox.on("mouseout", function () {
                self._resetLine(self.stemLine);
                for (var k = 0; k < self.arrows.length; k++) {
                    self._resetLine(self.arrows[k]);
                }
                var always = self.edgeDisplay === "always";
                for (var k = 0; k < self.labels.length; k++) {
                    self._setLabelVisibility(self.labels[k], always);
                }
                mdpInstance.recordQuery(
                    "mouseout",
                    "edge",
                    self.parent.name + "__" + self.children[index].name,
                );
                return mdpInstance.canvas.renderAll();
            });
        };

        SplitEdge.prototype._highlightLine = function (line, on) {
            if (!line) return;
            if (line._objects && line._objects[0]) {
                line._savedWidth = line._objects[0].strokeWidth;
                if (on) {
                    line._objects[0].set({ strokeWidth: ctx.CONFIG.HOVER_EDGE_WIDTH });
                    if (line._objects[1]) {
                        line._savedHeadSize = line._objects[1].width;
                        line._objects[1].set({
                            width: ctx.CONFIG.ARROW_HEAD_SIZE + 6,
                            height: ctx.CONFIG.ARROW_HEAD_SIZE + 6,
                        });
                    }
                }
            } else if (line.set) {
                line._savedWidth = line.strokeWidth;
                if (on) {
                    line.set({ strokeWidth: ctx.CONFIG.HOVER_EDGE_WIDTH });
                }
            }
            line.dirty = true;
        };

        SplitEdge.prototype._resetLine = function (line) {
            if (!line) return;
            if (line._objects && line._objects[0]) {
                line._objects[0].set({
                    strokeWidth: line._savedWidth || ctx.CONFIG.EDGE_WIDTH,
                });
                if (line._objects[1]) {
                    line._objects[1].set({
                        width: line._savedHeadSize || ctx.CONFIG.ARROW_HEAD_SIZE,
                        height: line._savedHeadSize || ctx.CONFIG.ARROW_HEAD_SIZE,
                    });
                }
            } else if (line.set) {
                line.set({ strokeWidth: line._savedWidth || ctx.CONFIG.STEM_WIDTH });
            }
            line.dirty = true;
        };

        return SplitEdge;
    })();
})(window.MouselabMDPCtx);
