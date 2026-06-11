// MouselabMDP class - main experiment controller
(function (ctx) {
    ctx.MouselabMDP = (function () {
        function MouselabMDP(config) {
            this.checkFinished = ctx.bind(this.checkFinished, this);
            this.endTrial = ctx.bind(this.endTrial, this);
            this.buildMap = ctx.bind(this.buildMap, this);
            this.initPlayer = ctx.bind(this.initPlayer, this);
            this.draw = ctx.bind(this.draw, this);
            this.run = ctx.bind(this.run, this);
            this.addScore = ctx.bind(this.addScore, this);
            this.arrive = ctx.bind(this.arrive, this);
            this.recordQuery = ctx.bind(this.recordQuery, this);
            this.getEdgeLabel = ctx.bind(this.getEdgeLabel, this);
            this.mouseoutEdge = ctx.bind(this.mouseoutEdge, this);
            this.mouseoverEdge = ctx.bind(this.mouseoverEdge, this);
            this.clickEdge = ctx.bind(this.clickEdge, this);
            this.mouseoutState = ctx.bind(this.mouseoutState, this);
            this.mouseoverState = ctx.bind(this.mouseoverState, this);
            this.clickState = ctx.bind(this.clickState, this);
            this.handleKey = ctx.bind(this.handleKey, this);
            var centerMessage,
                leftMessage,
                lowerMessage,
                ref,
                ref1,
                ref10,
                ref11,
                ref12,
                ref13,
                ref14,
                ref2,
                ref3,
                ref4,
                ref5,
                ref6,
                ref7,
                ref8,
                ref9,
                rightMessage;
            ((this.display = config.display),
                (this.graph = config.graph),
                (this.layout = config.layout),
                (this.initial = config.initial),
                (this.stateLabels = (ref = config.stateLabels) != null ? ref : null),
                (this.stateDisplay = (ref1 = config.stateDisplay) != null ? ref1 : "never"),
                (this.stateClickCost = (ref2 = config.stateClickCost) != null ? ref2 : 0),
                (this.edgeLabels = (ref3 = config.edgeLabels) != null ? ref3 : "reward"),
                (this.edgeDisplay = (ref4 = config.edgeDisplay) != null ? ref4 : "always"),
                (this.edgeClickCost = (ref5 = config.edgeClickCost) != null ? ref5 : 0),
                (this.keys = (ref6 = config.keys) != null ? ref6 : ctx.KEYS),
                (this.trialIndex = (ref7 = config.trialIndex) != null ? ref7 : ctx.TRIAL_INDEX),
                (this.playerImage =
                    (ref8 = config.playerImage) != null ? ref8 : "static/images/plane.png"),
                (this.SIZE = (ref9 = config.SIZE) != null ? ref9 : ctx.SIZE),
                (this.ANIMATION_SPEED =
                    (ref14 = config.ANIMATION_SPEED) != null ? ref14 : ctx.CONFIG.ANIMATION_SPEED),
                (leftMessage = (ref10 = config.leftMessage) != null ? ref10 : "Round: 1/1"),
                (centerMessage = (ref11 = config.centerMessage) != null ? ref11 : "&nbsp;"),
                (rightMessage =
                    (ref12 = config.rightMessage) != null
                        ? ref12
                        : "Score: <span id=mouselab-score/>"),
                (lowerMessage =
                    (ref13 = config.lowerMessage) != null ? ref13 : ctx.KEY_DESCRIPTION));
            _.extend(this, config);
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
                        state: {
                            target: [],
                            time: [],
                        },
                        edge: {
                            target: [],
                            time: [],
                        },
                    },
                    mouseover: {
                        state: {
                            target: [],
                            time: [],
                        },
                        edge: {
                            target: [],
                            time: [],
                        },
                    },
                    mouseout: {
                        state: {
                            target: [],
                            time: [],
                        },
                        edge: {
                            target: [],
                            time: [],
                        },
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
            this.canvasElement = $("<canvas>", {
                id: "mouselab-canvas",
            })
                .attr({
                    width: 500,
                    height: 500,
                })
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
