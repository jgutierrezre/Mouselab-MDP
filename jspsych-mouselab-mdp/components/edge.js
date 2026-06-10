// Edge class - represents a transition between states on the canvas
(function (ctx) {
    ctx.Edge = (function (superClass) {
        ctx.extend(Edge, superClass);

        function Edge(c1, reward, c2, config) {
            var adjX,
                adjY,
                ang,
                labX,
                labY,
                label,
                mdpInstance,
                ref,
                ref1,
                ref2,
                ref3,
                ref4,
                ref5,
                ref6,
                rotateLabel,
                SIZE,
                spacing,
                x1,
                x2,
                y1,
                y2;
            if (config == null) {
                config = {};
            }
            SIZE = config.SIZE || ctx.SIZE;
            mdpInstance = config.mdpInstance;
            ((spacing = (ref = config.spacing) != null ? ref : 8),
                (adjX = (ref1 = config.adjX) != null ? ref1 : 0),
                (adjY = (ref2 = config.adjY) != null ? ref2 : 0),
                (rotateLabel = (ref3 = config.rotateLabel) != null ? ref3 : false),
                (label = (ref4 = config.label) != null ? ref4 : ""));
            ((ref5 = [c1.left + adjX, c1.top + adjY, c2.left + adjX, c2.top + adjY]),
                (x1 = ref5[0]),
                (y1 = ref5[1]),
                (x2 = ref5[2]),
                (y2 = ref5[3]));
            this.arrow = new ctx.Arrow(
                x1,
                y1,
                x2,
                y2,
                c1.radius + spacing,
                c2.radius + spacing,
                ctx.CONFIG.DEFAULT_EDGE_COLOR,
                ctx.CONFIG.EDGE_WIDTH,
            );
            this.arrow.set({
                selectable: false,
                evented: true,
                perPixelTargetFind: false,
                targetFindTolerance: 8,
            });
            ang = (this.arrow.ang + Math.PI / 2) % (Math.PI * 2);
            if (0.5 * Math.PI <= ang && ang <= 1.5 * Math.PI) {
                ang += Math.PI;
            }
            ((ref6 = ctx.polarMove(x1, y1, ctx.angle(x1, y1, x2, y2), SIZE * 0.45)),
                (labX = ref6[0]),
                (labY = ref6[1]));
            this.label = new ctx.Text("----------", labX, labY, {
                angle: rotateLabel ? (ang * 180) / Math.PI : 0,
                fill: ctx.redGreen(label),
                fontSize: SIZE / 6,
            });
            this.on("mousedown", function () {
                return mdpInstance.clickEdge(this, c1.name, reward, c2.name);
            });
            this.on("mouseover", function () {
                if (this.arrow && this.arrow._objects && this.arrow._objects[0]) {
                    this.arrow._objects[0].set({ strokeWidth: ctx.CONFIG.HOVER_EDGE_WIDTH });
                    this.arrow.dirty = true;
                }
                return mdpInstance.mouseoverEdge(this, c1.name, reward, c2.name);
            });
            this.on("mouseout", function () {
                if (this.arrow && this.arrow._objects && this.arrow._objects[0]) {
                    this.arrow._objects[0].set({ strokeWidth: ctx.CONFIG.EDGE_WIDTH });
                    this.arrow.dirty = true;
                }
                return mdpInstance.mouseoutEdge(this, c1.name, reward, c2.name);
            });
            Edge.__super__.constructor.call(this, [this.arrow, this.label]);
            this.objectCaching = false;
            this.setLabel(label);
        }

        Edge.prototype.setLabel = function (txt) {
            if (txt) {
                this.label.setText("" + txt);
                this.label.setFill(ctx.redGreen(txt));
            } else {
                this.label.setText("");
            }
            return (this.dirty = true);
        };

        return Edge;
    })(fabric.Group);
})(window.MouselabMDPCtx);
