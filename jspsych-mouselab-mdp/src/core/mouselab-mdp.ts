import { LOG_INFO, KEYS, TRIAL_INDEX, checkObj } from "./utils";
import { CONFIG } from "./config";
import type { TrialConfig, EdgeData, TrialData, PendingTrail } from "../types/types";

export class MouselabMDP {
  display!: JQuery<HTMLElement>;
  leftMessage!: JQuery;
  centerMessage!: JQuery;
  rightMessage!: JQuery;
  lowerMessage!: JQuery;
  canvasElement!: JQuery;
  canvas!: fabric.Canvas;

  graph!: Record<string, Record<string, EdgeData>>;
  layout!: Record<string, [number, number]>;
  initial!: string;
  nodeLabels!: Record<string, string> | null;
  nodeDisplay!: "never" | "hover" | "click" | "always";
  nodeClickCost!: number;
  nodeRewards!: Record<string, number>;
  edgeLabels!: "reward" | Record<string, string> | null;
  edgeDisplay!: "never" | "hover" | "click" | "always";
  edgeClickCost!: number;
  keys!: Record<string, number>;
  invKeys!: Record<string, string>;
  trialIndex!: number;
  playerImage!: string;
  playerImageScale?: number;
  SIZE!: number;
  ANIMATION_SPEED!: number;
  groupLabels!: Record<string, string>;
  actionLabels!: Record<string, string>;
  completionMessage!: string;
  scoreFormat!: ((score: number) => string) | null;

  edgeViews: Record<string, Record<string, any>> = {};
  nodes: Record<string, any> = {};
  player: fabric.Image | null = null;
  data!: TrialData;
  initTime!: number;
  keyListener: KeyboardListener | null = null;
  pendingTrail: PendingTrail | null = null;
  complete: boolean = false;
  _trailStemLine: fabric.Line | null = null;
  _trailBranchLine: fabric.Line | null = null;
  _cachedPlayerImg: HTMLImageElement | null = null;
  _cachedPlayerImgUrl: string | null = null;
  alreadyRecorded: any = { clicknode: [], mouseovernode: [], mouseoutnode: [] };

  constructor(config: TrialConfig) {
    const c = config;
    this.display = c.display;
    this.initConfig(c);
    this.initDOM(c);
    LOG_INFO("new MouselabMDP", this);
  }

  initDOM(c: TrialConfig): void {
    if (c.leftMessage != null) {
      this.leftMessage = $("<div>", {
        id: "mouselab-msg-left",
        class: "mouselab-header",
        html: c.leftMessage,
      } as any).appendTo(this.display);
    }
    if (c.centerMessage != null) {
      this.centerMessage = $("<div>", {
        id: "mouselab-msg-center",
        class: "mouselab-header",
        html: c.centerMessage,
      } as any).appendTo(this.display);
    }
    if (c.rightMessage != null) {
      this.rightMessage = $("<div>", {
        id: "mouselab-msg-right",
        class: "mouselab-header",
        html: c.rightMessage,
      } as any).appendTo(this.display);
    }
    (this as any).addScore(0);
    this.canvasElement = $("<canvas>", { id: "mouselab-canvas" })
      .attr({ width: 500, height: 500 })
      .appendTo(this.display);
    if (c.lowerMessage != null) {
      this.lowerMessage = $("<div>", {
        id: "mouselab-msg-bottom",
        html: c.lowerMessage,
      } as any).appendTo(this.display);
    }
  }

  initConfig(c: TrialConfig): void {
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
    this.ANIMATION_SPEED =
      c.ANIMATION_SPEED != null ? c.ANIMATION_SPEED : CONFIG.ANIMATION_SPEED;
    this.nodeRewards = c.nodeRewards != null ? c.nodeRewards : {};
    this.groupLabels = c.groupLabels != null ? c.groupLabels : {};
    this.actionLabels = c.actionLabels != null ? c.actionLabels : {};
    this.completionMessage = c.completionMessage != null
      ? c.completionMessage
      : "Press any key to continue.";
    this.scoreFormat = c.scoreFormat != null ? c.scoreFormat : null;

    this.invKeys = _.invert(this.keys as any) as unknown as Record<string, string>;
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
          edge: { target: [], time: [] },
        },
        mouseover: {
          node: { target: [], time: [] },
          edge: { target: [], time: [] },
        },
        mouseout: {
          node: { target: [], time: [] },
          edge: { target: [], time: [] },
        },
      },
    };
  }

  draw(obj: fabric.Object): fabric.Object {
    this.canvas.add(obj);
    return obj;
  }
}
