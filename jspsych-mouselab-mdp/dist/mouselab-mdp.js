// Mouselab-MDP jsPsych plugin - generated bundle
"use strict";
var MouselabMDPSetup = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __pow = Math.pow;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // jspsych-mouselab-mdp/src/index.ts
  var index_exports = {};
  __export(index_exports, {
    MouselabMDP: () => MouselabMDP
  });

  // jspsych-mouselab-mdp/src/core/utils.ts
  var DEBUG_MODE = false;
  var TRIAL_INDEX = 1;
  function incrementTrialIndex() {
    return TRIAL_INDEX += 1;
  }
  function PRINT(...args) {
    if (!DEBUG_MODE) return;
    console.log.apply(console, args);
  }
  var LOG_INFO = PRINT;
  var LOG_DEBUG = PRINT;
  if (typeof fabric !== "undefined") {
    fabric.Object.prototype.originX = "center";
    fabric.Object.prototype.originY = "center";
    fabric.Object.prototype.selectable = false;
    fabric.Object.prototype.hoverCursor = "plain";
  }
  function angle(x1, y1, x2, y2) {
    const x = x2 - x1;
    const y = y2 - y1;
    let ang;
    if (x === 0) {
      ang = y === 0 ? 0 : y > 0 ? Math.PI / 2 : Math.PI * 3 / 2;
    } else if (y === 0) {
      ang = x > 0 ? 0 : Math.PI;
    } else {
      ang = x < 0 ? Math.atan(y / x) + Math.PI : y < 0 ? Math.atan(y / x) + 2 * Math.PI : Math.atan(y / x);
    }
    return ang + Math.PI / 2;
  }
  function polarMove(x, y, ang, dist2) {
    x += dist2 * Math.sin(ang);
    y -= dist2 * Math.cos(ang);
    return [x, y];
  }
  function dist(o1, o2) {
    return Math.sqrt(
      __pow(o1.left - o2.left, 2) + __pow(o1.top - o2.top, 2)
    );
  }
  function redGreen(val) {
    if (typeof val === "number") {
      if (val > 0) return "#080";
      if (val < 0) return "#b00";
      return "#888";
    }
    const n = parseFloat(String(val));
    if (isNaN(n)) return "#888";
    if (n > 0) return "#080";
    if (n < 0) return "#b00";
    return "#888";
  }
  function round(x) {
    return Math.round(x * 100) / 100;
  }
  var KEYS = _.mapObject(
    {
      up: "uparrow",
      down: "downarrow",
      right: "rightarrow",
      left: "leftarrow"
    },
    jsPsych.pluginAPI.convertKeyCharacterToKeyCode
  );

  // jspsych-mouselab-mdp/src/core/config.ts
  var CONFIG = {
    ANIMATION_SPEED: 0.5,
    SIZE: 120,
    EDGE_WIDTH: 4,
    HOVER_EDGE_WIDTH: 6,
    ARROW_HEAD_SIZE: 10,
    BRANCH_LABEL_FONT_SIZE: 12,
    ACTION_COLORS: ["#2196F3", "#F44336", "#4CAF50", "#FF9800"],
    DEFAULT_EDGE_COLOR: "#888",
    TRAIL_COLOR: "#1565C0",
    TRAIL_WIDTH: 5,
    STEM_COLOR: "#888",
    STEM_WIDTH: 4,
    NODE_INTERACTION_MODE: null,
    EDGE_INTERACTION_MODE: null,
    DEBUG_SHOW_VALUES: false,
    NODE_RADIUS_RATIO: 0.25,
    NODE_FONT_SIZE_RATIO: 1 / 6,
    NODE_LABEL_PADDING_X: 8,
    NODE_LABEL_PADDING_Y: 4,
    NODE_LINE_HEIGHT_RATIO: 0.2,
    NODE_LABEL_BG_RADIUS: 4,
    NODE_LABEL_BG_STROKE: "#444",
    NODE_LABEL_TEXT_FILL: "#222",
    NODE_REWARD_TEXT_FILL: "#888",
    NODE_DEFAULT_FILL: "#bbb",
    DEFAULT_EDGE_SPACING: 8,
    EDGE_LABEL_OFFSET_RATIO: 0.45,
    BRANCH_ARROW_POSITION_RATIO: 0.55,
    BRANCH_RADIUS_GAP: 8,
    BRANCH_LABEL_PADDING: 6,
    BRANCH_LABEL_INDENT: 10,
    BRANCH_GROUP_LABEL_SIZE_DELTA: 2,
    BRANCH_RECT_PADDING: 8,
    BRANCH_RECT_OFFSET_X: 7,
    BRANCH_LABEL_BG_FILL: "white",
    BRANCH_LABEL_BG_STROKE: "#444",
    PLAYER_SCALE_DEFAULT: 0.3,
    TRAIL_OFFSET: 7.5
  };

  // jspsych-mouselab-mdp/src/core/mouselab-mdp.ts
  var MouselabMDP = class {
    constructor(config) {
      this.edgeViews = {};
      this.nodes = {};
      this.player = null;
      this.keyListener = null;
      this.pendingTrail = null;
      this.complete = false;
      this._trailStemLine = null;
      this._trailBranchLine = null;
      this._cachedPlayerImg = null;
      this._cachedPlayerImgUrl = null;
      this.alreadyRecorded = { clicknode: [], mouseovernode: [], mouseoutnode: [] };
      const c = config;
      this.display = c.display;
      this.initConfig(c);
      this.initDOM(c);
      LOG_INFO("new MouselabMDP", this);
    }
    initDOM(c) {
      if (c.leftMessage != null) {
        this.leftMessage = $("<div>", {
          id: "mouselab-msg-left",
          class: "mouselab-header",
          html: c.leftMessage
        }).appendTo(this.display);
      }
      if (c.centerMessage != null) {
        this.centerMessage = $("<div>", {
          id: "mouselab-msg-center",
          class: "mouselab-header",
          html: c.centerMessage
        }).appendTo(this.display);
      }
      if (c.rightMessage != null) {
        this.rightMessage = $("<div>", {
          id: "mouselab-msg-right",
          class: "mouselab-header",
          html: c.rightMessage
        }).appendTo(this.display);
      }
      this.addScore(0);
      this.canvasElement = $("<canvas>", { id: "mouselab-canvas" }).attr({ width: 500, height: 500 }).appendTo(this.display);
      if (c.lowerMessage != null) {
        this.lowerMessage = $("<div>", {
          id: "mouselab-msg-bottom",
          html: c.lowerMessage
        }).appendTo(this.display);
      }
    }
    initConfig(c) {
      this.graph = c.graph;
      this.layout = c.layout;
      this.initial = c.initial;
      this.nodeLabels = c.nodeLabels != null ? c.nodeLabels : null;
      this.nodeDisplay = c.nodeDisplay || "never";
      this.nodeClickCost = c.nodeClickCost != null ? c.nodeClickCost : 0;
      this.edgeLabels = c.edgeLabels != null ? c.edgeLabels : null;
      this.edgeDisplay = c.edgeDisplay || "always";
      this.edgeClickCost = c.edgeClickCost != null ? c.edgeClickCost : 0;
      this.keys = c.keys != null ? c.keys : KEYS;
      this.trialIndex = c.trialIndex != null ? c.trialIndex : TRIAL_INDEX;
      this.playerImage = c.playerImage != null ? c.playerImage : "static/images/plane.png";
      this.playerImageScale = c.playerImageScale != null ? c.playerImageScale : CONFIG.PLAYER_SCALE_DEFAULT;
      this.SIZE = c.SIZE != null ? c.SIZE : CONFIG.SIZE;
      this.ANIMATION_SPEED = c.ANIMATION_SPEED != null ? c.ANIMATION_SPEED : CONFIG.ANIMATION_SPEED;
      this.nodeRewards = c.nodeRewards != null ? c.nodeRewards : {};
      this.groupLabels = c.groupLabels != null ? c.groupLabels : {};
      this.actionLabels = c.actionLabels != null ? c.actionLabels : {};
      this.completionMessage = c.completionMessage != null ? c.completionMessage : "Press any key to continue.";
      this.scoreFormat = c.scoreFormat != null ? c.scoreFormat : null;
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
            node: { target: [], time: [] },
            edge: { target: [], time: [] }
          },
          mouseover: {
            node: { target: [], time: [] },
            edge: { target: [], time: [] }
          },
          mouseout: {
            node: { target: [], time: [] },
            edge: { target: [], time: [] }
          }
        }
      };
    }
    draw(obj) {
      this.canvas.add(obj);
      return obj;
    }
  };

  // jspsych-mouselab-mdp/src/core/mouselab-mdp-display.ts
  MouselabMDP.prototype.clickNode = function(g, s) {
    LOG_DEBUG("clickNode " + s);
    if (this.nodeDisplay === "click" && !g.label.text) {
      this.addScore(-this.nodeClickCost);
      const parts = [];
      if (this.nodeLabels && this.nodeLabels[s] != null) {
        parts.push(this.nodeLabels[s]);
      }
      const r = this.nodeRewards[s];
      if (r != null) {
        parts.push(String(r));
      }
      if (parts.length > 0) {
        g.setLabel(parts.join("  "), r);
      }
      this.recordQuery("click", "node", s);
    }
  };
  MouselabMDP.prototype.mouseoverNode = function(g, s) {
    LOG_DEBUG("mouseoverNode " + s);
    if (this.nodeDisplay === "hover") {
      const parts = [];
      if (this.nodeLabels && this.nodeLabels[s] != null) {
        parts.push(this.nodeLabels[s]);
      }
      const r = this.nodeRewards[s];
      if (r != null) {
        parts.push(String(r));
      }
      if (parts.length > 0) {
        g.setLabel(parts.join("  "), r);
      }
    }
    this.recordQuery("mouseover", "node", s);
  };
  MouselabMDP.prototype.mouseoutNode = function(g, s) {
    LOG_DEBUG("mouseoutNode " + s);
    if (this.nodeDisplay === "hover") {
      g.setLabel("");
      if (this.player) this.canvas.bringToFront(this.player);
    }
    this.recordQuery("mouseout", "node", s);
  };
  MouselabMDP.prototype.clickEdge = function(g, s0, actionName, r) {
    LOG_DEBUG("clickEdge " + s0 + " " + actionName + " " + r);
    if (this.edgeDisplay === "click" && !g.label.text) {
      this.addScore(-this.edgeClickCost);
      g.setLabel(this.getEdgeLabel(s0, actionName, r));
      this.recordQuery("click", "edge", s0 + "__" + actionName);
    }
  };
  MouselabMDP.prototype.mouseoverEdge = function(g, s0, actionName, r) {
    LOG_DEBUG("mouseoverEdge " + s0 + " " + actionName + " " + r);
    if (this.edgeDisplay === "hover") {
      g.setLabel(this.getEdgeLabel(s0, actionName, r));
    }
    this.recordQuery("mouseover", "edge", s0 + "__" + actionName);
  };
  MouselabMDP.prototype.mouseoutEdge = function(g, s0, actionName, r) {
    LOG_DEBUG("mouseoutEdge " + s0 + " " + actionName + " " + r);
    if (this.edgeDisplay === "hover") {
      g.setLabel("");
    }
    this.recordQuery("mouseout", "edge", s0 + "__" + actionName);
  };

  // jspsych-mouselab-mdp/src/core/mouselab-mdp-scoring.ts
  MouselabMDP.prototype.addScore = function(v) {
    this.data.score = round(this.data.score + v);
    const displayScore = this.scoreFormat ? this.scoreFormat(this.data.score) : String(this.data.score);
    $("#mouselab-score").html(displayScore);
    $("#mouselab-score").css("color", redGreen(this.data.score));
  };
  MouselabMDP.prototype.recordQuery = function(queryType, targetType, target) {
    this.canvas.renderAll();
    LOG_DEBUG("recordQuery " + queryType + " " + targetType + " " + target);
    const queryBucket = this.data.queries[queryType][targetType];
    queryBucket.target.push(target);
    queryBucket.time.push(Date.now() - this.initTime);
  };
  MouselabMDP.prototype.getEdgeLabel = function(s0, actionName, r) {
    const eid = s0 + "_" + actionName;
    const edgeLabel = this.edgeLabels && this.edgeLabels[eid];
    const parts = [];
    if (edgeLabel) parts.push(edgeLabel);
    parts.push(actionName);
    if (r != null) parts.push(String(r));
    return parts.join("  ");
  };
  MouselabMDP.prototype.isStochasticEdge = function(edge) {
    return edge.outcomes && edge.outcomes.length > 1;
  };

  // jspsych-mouselab-mdp/src/core/mouselab-mdp-navigation.ts
  MouselabMDP.prototype.handleKey = function(s0, a) {
    try {
      LOG_DEBUG("handleKey", s0, a);
      this.data.actions.push(a);
      this.data.actionTimes.push(Date.now() - this.initTime);
      const edgeData = this.graph[s0] && this.graph[s0][a];
      if (!edgeData) return;
      const transition = this.sampleTransition(edgeData);
      const reward = transition.reward;
      const s1 = transition.nextState;
      const edgeView = this.edgeViews != null ? this.edgeViews[s0] != null ? this.edgeViews[s0][a] : void 0 : void 0;
      this.data.transitions.push({
        state: s0,
        action: a,
        reward,
        nextState: s1,
        probability: transition.probability
      });
      if (edgeView != null && transition.outcomeIndex != null) {
        this.pendingTrail = {
          edgeView,
          outcomeIndex: transition.outcomeIndex,
          actionChar: a.toUpperCase()
        };
      }
      if (this.player) {
        this.canvas.bringToFront(this.player);
      }
      LOG_DEBUG(s0 + ", " + a + " -> " + reward + ", " + s1);
      const s1g = this.nodes[s1];
      this.animateMove(
        s1g,
        reward,
        edgeView != null ? edgeView.stemStart : void 0,
        edgeView != null ? edgeView.branchPoint : void 0,
        s1
      );
    } catch (err) {
      this._handleError("handleKey", err);
    }
  };
  MouselabMDP.prototype.sampleTransition = function(edge) {
    const outcomes = edge.outcomes;
    if (outcomes.length === 1) {
      return {
        reward: outcomes[0].reward,
        nextState: outcomes[0].target,
        probability: 1,
        outcomeIndex: void 0
      };
    }
    const roll = Math.random();
    let cumulative = 0;
    for (let i = 0; i < outcomes.length; i++) {
      const outcome = outcomes[i];
      cumulative += outcome.prob;
      if (roll <= cumulative) {
        return {
          reward: outcome.reward,
          nextState: outcome.target,
          probability: outcome.prob,
          outcomeIndex: i
        };
      }
    }
    const last = outcomes[outcomes.length - 1];
    return {
      reward: last.reward,
      nextState: last.target,
      probability: last.prob,
      outcomeIndex: outcomes.length - 1
    };
  };
  MouselabMDP.prototype.animateMove = function(s1g, reward, stemStart, branchPoint, finalState) {
    if (!this.player) {
      PRINT("animateMove called without initialized player");
      this.arrive(finalState);
      return;
    }
    const waypoints = [{ left: this.player.left, top: this.player.top }];
    if (stemStart != null) {
      waypoints.push(stemStart);
    }
    if (branchPoint != null) {
      waypoints.push(branchPoint);
    }
    waypoints.push({ left: s1g.left, top: s1g.top });
    const segments = [];
    let totalDist = 0;
    for (let i = 1; i < waypoints.length; i++) {
      const d = dist(waypoints[i - 1], waypoints[i]);
      segments.push({
        from: waypoints[i - 1],
        to: waypoints[i],
        dist: d,
        accum: totalDist
      });
      totalDist += d;
    }
    let trailInfo = null;
    const pendingTrail = this.pendingTrail;
    const hasEdge = stemStart && branchPoint && waypoints.length >= 4 && pendingTrail;
    if (hasEdge) {
      const edgeView = pendingTrail.edgeView;
      const childNode = edgeView.children[pendingTrail.outcomeIndex];
      const nodeGap = edgeView.stemStart.left - edgeView.parent.left - edgeView.parent.radius;
      const ang = angle(
        branchPoint.left,
        branchPoint.top,
        childNode.left,
        childNode.top
      );
      const ae = polarMove(
        childNode.left,
        childNode.top,
        ang,
        -(childNode.radius + nodeGap + CONFIG.TRAIL_OFFSET)
      );
      const arrowEnd = { left: ae[0], top: ae[1] };
      const seg1Len = segments[1].dist;
      const seg2dx = waypoints[3].left - waypoints[2].left;
      const seg2dy = waypoints[3].top - waypoints[2].top;
      const seg2Len = segments[2].dist;
      const arrowProj = ((arrowEnd.left - branchPoint.left) * seg2dx + (arrowEnd.top - branchPoint.top) * seg2dy) / seg2Len;
      const arrowLen = Math.max(0, Math.min(seg2Len, arrowProj));
      const color = CONFIG.ACTION_COLORS[pendingTrail.actionChar.charCodeAt(0) - 65] || CONFIG.TRAIL_COLOR;
      trailInfo = {
        stemStart,
        branchPoint,
        arrowEnd,
        color,
        width: CONFIG.TRAIL_WIDTH,
        stemOffset: segments[0].dist,
        stemLen: seg1Len,
        arrowLen,
        seg0Dist: segments[0].dist + seg1Len
      };
    }
    const duration = totalDist * this.ANIMATION_SPEED;
    const self = this;
    fabric.util.animate({
      startValue: 0,
      endValue: totalDist,
      duration,
      onChange: function(traveled) {
        let k;
        for (k = segments.length - 1; k >= 0; k--) {
          if (traveled >= segments[k].accum) break;
        }
        const seg = segments[k];
        const segT = Math.min((traveled - seg.accum) / seg.dist, 1);
        const pos = {
          left: seg.from.left + (seg.to.left - seg.from.left) * segT,
          top: seg.from.top + (seg.to.top - seg.from.top) * segT
        };
        self.player.set(pos);
        if (trailInfo) {
          const stemRevealed = Math.max(
            0,
            Math.min(traveled - trailInfo.stemOffset, trailInfo.stemLen)
          );
          const branchRevealed = Math.max(
            0,
            Math.min(traveled - trailInfo.seg0Dist, trailInfo.arrowLen)
          );
          if (stemRevealed > 0) {
            const stemT = stemRevealed / trailInfo.stemLen;
            const stemEnd = {
              left: trailInfo.stemStart.left + (trailInfo.branchPoint.left - trailInfo.stemStart.left) * stemT,
              top: trailInfo.stemStart.top + (trailInfo.branchPoint.top - trailInfo.stemStart.top) * stemT
            };
            const lineOpts = {
              stroke: trailInfo.color,
              strokeWidth: trailInfo.width,
              selectable: false,
              evented: false,
              strokeLineCap: "round"
            };
            if (!self._trailStemLine) {
              self._trailStemLine = new fabric.Line(
                [trailInfo.stemStart.left, trailInfo.stemStart.top, stemEnd.left, stemEnd.top],
                lineOpts
              );
              self.canvas.add(self._trailStemLine);
            } else {
              self._trailStemLine.set({
                x1: trailInfo.stemStart.left,
                y1: trailInfo.stemStart.top,
                x2: stemEnd.left,
                y2: stemEnd.top
              });
              self._trailStemLine.setCoords();
            }
          }
          if (branchRevealed > 0) {
            const branchT = branchRevealed / trailInfo.arrowLen;
            const branchEnd = {
              left: trailInfo.branchPoint.left + (trailInfo.arrowEnd.left - trailInfo.branchPoint.left) * branchT,
              top: trailInfo.branchPoint.top + (trailInfo.arrowEnd.top - trailInfo.branchPoint.top) * branchT
            };
            if (!self._trailBranchLine) {
              self._trailBranchLine = new fabric.Line(
                [trailInfo.branchPoint.left, trailInfo.branchPoint.top, branchEnd.left, branchEnd.top],
                {
                  stroke: trailInfo.color,
                  strokeWidth: trailInfo.width,
                  selectable: false,
                  evented: false,
                  strokeLineCap: "round"
                }
              );
              self.canvas.add(self._trailBranchLine);
            } else {
              self._trailBranchLine.set({
                x1: trailInfo.branchPoint.left,
                y1: trailInfo.branchPoint.top,
                x2: branchEnd.left,
                y2: branchEnd.top
              });
              self._trailBranchLine.setCoords();
            }
          }
          self.canvas.bringToFront(self.player);
        }
        self.canvas.renderAll();
      },
      onComplete: function() {
        if (self._trailStemLine) {
          self.canvas.remove(self._trailStemLine);
          self._trailStemLine = null;
        }
        if (self._trailBranchLine) {
          self.canvas.remove(self._trailBranchLine);
          self._trailBranchLine = null;
        }
        self.addScore(reward);
        self.arrive(finalState);
      }
    });
  };
  MouselabMDP.prototype.arrive = function(s) {
    LOG_DEBUG("arrive", s);
    const ACTION_COLORS = ["#2196F3", "#F44336", "#4CAF50", "#FF9800"];
    const TRAIL_COLOR = "#1565C0";
    const TRAIL_WIDTH = 5;
    if (this.pendingTrail) {
      const trailColor = ACTION_COLORS[this.pendingTrail.actionChar.charCodeAt(0) - 65] || TRAIL_COLOR;
      this.pendingTrail.edgeView.paintTrail(
        this.pendingTrail.outcomeIndex,
        trailColor,
        TRAIL_WIDTH
      );
      this.pendingTrail = null;
      this.canvas.renderAll();
    }
    this.data.path.push(s);
    const nodeReward = this.nodeRewards[s];
    if (nodeReward != null) this.addScore(nodeReward);
    let keys;
    if (this.graph[s]) {
      keys = Object.keys(this.graph[s]).map((a) => this.keys[a]);
    } else {
      keys = [];
    }
    if (!keys.length) {
      this.complete = true;
      this.checkFinished();
      return;
    }
    const self = this;
    this.keyListener = jsPsych.pluginAPI.getKeyboardResponse({
      valid_responses: keys,
      rt_method: "date",
      persist: false,
      allow_held_key: false,
      callback_function: function(info) {
        const action = self.invKeys[String(info.key)];
        LOG_DEBUG("key", info.key);
        self.data.rt.push(info.rt);
        self.handleKey(s, action);
      }
    });
  };

  // jspsych-mouselab-mdp/src/components/text.ts
  var Text = class extends fabric.Text {
    constructor(txt, left, top, config) {
      const str = String(txt);
      const conf = __spreadValues({
        left,
        top,
        fontFamily: "helvetica",
        fontSize: 14,
        objectCaching: false
      }, config);
      super(str, conf);
      this.objectCaching = false;
    }
  };

  // jspsych-mouselab-mdp/src/components/node.ts
  var Node = class extends fabric.Group {
    constructor(name, left, top, config) {
      const cellSize = config.SIZE || CONFIG.SIZE;
      const mdpInstance = config.mdpInstance;
      const rewardVal = config.reward != null ? config.reward : null;
      const px = (left + 0.5) * cellSize;
      const py = (top + 0.5) * cellSize;
      const lineHeight = cellSize * CONFIG.NODE_LINE_HEIGHT_RATIO;
      const conf = {
        left: px,
        top: py,
        fill: CONFIG.NODE_DEFAULT_FILL,
        radius: cellSize * CONFIG.NODE_RADIUS_RATIO,
        label: ""
      };
      _.extend(conf, config);
      const circle = new fabric.Circle(conf);
      const labelBg = new fabric.Rect({
        left: px,
        top: py,
        width: 0,
        height: 0,
        rx: CONFIG.NODE_LABEL_BG_RADIUS,
        ry: CONFIG.NODE_LABEL_BG_RADIUS,
        fill: "white",
        stroke: CONFIG.NODE_LABEL_BG_STROKE,
        strokeWidth: 1,
        selectable: false,
        evented: false,
        originX: "center",
        originY: "center",
        opacity: 0
      });
      labelBg.objectCaching = false;
      const fs = cellSize * CONFIG.NODE_FONT_SIZE_RATIO;
      const label = new Text("", px, py - lineHeight / 2, {
        fontSize: fs,
        fill: CONFIG.NODE_LABEL_TEXT_FILL,
        fontWeight: "bold"
      });
      const rewardText = new Text("", px, py + lineHeight / 2, {
        fontSize: fs,
        fill: CONFIG.NODE_REWARD_TEXT_FILL
      });
      const radius = circle.radius;
      super([circle, labelBg, label, rewardText]);
      this.name = name;
      this.mdpInstance = mdpInstance;
      this.reward = rewardVal;
      this.circle = circle;
      this.labelBg = labelBg;
      this.label = label;
      this.rewardText = rewardText;
      this.radius = radius;
      this.objectCaching = false;
      this.perPixelTargetFind = true;
      this.on("mousedown", () => {
        if (mdpInstance.nodeDisplay !== "click") return;
        return mdpInstance.clickNode(this, this.name);
      });
      this.on("mouseover", () => {
        if (mdpInstance.nodeDisplay !== "hover") return;
        return mdpInstance.mouseoverNode(this, this.name);
      });
      this.on("mouseout", () => {
        if (mdpInstance.nodeDisplay !== "hover") return;
        return mdpInstance.mouseoutNode(this, this.name);
      });
      this.setLabel(conf.label);
    }
    setLabel(txt, reward) {
      const r = reward != null ? reward : this.reward;
      if (txt) {
        const parts = txt.split("  ");
        this.label.setText(parts[0] || "");
        const rewardStr = parts[1] || (r != null ? String(r) : "");
        this.rewardText.setText(rewardStr);
        this.rewardText.setFill(
          r != null ? redGreen(r) : "#888"
        );
        this.dirty = true;
        const maxW = Math.max(this.label.width, this.rewardText.width);
        const lineH = this.label.fontSize * 1.3;
        const totalH = (this.label.text ? lineH : 0) + (this.rewardText.text ? lineH : 0);
        this.labelBg.set({
          width: maxW + CONFIG.NODE_LABEL_PADDING_X,
          height: totalH + CONFIG.NODE_LABEL_PADDING_Y
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
    }
  };

  // jspsych-mouselab-mdp/src/components/arrow.ts
  var Arrow = class extends fabric.Group {
    constructor(x1, y1, x2, y2, adj1 = 0, adj2 = 0, color = CONFIG.DEFAULT_EDGE_COLOR, width = CONFIG.EDGE_WIDTH) {
      const ang = angle(x1, y1, x2, y2);
      const ref = polarMove(x1, y1, ang, adj1);
      x1 = ref[0];
      y1 = ref[1];
      const ref1 = polarMove(x2, y2, ang, -(adj2 + 7.5));
      x2 = ref1[0];
      y2 = ref1[1];
      const line = new fabric.Line([x1, y1, x2, y2], {
        stroke: color,
        selectable: false,
        strokeWidth: width
      });
      const centerX = (x1 + x2) / 2;
      const centerY = (y1 + y2) / 2;
      const deltaX = line.left - centerX;
      const deltaY = line.top - centerY;
      const point = new fabric.Triangle({
        left: x2 + deltaX,
        top: y2 + deltaY,
        pointType: "arrow_start",
        angle: ang * 180 / Math.PI,
        width: CONFIG.ARROW_HEAD_SIZE,
        height: CONFIG.ARROW_HEAD_SIZE,
        fill: color
      });
      super([line, point]);
      this.ang = ang;
      this.centerX = centerX;
      this.centerY = centerY;
    }
  };

  // jspsych-mouselab-mdp/src/components/edge.ts
  var Edge = class extends fabric.Group {
    constructor(c1, reward, c2, config) {
      const SIZE = config.SIZE || CONFIG.SIZE;
      const mdpInstance = config.mdpInstance;
      const spacing = config.spacing != null ? config.spacing : CONFIG.DEFAULT_EDGE_SPACING;
      const adjX = config.adjX != null ? config.adjX : 0;
      const adjY = config.adjY != null ? config.adjY : 0;
      const rotateLabel = config.rotateLabel != null ? config.rotateLabel : false;
      const initialLabel = config.label != null ? config.label : "";
      const x1 = c1.left + adjX;
      const y1 = c1.top + adjY;
      const x2 = c2.left + adjX;
      const y2 = c2.top + adjY;
      const arrow = new Arrow(
        x1,
        y1,
        x2,
        y2,
        c1.radius + spacing,
        c2.radius + spacing,
        CONFIG.DEFAULT_EDGE_COLOR,
        CONFIG.EDGE_WIDTH
      );
      arrow.set({
        selectable: false,
        evented: false
      });
      let ang = (arrow.ang + Math.PI / 2) % (Math.PI * 2);
      if (0.5 * Math.PI <= ang && ang <= 1.5 * Math.PI) {
        ang += Math.PI;
      }
      const ref = polarMove(
        x1,
        y1,
        angle(x1, y1, x2, y2),
        SIZE * CONFIG.EDGE_LABEL_OFFSET_RATIO
      );
      const labX = ref[0];
      const labY = ref[1];
      const label = new Text("----------", labX, labY, {
        angle: rotateLabel ? ang * 180 / Math.PI : 0,
        fill: redGreen(initialLabel),
        fontSize: SIZE * CONFIG.NODE_FONT_SIZE_RATIO
      });
      const angRad = angle(x1, y1, x2, y2);
      const hitStart = polarMove(x1, y1, angRad, c1.radius + spacing);
      const hitEnd = polarMove(x2, y2, angRad, -(c2.radius + spacing));
      const dx = hitEnd[0] - hitStart[0];
      const dy = hitEnd[1] - hitStart[1];
      const hitBox = new fabric.Rect({
        left: hitStart[0],
        top: hitStart[1],
        width: Math.hypot(dx, dy),
        height: CONFIG.EDGE_WIDTH + 4,
        originX: "left",
        originY: "center",
        angle: Math.atan2(dy, dx) * 180 / Math.PI,
        fill: "rgba(0,0,0,0)",
        selectable: false,
        evented: true
      });
      super([arrow, label]);
      this.s0 = config.s0;
      this.actionName = config.actionName;
      this.arrow = arrow;
      this.label = label;
      this.hitBox = hitBox;
      this.objectCaching = false;
      const self = this;
      this.hitBox.on("mousedown", () => {
        return mdpInstance.clickEdge(self, self.s0, self.actionName, reward);
      });
      this.hitBox.on("mouseover", () => {
        if (mdpInstance.edgeDisplay !== "hover") return;
        if (self.arrow && self.arrow._objects && self.arrow._objects[0]) {
          self.arrow._objects[0].set({ strokeWidth: CONFIG.HOVER_EDGE_WIDTH });
          self.arrow.dirty = true;
        }
        return mdpInstance.mouseoverEdge(self, self.s0, self.actionName, reward);
      });
      this.hitBox.on("mouseout", () => {
        if (mdpInstance.edgeDisplay !== "hover") return;
        if (self.arrow && self.arrow._objects && self.arrow._objects[0]) {
          self.arrow._objects[0].set({ strokeWidth: CONFIG.EDGE_WIDTH });
          self.arrow.dirty = true;
        }
        return mdpInstance.mouseoutEdge(self, self.s0, self.actionName, reward);
      });
      this.setLabel(initialLabel);
      mdpInstance.draw(this.hitBox);
    }
    setLabel(txt) {
      if (txt) {
        this.label.setText("" + txt);
        this.label.setFill(redGreen(txt));
      } else {
        this.label.setText("");
      }
      this.dirty = true;
      return this;
    }
  };

  // jspsych-mouselab-mdp/src/components/split-edge-labels.ts
  function actionColorForName(name) {
    return CONFIG.ACTION_COLORS[name.toUpperCase().charCodeAt(0) - 65] || CONFIG.DEFAULT_EDGE_COLOR;
  }
  function buildArrowLabels(ctx, targetName, midX, midY, mdpInstance, edgeIdx) {
    const fontSize = CONFIG.BRANCH_LABEL_FONT_SIZE;
    const lineHeight = fontSize * 1.3;
    const pad = 6;
    const indent = 10;
    const texts = [];
    let maxLabelWidth = 0;
    let labelY = 0;
    let gl = null;
    const groupLabel = ctx.groupLabels[ctx.parentName];
    if (groupLabel != null) {
      gl = new fabric.Text(groupLabel, {
        fontSize: fontSize + 2,
        fill: "#222",
        fontFamily: "helvetica",
        fontWeight: "bold",
        originX: "left",
        originY: "top",
        selectable: false,
        evented: false
      });
      gl.objectCaching = false;
      maxLabelWidth = gl.width + 14;
      labelY += lineHeight;
    }
    const eid = ctx.parentName + "_" + edgeIdx;
    const showEdgeLabel = ctx.edgeLabels && ctx.edgeLabels[eid];
    if (showEdgeLabel != null) {
      const edgeLabelText = new fabric.Text(showEdgeLabel, {
        fontSize,
        fill: "#555",
        fontFamily: "helvetica",
        fontWeight: "bold",
        originX: "left",
        originY: "top",
        selectable: false,
        evented: false
      });
      edgeLabelText.objectCaching = false;
      texts.push({ type: "edge", edgeLabel: edgeLabelText, y: labelY });
      maxLabelWidth = Math.max(maxLabelWidth, edgeLabelText.width + 14);
      labelY += lineHeight;
    }
    for (const actionName in ctx.allActions) {
      const allOutcomes = ctx.allActions[actionName].outcomes;
      for (let j = 0; j < allOutcomes.length; j++) {
        if (allOutcomes[j].target === targetName) {
          const prob = Math.round(allOutcomes[j].prob * 100);
          const reward = allOutcomes[j].reward;
          const actColor = actionColorForName(actionName);
          const actionEid = eid + "_" + actionName;
          const actionLabel = ctx.actionLabels && ctx.actionLabels[actionEid];
          const keyText = new fabric.Text(actionName, {
            fontSize,
            fill: actColor,
            fontFamily: "helvetica",
            fontWeight: "bold",
            originX: "left",
            originY: "top",
            selectable: false,
            evented: false
          });
          keyText.objectCaching = false;
          const probText = new fabric.Text(prob + "%", {
            fontSize,
            fill: "#333",
            fontFamily: "helvetica",
            originX: "left",
            originY: "top",
            selectable: false,
            evented: false
          });
          probText.objectCaching = false;
          let lineWidth;
          if (actionLabel) {
            const actionLabelText = new fabric.Text(actionLabel, {
              fontSize,
              fill: "#333",
              fontFamily: "helvetica",
              originX: "left",
              originY: "top",
              selectable: false,
              evented: false
            });
            actionLabelText.objectCaching = false;
            lineWidth = indent + actionLabelText.width + pad + keyText.width + pad + probText.width;
            const actionItem = {
              type: "line",
              actionLabel: actionLabelText,
              key: keyText,
              prob: probText,
              y: labelY
            };
            if (reward != null) {
              const rewardText = new fabric.Text(String(reward), {
                fontSize,
                fill: redGreen(reward),
                fontFamily: "helvetica",
                originX: "left",
                originY: "top",
                selectable: false,
                evented: false
              });
              rewardText.objectCaching = false;
              actionItem.reward = rewardText;
              lineWidth += pad + rewardText.width;
            }
            texts.push(actionItem);
            maxLabelWidth = Math.max(maxLabelWidth, lineWidth + 14);
            labelY += lineHeight;
          } else {
            lineWidth = keyText.width + pad + probText.width;
            const keyOnlyItem = {
              type: "line",
              actionLabel: null,
              key: keyText,
              prob: probText,
              y: labelY
            };
            if (reward != null) {
              const rewardText = new fabric.Text(String(reward), {
                fontSize,
                fill: redGreen(reward),
                fontFamily: "helvetica",
                originX: "left",
                originY: "top",
                selectable: false,
                evented: false
              });
              rewardText.objectCaching = false;
              keyOnlyItem.reward = rewardText;
              lineWidth += pad + rewardText.width;
            }
            texts.push(keyOnlyItem);
            maxLabelWidth = Math.max(maxLabelWidth, lineWidth + 14);
            labelY += lineHeight;
          }
        }
      }
    }
    if (texts.length === 0) {
      return null;
    }
    const rectW = maxLabelWidth;
    const rectH = labelY + 8;
    const bgRect = new fabric.Rect({
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
      top: midY
    });
    bgRect.objectCaching = false;
    if (ctx.edgeDisplay !== "always") {
      bgRect.opacity = 0;
    }
    mdpInstance.draw(bgRect);
    const result = { rect: bgRect, items: [] };
    let firstLineCenter = midY - (labelY - lineHeight) / 2;
    if (gl) {
      gl.set({
        left: midX - maxLabelWidth / 2 + 7,
        top: firstLineCenter,
        originY: "center"
      });
      if (ctx.edgeDisplay !== "always") gl.opacity = 0;
      result.items.push(gl);
      mdpInstance.draw(gl);
      firstLineCenter += lineHeight;
    }
    for (let t = 0; t < texts.length; t++) {
      const tObj = texts[t];
      const lx = midX - maxLabelWidth / 2 + 7;
      const ly = firstLineCenter + t * lineHeight;
      if (tObj.type === "edge") {
        tObj.edgeLabel.set({
          left: lx,
          top: ly,
          originY: "center"
        });
        if (ctx.edgeDisplay !== "always") tObj.edgeLabel.opacity = 0;
        mdpInstance.draw(tObj.edgeLabel);
        result.items.push(tObj.edgeLabel);
      } else {
        if (tObj.actionLabel) {
          const ilx = lx + indent;
          tObj.actionLabel.set({
            left: ilx,
            top: ly,
            originY: "center"
          });
          tObj.key.set({
            left: ilx + tObj.actionLabel.width + pad,
            top: ly,
            originY: "center"
          });
          tObj.prob.set({
            left: ilx + tObj.actionLabel.width + pad + tObj.key.width + pad,
            top: ly,
            originY: "center"
          });
          if (tObj.reward) {
            tObj.reward.set({
              left: ilx + tObj.actionLabel.width + pad + tObj.key.width + pad + tObj.prob.width + pad,
              top: ly,
              originY: "center"
            });
          }
          if (ctx.edgeDisplay !== "always") {
            tObj.actionLabel.opacity = 0;
            tObj.key.opacity = 0;
            tObj.prob.opacity = 0;
            if (tObj.reward) tObj.reward.opacity = 0;
          }
          mdpInstance.draw(tObj.actionLabel);
          result.items.push(tObj.actionLabel);
        } else {
          tObj.key.set({
            left: lx,
            top: ly,
            originY: "center"
          });
          tObj.prob.set({
            left: lx + tObj.key.width + pad + 4,
            top: ly,
            originY: "center"
          });
          if (tObj.reward) {
            tObj.reward.set({
              left: lx + tObj.key.width + pad + tObj.prob.width + pad + 4,
              top: ly,
              originY: "center"
            });
          }
          if (ctx.edgeDisplay !== "always") {
            tObj.key.opacity = 0;
            tObj.prob.opacity = 0;
            if (tObj.reward) tObj.reward.opacity = 0;
          }
        }
        mdpInstance.draw(tObj.key);
        mdpInstance.draw(tObj.prob);
        if (tObj.reward) mdpInstance.draw(tObj.reward);
        result.items.push(tObj.key);
        result.items.push(tObj.prob);
        if (tObj.reward) result.items.push(tObj.reward);
      }
    }
    return result;
  }

  // jspsych-mouselab-mdp/src/components/split-edge.ts
  var SplitEdge = class {
    constructor(c1, children, config = {}) {
      this.children = children;
      this.allActions = config.allActions || {};
      this.edgeDisplay = config.edgeDisplay != null ? config.edgeDisplay : "hover";
      this.SIZE = config.SIZE || CONFIG.SIZE;
      this.edgeLabels = config.edgeLabels || null;
      this.groupLabels = config.groupLabels || {};
      this.actionLabels = config.actionLabels || {};
      this.actions = config.actions;
      this.parent = c1;
      this.branchPoint = null;
      this.stemStart = null;
      this.stemLine = null;
      this.arrows = [];
      this.hitBoxes = [];
      this.labels = [];
      this.objects = [];
      this.objectCaching = false;
      this.mdpInstance = null;
      this.hoveredIndex = null;
      this.clickedIndices = /* @__PURE__ */ new Set();
    }
    _labelsContext() {
      return {
        edgeDisplay: this.edgeDisplay,
        edgeLabels: this.edgeLabels,
        groupLabels: this.groupLabels,
        actionLabels: this.actionLabels,
        parentName: this.parent.name,
        allActions: this.allActions
      };
    }
    paintTrail(index, color, width) {
      if (this.stemLine) {
        this.stemLine.set({ stroke: color, strokeWidth: width });
        this.stemLine.dirty = true;
      }
      if (index < 0 || index >= this.arrows.length) {
        return;
      }
      const arrow = this.arrows[index];
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
    }
    attach(mdpInstance) {
      const radiusGap = CONFIG.BRANCH_RADIUS_GAP;
      const stemStart = this.parent.left + this.parent.radius + radiusGap;
      const stemStartY = this.parent.top;
      this.stemStart = { left: stemStart, top: stemStartY };
      let avgChildX = 0;
      let avgChildY = 0;
      for (let i = 0; i < this.children.length; i++) {
        avgChildX += this.children[i].left;
        avgChildY += this.children[i].top;
      }
      avgChildX /= this.children.length;
      avgChildY /= this.children.length;
      const branchX = this.parent.left + 0.5 * (avgChildX - this.parent.left);
      const branchY = this.parent.top + 0.5 * (avgChildY - this.parent.top);
      this.branchPoint = { left: branchX, top: branchY };
      this.stemLine = new fabric.Line(
        [stemStart, stemStartY, branchX, branchY],
        {
          stroke: CONFIG.DEFAULT_EDGE_COLOR,
          selectable: false,
          evented: false,
          strokeWidth: CONFIG.STEM_WIDTH,
          strokeLineCap: "round"
        }
      );
      mdpInstance.draw(this.stemLine);
      const arrowPositions = [];
      for (let i = 0; i < this.children.length; i++) {
        const childState = this.children[i];
        const midX = branchX + CONFIG.BRANCH_ARROW_POSITION_RATIO * (childState.left - branchX);
        const midY = branchY + CONFIG.BRANCH_ARROW_POSITION_RATIO * (childState.top - branchY);
        const arrow = new Arrow(
          branchX,
          branchY,
          childState.left,
          childState.top,
          0,
          childState.radius + radiusGap,
          CONFIG.DEFAULT_EDGE_COLOR,
          CONFIG.EDGE_WIDTH
        );
        arrow.set({
          selectable: false,
          evented: false
        });
        arrow.objectCaching = false;
        mdpInstance.draw(arrow);
        this.arrows.push(arrow);
        const angRad = angle(branchX, branchY, childState.left, childState.top);
        const hitEnd = polarMove(
          childState.left,
          childState.top,
          angRad,
          -(childState.radius + radiusGap)
        );
        const dx = hitEnd[0] - branchX;
        const dy = hitEnd[1] - branchY;
        const hitBox = new fabric.Rect({
          left: branchX,
          top: branchY,
          width: Math.hypot(dx, dy),
          height: CONFIG.EDGE_WIDTH + 15,
          originX: "left",
          originY: "center",
          angle: Math.atan2(dy, dx) * 180 / Math.PI,
          fill: "rgba(0, 0, 0, 0)",
          selectable: false,
          evented: true
        });
        this.hitBoxes.push(hitBox);
        mdpInstance.draw(hitBox);
        arrowPositions.push({
          midX,
          midY,
          childName: childState.name
        });
      }
      const ctx = this._labelsContext();
      for (let i = 0; i < arrowPositions.length; i++) {
        const pos = arrowPositions[i];
        const labelObj = buildArrowLabels(
          ctx,
          pos.childName,
          pos.midX,
          pos.midY,
          mdpInstance,
          i
        );
        this.labels.push(labelObj);
        this._attachArrowHover(this.hitBoxes[i], i, labelObj, mdpInstance);
      }
      this.mdpInstance = mdpInstance;
      return this;
    }
    _setLabelVisibility(labelObj, visible) {
      if (!labelObj) return;
      labelObj.rect.opacity = visible ? 1 : 0;
      labelObj.rect.dirty = true;
      for (let m = 0; m < labelObj.items.length; m++) {
        labelObj.items[m].opacity = visible ? 1 : 0;
        labelObj.items[m].dirty = true;
      }
      if (visible && this.mdpInstance) {
        this.mdpInstance.canvas.bringToFront(labelObj.rect);
        for (let m = 0; m < labelObj.items.length; m++) {
          this.mdpInstance.canvas.bringToFront(labelObj.items[m]);
        }
      }
    }
    _attachArrowHover(hitBox, index, labelObj, mdpInstance) {
      const self = this;
      hitBox.on("mouseover", () => {
        if (self.edgeDisplay !== "hover") return;
        self._highlightLine(self.stemLine, true);
        for (let k = 0; k < self.arrows.length; k++) {
          self._highlightLine(self.arrows[k], k === index);
        }
        for (let k = 0; k < self.labels.length; k++) {
          self._setLabelVisibility(self.labels[k], k === index);
        }
        mdpInstance.recordQuery(
          "mouseover",
          "edge",
          self.parent.name + "__" + self.children[index].name
        );
        return mdpInstance.canvas.renderAll();
      });
      hitBox.on("mouseout", () => {
        if (self.edgeDisplay !== "hover") return;
        self._resetLine(self.stemLine);
        for (let k = 0; k < self.arrows.length; k++) {
          self._resetLine(self.arrows[k]);
        }
        for (let k = 0; k < self.labels.length; k++) {
          self._setLabelVisibility(self.labels[k], false);
        }
        mdpInstance.recordQuery(
          "mouseout",
          "edge",
          self.parent.name + "__" + self.children[index].name
        );
        return mdpInstance.canvas.renderAll();
      });
      hitBox.on("mousedown", () => {
        if (self.edgeDisplay !== "click") return;
        if (self.clickedIndices.has(index)) {
          self.clickedIndices.delete(index);
          self._setLabelVisibility(labelObj, false);
        } else {
          self.clickedIndices.add(index);
          self._setLabelVisibility(labelObj, true);
          mdpInstance.addScore(-mdpInstance.edgeClickCost);
        }
        mdpInstance.recordQuery(
          "click",
          "edge",
          self.parent.name + "__" + self.children[index].name
        );
        return mdpInstance.canvas.renderAll();
      });
    }
    _highlightLine(line, on) {
      if (!line) return;
      if (line._objects && line._objects[0]) {
        line._savedWidth = line._objects[0].strokeWidth;
        if (on) {
          line._objects[0].set({ strokeWidth: CONFIG.HOVER_EDGE_WIDTH });
          if (line._objects[1]) {
            line._savedHeadSize = line._objects[1].width;
            line._objects[1].set({
              width: CONFIG.ARROW_HEAD_SIZE + 6,
              height: CONFIG.ARROW_HEAD_SIZE + 6
            });
          }
        }
      } else if (line.set) {
        line._savedWidth = line.strokeWidth;
        if (on) {
          line.set({ strokeWidth: CONFIG.HOVER_EDGE_WIDTH });
        }
      }
      line.dirty = true;
    }
    _resetLine(line) {
      if (!line) return;
      if (line._objects && line._objects[0]) {
        line._objects[0].set({
          strokeWidth: line._savedWidth || CONFIG.EDGE_WIDTH
        });
        if (line._objects[1]) {
          line._objects[1].set({
            width: line._savedHeadSize || CONFIG.ARROW_HEAD_SIZE,
            height: line._savedHeadSize || CONFIG.ARROW_HEAD_SIZE
          });
        }
      } else if (line.set) {
        line.set({ strokeWidth: line._savedWidth || CONFIG.STEM_WIDTH });
      }
      line.dirty = true;
    }
  };

  // jspsych-mouselab-mdp/src/core/mouselab-mdp-lifecycle.ts
  MouselabMDP.prototype._handleError = function(method, err) {
    PRINT("MouselabMDP error in " + method + ":", err);
    if (this.keyListener) {
      jsPsych.pluginAPI.cancelKeyboardResponse(this.keyListener);
      this.keyListener = null;
    }
    this.data.error = { method, message: err.message };
    this.display.empty();
    jsPsych.finishTrial(this.data);
  };
  MouselabMDP.prototype.run = function() {
    try {
      LOG_DEBUG("run");
      this.buildMap();
      if (this._cachedPlayerImg && this._cachedPlayerImgUrl === this.playerImage) {
        const img = new fabric.Image(this._cachedPlayerImg, { left: 0, top: 0 });
        this.initPlayer(img);
        this.canvas.renderAll();
        this.initTime = Date.now();
        this.arrive(this.initial);
        return;
      }
      const self = this;
      fabric.Image.fromURL(
        this.playerImage,
        function(img) {
          self._cachedPlayerImg = img.getElement();
          self._cachedPlayerImgUrl = self.playerImage;
          self.initPlayer(img);
          self.canvas.renderAll();
          self.initTime = Date.now();
          self.arrive(self.initial);
        }
      );
    } catch (err) {
      this._handleError("run", err);
    }
  };
  MouselabMDP.prototype.initPlayer = function(img) {
    LOG_DEBUG("initPlayer");
    const top = this.nodes[this.initial].top;
    const left = this.nodes[this.initial].left;
    const scale = this.playerImageScale != null ? this.playerImageScale : CONFIG.PLAYER_SCALE_DEFAULT;
    img.scale(scale);
    img.set("top", top).set("left", left);
    this.draw(img);
    this.player = img;
  };
  MouselabMDP.prototype.buildMap = function() {
    const gridWidth = _.max(_.unzip(_.values(this.layout))[0]) + 1;
    const gridHeight = _.max(_.unzip(_.values(this.layout))[1]) + 1;
    this.canvasElement.attr({
      width: gridWidth * this.SIZE,
      height: gridHeight * this.SIZE
    });
    if (!this.canvas) {
      this.canvas = new fabric.Canvas("mouselab-canvas", {
        selection: false,
        subTargetCheck: true,
        renderOnAddRemove: false
      });
    } else {
      this.canvas.setWidth(gridWidth * this.SIZE);
      this.canvas.setHeight(gridHeight * this.SIZE);
    }
    this.edgeViews = {};
    this.nodes = {};
    for (const s in this.layout) {
      const location = this.layout[s];
      const x = location[0];
      const y = location[1];
      let alwaysLabel = "";
      const rv = this.nodeRewards[s];
      if (this.nodeDisplay === "always" && (rv != null || this.nodeLabels && this.nodeLabels[s] != null)) {
        const parts = [];
        if (this.nodeLabels && this.nodeLabels[s] != null) {
          parts.push(this.nodeLabels[s]);
        }
        if (rv != null) {
          parts.push(String(rv));
        }
        alwaysLabel = parts.join("  ");
      }
      this.nodes[s] = this.draw(
        new Node(s, x, y, {
          fill: "#bbb",
          label: alwaysLabel,
          reward: rv,
          SIZE: this.SIZE,
          mdpInstance: this
        })
      );
    }
    for (const s0 in this.graph) {
      const actions = this.graph[s0];
      const stochActions = {};
      for (const a in actions) {
        if (this.isStochasticEdge(actions[a])) {
          stochActions[a] = actions[a];
        }
      }
      if (Object.keys(stochActions).length > 0) {
        const firstAction = Object.keys(stochActions)[0];
        const firstOutcomes = stochActions[firstAction].outcomes;
        const children = firstOutcomes.map((outcome) => this.nodes[outcome.target]);
        if (this.edgeViews[s0] == null) this.edgeViews[s0] = {};
        const splitEdge = new SplitEdge(this.nodes[s0], children, {
          allActions: stochActions,
          edgeDisplay: this.edgeDisplay,
          SIZE: this.SIZE,
          edgeLabels: this.edgeLabels,
          groupLabels: this.groupLabels,
          actionLabels: this.actionLabels
        });
        splitEdge.attach(this);
        for (const a in stochActions) {
          this.edgeViews[s0][a] = splitEdge;
        }
      }
      for (const a in actions) {
        const edge = actions[a];
        if (!this.isStochasticEdge(edge) && edge.outcomes) {
          const outcome = edge.outcomes[0];
          const reward = outcome.reward;
          const s1 = outcome.target;
          let label = "";
          if (this.edgeDisplay === "always" && this.edgeLabels != null) {
            label = this.getEdgeLabel(s0, a, reward);
          }
          this.draw(
            new Edge(this.nodes[s0], reward, this.nodes[s1], {
              s0,
              actionName: a,
              label,
              SIZE: this.SIZE,
              mdpInstance: this
            })
          );
        }
      }
    }
    for (const s in this.nodes) {
      const node = this.nodes[s];
      if (node.initialLabel) {
        node.setLabel(node.initialLabel);
      }
    }
    this.canvas.renderAll();
  };
  MouselabMDP.prototype.reset = function() {
    if (this.canvas) {
      this.canvas.clear();
    }
    if (this.keyListener) {
      jsPsych.pluginAPI.cancelKeyboardResponse(this.keyListener);
      this.keyListener = null;
    }
    this.edgeViews = {};
    this.nodes = {};
    this.player = null;
    this.complete = false;
    this.initTime = 0;
    this.pendingTrail = null;
  };
  MouselabMDP.prototype._updateMessages = function(c) {
    if (c.leftMessage != null) {
      $("#mouselab-msg-left").html(c.leftMessage);
      this.leftMessage = $("#mouselab-msg-left");
    }
    if (c.centerMessage != null) {
      $("#mouselab-msg-center").html(c.centerMessage);
      this.centerMessage = $("#mouselab-msg-center");
    }
    if (c.rightMessage != null) {
      $("#mouselab-msg-right").html(c.rightMessage);
      this.rightMessage = $("#mouselab-msg-right");
    }
    if (c.lowerMessage != null) {
      $("#mouselab-msg-bottom").html(c.lowerMessage);
      this.lowerMessage = $("#mouselab-msg-bottom");
    }
    this.canvasElement = $("#mouselab-canvas");
  };
  MouselabMDP.prototype.reload = function(config) {
    try {
      this.initConfig(config);
      if ($("#mouselab-canvas").length === 0) {
        this.initDOM(config);
        if (this.canvas) {
          this.canvas.dispose();
          this.canvas = null;
        }
      }
      this._updateMessages(config);
      this.addScore(0);
      this.reset();
      this.run();
    } catch (err) {
      this._handleError("reload", err);
    }
  };
  MouselabMDP.prototype.endTrial = function() {
    try {
      if (this.lowerMessage) {
        this.lowerMessage.html("<b>" + this.completionMessage + "</br>");
      }
      const self = this;
      this.keyListener = jsPsych.pluginAPI.getKeyboardResponse({
        valid_responses: [],
        rt_method: "date",
        persist: false,
        allow_held_key: false,
        callback_function: function(info) {
          self.display.empty();
          jsPsych.finishTrial(self.data);
        }
      });
    } catch (err) {
      this._handleError("endTrial", err);
    }
  };
  MouselabMDP.prototype.checkFinished = function() {
    if (this.complete) {
      this.endTrial();
    }
  };

  // jspsych-mouselab-mdp/src/index.ts
  var instance = null;
  var plugin = {
    trial: function(display_element, trialConfig) {
      trialConfig = jsPsych.pluginAPI.evaluateFunctionParameters(trialConfig, ["scoreFormat"]);
      trialConfig.display = display_element;
      trialConfig.timing_post_trial = 0;
      if (!instance) {
        display_element.empty();
        instance = new MouselabMDP(trialConfig);
        instance.run();
      } else {
        instance.reload(trialConfig);
      }
      if (trialConfig._block) {
        trialConfig._block.trialCount += 1;
      }
      return incrementTrialIndex();
    }
  };
  jsPsych.plugins["mouselab-mdp"] = plugin;
  return __toCommonJS(index_exports);
})();
//# sourceMappingURL=mouselab-mdp.js.map
