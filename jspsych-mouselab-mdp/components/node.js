// Node class - represents a node/state on the canvas
(function (ctx) {
    ctx.Node = (function (superClass) {
        ctx.extend(Node, superClass);

        function Node(name, left, top, config) {
            var conf, SIZE, mdpInstance;
            this.name = name;
            if (config == null) {
                config = {};
            }
            SIZE = config.SIZE || ctx.SIZE;
            mdpInstance = config.mdpInstance;
            left = (left + 0.5) * SIZE;
            top = (top + 0.5) * SIZE;
            conf = {
                left: left,
                top: top,
                fill: "#bbbbbb",
                radius: SIZE / 4,
                label: "",
            };
            _.extend(conf, config);
            this.circle = new fabric.Circle(conf);
            this.label = new ctx.Text("----------", left, top, {
                fontSize: SIZE / 6,
                fill: "#444",
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
            Node.__super__.constructor.call(this, [this.circle, this.label]);
            this.objectCaching = false;
            this.perPixelTargetFind = true;
            this.setLabel(conf.label);
        }

        Node.prototype.setLabel = function (txt) {
            if (txt) {
                this.label.setText("" + txt);
                this.label.setFill(ctx.redGreen(txt));
            } else {
                this.label.setText("");
            }
            return (this.dirty = true);
        };

        return Node;
    })(fabric.Group);
})(window.MouselabMDPCtx);
