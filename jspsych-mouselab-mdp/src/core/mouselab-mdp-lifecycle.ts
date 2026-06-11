import { MouselabMDP } from "./mouselab-mdp";
import { PRINT, LOG_DEBUG, KEY_DESCRIPTION } from "./utils";
import { Node } from "../components/node";
import { Edge } from "../components/edge";
import { SplitEdge } from "../components/split-edge";
import type { TrialConfig, EdgeData } from "../types/types";

(MouselabMDP.prototype as any)._handleError = function (this: MouselabMDP, method: string, err: Error): void {
  PRINT("MouselabMDP error in " + method + ":", err);
  if (this.keyListener) {
    jsPsych.pluginAPI.cancelKeyboardResponse(this.keyListener);
    this.keyListener = null;
  }
  this.data.error = { method: method, message: err.message };
  this.display.empty();
  jsPsych.finishTrial(this.data);
};

(MouselabMDP.prototype as any).run = function (this: MouselabMDP): void {
  try {
    LOG_DEBUG("run");
    (this as any).buildMap();
    if (this._cachedPlayerImg && this._cachedPlayerImgUrl === this.playerImage) {
      const img = new fabric.Image(this._cachedPlayerImg, { left: 0, top: 0 });
      (this as any).initPlayer(img);
      this.canvas.renderAll();
      this.initTime = Date.now();
      (this as any).arrive(this.initial);
      return;
    }
    const self = this;
    fabric.Image.fromURL(
      this.playerImage,
      function (img: fabric.Image) {
        self._cachedPlayerImg = img.getElement();
        self._cachedPlayerImgUrl = self.playerImage;
        (self as any).initPlayer(img);
        self.canvas.renderAll();
        self.initTime = Date.now();
        (self as any).arrive(self.initial);
      }
    );
  } catch (err: any) {
    (this as any)._handleError("run", err);
  }
};

(MouselabMDP.prototype as any).initPlayer = function (this: MouselabMDP, img: fabric.Image): void {
  LOG_DEBUG("initPlayer");
  const top = this.nodes[this.initial].top;
  const left = this.nodes[this.initial].left;
  const scale = this.playerImageScale != null ? this.playerImageScale : 0.3;
  img.scale(scale);
  img.set("top", top).set("left", left);
  this.draw(img);
  this.player = img;
};

(MouselabMDP.prototype as any).buildMap = function (this: MouselabMDP): void {
  const gridWidth = _.max(_.unzip(_.values(this.layout))[0]) + 1;
  const gridHeight = _.max(_.unzip(_.values(this.layout))[1]) + 1;
  this.canvasElement.attr({
    width: gridWidth * this.SIZE,
    height: gridHeight * this.SIZE,
  });

  if (!this.canvas) {
    this.canvas = new fabric.Canvas("mouselab-canvas", {
      selection: false,
      subTargetCheck: true,
      renderOnAddRemove: false,
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
    if (this.nodeDisplay === "always") {
      const lp: string[] = [];
      if (this.nodeLabels && this.nodeLabels[s] != null) {
        lp.push(this.nodeLabels[s]);
      }
      lp.push("$" + (rv != null ? rv : 0));
      alwaysLabel = lp.join("  ");
    }
    this.nodes[s] = this.draw(
      new Node(s, x, y, {
        fill: "#bbb",
        label: alwaysLabel,
        reward: rv,
        SIZE: this.SIZE,
        mdpInstance: this as any,
      } as any)
    );
  }

  for (const s0 in this.graph) {
    const actions = this.graph[s0];

    const stochActions: Record<string, EdgeData> = {};
    for (const a in actions) {
      if ((this as any).isStochasticEdge(actions[a])) {
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
        actionLabels: this.actionLabels,
      });
      splitEdge.attach(this as any);
      for (const a in stochActions) {
        this.edgeViews[s0][a] = splitEdge;
      }
    }

    for (const a in actions) {
      const edge = actions[a];
      if (!(this as any).isStochasticEdge(edge) && edge.outcomes) {
        const outcome = edge.outcomes[0];
        const reward = outcome.reward;
        const s1 = outcome.target;
        this.draw(
          new Edge(this.nodes[s0], reward, this.nodes[s1], {
            s0: s0,
            actionName: a,
            label:
              this.edgeDisplay === "always"
                ? (this as any).getEdgeLabel(s0, a, reward)
                : "",
            SIZE: this.SIZE,
            mdpInstance: this as any,
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

(MouselabMDP.prototype as any).reset = function (this: MouselabMDP): void {
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

(MouselabMDP.prototype as any)._updateMessages = function (this: MouselabMDP, c: TrialConfig): void {
  const leftMessage = c.leftMessage != null ? c.leftMessage : "Round: 1/1";
  const centerMessage = c.centerMessage != null ? c.centerMessage : "&nbsp;";
  const rightMessage =
    c.rightMessage != null ? c.rightMessage : 'Score: <span id=mouselab-score/>';
  const lowerMessage = c.lowerMessage != null ? c.lowerMessage : KEY_DESCRIPTION;

  $("#mouselab-msg-left").html(leftMessage);
  $("#mouselab-msg-center").html(centerMessage);
  $("#mouselab-msg-right").html(rightMessage);
  $("#mouselab-msg-bottom").html(lowerMessage);
  this.leftMessage = $("#mouselab-msg-left");
  this.centerMessage = $("#mouselab-msg-center");
  this.rightMessage = $("#mouselab-msg-right");
  this.lowerMessage = $("#mouselab-msg-bottom");
  this.canvasElement = $("#mouselab-canvas");
};

(MouselabMDP.prototype as any).reload = function (this: MouselabMDP, config: TrialConfig): void {
  try {
    this.initConfig(config);
    if ($("#mouselab-canvas").length === 0) {
      this.initDOM(config);
      if (this.canvas) {
        this.canvas.dispose();
        this.canvas = null as any;
      }
    }
    (this as any)._updateMessages(config);
    (this as any).addScore(0);
    (this as any).reset();
    (this as any).run();
  } catch (err: any) {
    (this as any)._handleError("reload", err);
  }
};

(MouselabMDP.prototype as any).endTrial = function (this: MouselabMDP): void {
  try {
    this.lowerMessage.html("<b>Press any key to continue.</br>");
    const self = this;
    this.keyListener = jsPsych.pluginAPI.getKeyboardResponse({
      valid_responses: [],
      rt_method: "date",
      persist: false,
      allow_held_key: false,
      callback_function: function (info: KeyboardResponseInfo) {
        self.display.empty();
        jsPsych.finishTrial(self.data);
      },
    });
  } catch (err: any) {
    (this as any)._handleError("endTrial", err);
  }
};

(MouselabMDP.prototype as any).checkFinished = function (this: MouselabMDP): void {
  if (this.complete) {
    (this as any).endTrial();
  }
};
