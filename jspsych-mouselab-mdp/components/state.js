// State class - represents a node/state on the canvas
(function (ctx) {
    ctx.State = (function (superClass) {
        ctx.extend(State, superClass);

        function State(name, left, top, config) {
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
                fill: "#44d",
            });
            this.radius = this.circle.radius;
            this.left = this.circle.left;
            this.top = this.circle.top;
            this.on("mousedown", function () {
                return mdpInstance.clickState(this, this.name);
            });
            State.__super__.constructor.call(this, [this.circle, this.label]);
            this.objectCaching = false;
            this.setLabel(conf.label);
        }

        State.prototype.setLabel = function (txt) {
            if (txt) {
                this.label.setText("" + txt);
                this.label.setFill(ctx.redGreen(txt));
            } else {
                this.label.setText("");
            }
            return (this.dirty = true);
        };

        return State;
    })(fabric.Group);
})(window.MouselabMDPCtx);
