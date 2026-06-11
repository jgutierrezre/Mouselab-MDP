// Node class - represents a node/state on the canvas
(function (ctx) {
    ctx.Node = (function (superClass) {
        ctx.extend(Node, superClass);

        function Node(name, left, top, config) {
            var conf, SIZE, mdpInstance, lineHeight;
            this.name = name;
            if (config == null) {
                config = {};
            }
            SIZE = config.SIZE || ctx.SIZE;
            mdpInstance = config.mdpInstance;
            this.mdpInstance = mdpInstance;
            this.reward = config.reward;
            left = (left + 0.5) * SIZE;
            top = (top + 0.5) * SIZE;
            lineHeight = SIZE / 5;
            conf = {
                left: left,
                top: top,
                fill: "#bbbbbb",
                radius: SIZE / 4,
                label: "",
            };
            _.extend(conf, config);
            this.circle = new fabric.Circle(conf);
            this.labelBg = new fabric.Rect({
                left: left,
                top: top,
                width: 0,
                height: 0,
                rx: 4,
                ry: 4,
                fill: "white",
                stroke: "#444",
                strokeWidth: 1,
                selectable: false,
                evented: false,
                originX: "center",
                originY: "center",
                opacity: 0,
            });
            this.labelBg.objectCaching = false;
            var fs = SIZE / 6;
            this.label = new ctx.Text("", left, top - lineHeight / 2, {
                fontSize: fs,
                fill: "#222",
                fontWeight: "bold",
            });
            this.rewardText = new ctx.Text("", left, top + lineHeight / 2, {
                fontSize: fs,
                fill: "#888",
            });
            this.radius = this.circle.radius;
            this.left = this.circle.left;
            this.top = this.circle.top;
            this.on("mousedown", function () {
                if (mdpInstance.nodeDisplay !== "click") return;
                return mdpInstance.clickNode(this, this.name);
            });
            this.on("mouseover", function () {
                if (mdpInstance.nodeDisplay !== "hover") return;
                return mdpInstance.mouseoverNode(this, this.name);
            });
            this.on("mouseout", function () {
                if (mdpInstance.nodeDisplay !== "hover") return;
                return mdpInstance.mouseoutNode(this, this.name);
            });
            Node.__super__.constructor.call(this, [
                this.circle,
                this.labelBg,
                this.label,
                this.rewardText,
            ]);
            this.objectCaching = false;
            this.perPixelTargetFind = true;
            this.setLabel(conf.label);
        }

        Node.prototype.setLabel = function (txt, reward) {
            var r = reward != null ? reward : this.reward;
            if (txt) {
                var parts = txt.split("  ");
                this.label.setText(parts[0] || "");
                var rewardStr = parts[1] || "$" + (r != null ? r : 0);
                this.rewardText.setText(rewardStr);
                this.rewardText.setFill(r != null ? ctx.redGreen(r) : ctx.redGreen(rewardStr));
                this.dirty = true;

                var maxW = Math.max(this.label.width, this.rewardText.width);
                var fs = this.label.fontSize;
                var lineH = fs * 1.3;
                var totalH = (this.label.text ? lineH : 0) + (this.rewardText.text ? lineH : 0);

                this.labelBg.set({
                    width: maxW + 8,
                    height: totalH + 4,
                });
                this.labelBg.opacity = 1;
                this.labelBg.dirty = true;
                this.mdpInstance.canvas.bringToFront(this);
            } else {
                this.label.setText("");
                this.rewardText.setText("");
                this.labelBg.opacity = 0;
                this.labelBg.dirty = true;
                this.dirty = true;
            }
            return this;
        };

        return Node;
    })(fabric.Group);
})(window.MouselabMDPCtx);
