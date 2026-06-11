// MouselabMDP class - constructor
(function (ctx) {
    ctx.MouselabMDP = (function () {
        function MouselabMDP(config) {
            var bind = ctx.bind;
            this.checkFinished = bind(this.checkFinished, this);
            this.endTrial = bind(this.endTrial, this);
            this.buildMap = bind(this.buildMap, this);
            this.initPlayer = bind(this.initPlayer, this);
            this.draw = bind(this.draw, this);
            this.run = bind(this.run, this);
            this.addScore = bind(this.addScore, this);
            this.arrive = bind(this.arrive, this);
            this.recordQuery = bind(this.recordQuery, this);
            this.getEdgeLabel = bind(this.getEdgeLabel, this);
            this.mouseoutEdge = bind(this.mouseoutEdge, this);
            this.mouseoverEdge = bind(this.mouseoverEdge, this);
            this.clickEdge = bind(this.clickEdge, this);
            this.mouseoutState = bind(this.mouseoutState, this);
            this.mouseoverState = bind(this.mouseoverState, this);
            this.clickState = bind(this.clickState, this);
            this.handleKey = bind(this.handleKey, this);

            var c = config;
            this.display = c.display;
            this.graph = c.graph;
            this.layout = c.layout;
            this.initial = c.initial;
            this.stateLabels = c.stateLabels != null ? c.stateLabels : null;
            this.stateDisplay = c.stateDisplay != null ? c.stateDisplay : "never";
            this.stateClickCost = c.stateClickCost != null ? c.stateClickCost : 0;
            this.edgeLabels = c.edgeLabels != null ? c.edgeLabels : "reward";
            this.edgeDisplay = c.edgeDisplay != null ? c.edgeDisplay : "always";
            this.edgeClickCost = c.edgeClickCost != null ? c.edgeClickCost : 0;
            this.keys = c.keys != null ? c.keys : ctx.KEYS;
            this.trialIndex = c.trialIndex != null ? c.trialIndex : ctx.TRIAL_INDEX;
            this.playerImage = c.playerImage != null ? c.playerImage : "static/images/plane.png";
            this.SIZE = c.SIZE != null ? c.SIZE : ctx.SIZE;
            this.ANIMATION_SPEED = c.ANIMATION_SPEED != null
                ? c.ANIMATION_SPEED
                : ctx.CONFIG.ANIMATION_SPEED;

            if (ctx.CONFIG.DEBUG_SHOW_VALUES) {
                this.stateDisplay = "always";
                this.edgeDisplay = "always";
            }
            var sm = ctx.CONFIG.STATE_INTERACTION_MODE;
            var em = ctx.CONFIG.EDGE_INTERACTION_MODE;
            if (sm != null) this.stateDisplay = sm;
            if (em != null) this.edgeDisplay = em;

            var leftMessage = c.leftMessage != null ? c.leftMessage : "Round: 1/1";
            var centerMessage = c.centerMessage != null ? c.centerMessage : "&nbsp;";
            var rightMessage = c.rightMessage != null
                ? c.rightMessage
                : "Score: <span id=mouselab-score/>";
            var lowerMessage = c.lowerMessage != null ? c.lowerMessage : ctx.KEY_DESCRIPTION;

            _.extend(this, c);
            ctx.checkObj(this);
            this.invKeys = _.invert(this.keys);
            this.data = {
                trialIndex: this.trialIndex,
                score: 0,
                path: [],
                rt: [],
                actions: [],
                actionTimes: [],
                transitions: [],
                queries: {
                    click: {
                        state: { target: [], time: [] },
                        edge: { target: [], time: [] },
                    },
                    mouseover: {
                        state: { target: [], time: [] },
                        edge: { target: [], time: [] },
                    },
                    mouseout: {
                        state: { target: [], time: [] },
                        edge: { target: [], time: [] },
                    },
                },
            };
            this.leftMessage = $("<div>", {
                id: "mouselab-msg-left",
                class: "mouselab-header",
                html: leftMessage,
            }).appendTo(this.display);
            this.centerMessage = $("<div>", {
                id: "mouselab-msg-center",
                class: "mouselab-header",
                html: centerMessage,
            }).appendTo(this.display);
            this.rightMessage = $("<div>", {
                id: "mouselab-msg-right",
                class: "mouselab-header",
                html: rightMessage,
            }).appendTo(this.display);
            this.addScore(0);
            this.canvasElement = $("<canvas>", { id: "mouselab-canvas" })
                .attr({ width: 500, height: 500 })
                .appendTo(this.display);
            this.lowerMessage = $("<div>", {
                id: "mouselab-msg-bottom",
                html: lowerMessage || "&nbsp",
            }).appendTo(this.display);
            ctx.LOG_INFO("new MouselabMDP", this);
        }

        return MouselabMDP;
    })();
})(window.MouselabMDPCtx);
