// Arrow class - renders a directional arrow on the canvas
(function (ctx) {
    ctx.Arrow = (function (superClass) {
        ctx.extend(Arrow, superClass);

        function Arrow(x1, y1, x2, y2, adj1, adj2) {
            var ang, deltaX, deltaY, dx, dy, line, point, ref, ref1;
            if (adj1 == null) {
                adj1 = 0;
            }
            if (adj2 == null) {
                adj2 = 0;
            }
            this.ang = ang = ctx.angle(x1, y1, x2, y2);
            ((ref = ctx.polarMove(x1, y1, ang, adj1)), (x1 = ref[0]), (y1 = ref[1]));
            ((ref1 = ctx.polarMove(x2, y2, ang, -(adj2 + 7.5))), (x2 = ref1[0]), (y2 = ref1[1]));
            line = new fabric.Line([x1, y1, x2, y2], {
                stroke: "#555",
                selectable: false,
                strokeWidth: 3,
            });
            this.centerX = (x1 + x2) / 2;
            this.centerY = (y1 + y2) / 2;
            deltaX = line.left - this.centerX;
            deltaY = line.top - this.centerY;
            dx = x2 - x1;
            dy = y2 - y1;
            point = new fabric.Triangle({
                left: x2 + deltaX,
                top: y2 + deltaY,
                pointType: "arrow_start",
                angle: (ang * 180) / Math.PI,
                width: 10,
                height: 10,
                fill: "#555",
            });
            Arrow.__super__.constructor.call(this, [line, point]);
        }

        return Arrow;
    })(fabric.Group);
})(window.MouselabMDPCtx);
