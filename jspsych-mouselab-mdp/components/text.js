// Text class - fabric.Text wrapper
(function (ctx) {
    ctx.Text = (function (superClass) {
        ctx.extend(Text, superClass);

        function Text(txt, left, top, config) {
            var conf;
            txt = String(txt);
            conf = {
                left: left,
                top: top,
                fontFamily: "helvetica",
                fontSize: 14,
            };
            _.extend(conf, config);
            conf.objectCaching = false;
            Text.__super__.constructor.call(this, txt, conf);
            this.objectCaching = false;
        }

        return Text;
    })(fabric.Text);
})(window.MouselabMDPCtx);
