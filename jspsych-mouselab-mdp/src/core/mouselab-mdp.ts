import { LOG_INFO, KEYS, KEY_DESCRIPTION, TRIAL_INDEX, checkObj } from "./utils";
import type { TrialConfig, EdgeData, TrialData, PendingTrail } from "../types/types";

const DEFAULT_SIZE = 120;
const DEFAULT_ANIMATION_SPEED = 0.5;

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
    const leftMessage = c.leftMessage != null ? c.leftMessage : "Round: 1/1";
    const centerMessage = c.centerMessage != null ? c.centerMessage : "&nbsp;";
    const rightMessage =
      c.rightMessage != null ? c.rightMessage : 'Score: <span id=mouselab-score/>';
    const lowerMessage = c.lowerMessage != null ? c.lowerMessage : KEY_DESCRIPTION;

    this.leftMessage = $("<div>", {
      id: "mouselab-msg-left",
      class: "mouselab-header",
      html: leftMessage,
    } as any).appendTo(this.display);
    this.centerMessage = $("<div>", {
      id: "mouselab-msg-center",
      class: "mouselab-header",
      html: centerMessage,
    } as any).appendTo(this.display);
    this.rightMessage = $("<div>", {
      id: "mouselab-msg-right",
      class: "mouselab-header",
      html: rightMessage,
    } as any).appendTo(this.display);
    (this as any).addScore(0);
    this.canvasElement = $("<canvas>", { id: "mouselab-canvas" })
      .attr({ width: 500, height: 500 })
      .appendTo(this.display);
    this.lowerMessage = $("<div>", {
      id: "mouselab-msg-bottom",
      html: lowerMessage || "&nbsp",
    } as any).appendTo(this.display);
  }

  initConfig(c: TrialConfig): void {
    this.graph = c.graph;
    this.layout = c.layout;
    this.initial = c.initial;
    this.nodeLabels = c.nodeLabels != null ? c.nodeLabels : null;
    this.nodeDisplay = c.nodeDisplay || "never";
    this.nodeClickCost = c.nodeClickCost != null ? c.nodeClickCost : 0;
    this.edgeLabels = c.edgeLabels != null ? c.edgeLabels : "reward";
    this.edgeDisplay = c.edgeDisplay || "always";
    this.edgeClickCost = c.edgeClickCost != null ? c.edgeClickCost : 0;
    this.keys = c.keys != null ? c.keys : KEYS;
    this.trialIndex = c.trialIndex != null ? c.trialIndex : TRIAL_INDEX;
    this.playerImage = c.playerImage != null ? c.playerImage : "static/images/plane.png";
    this.SIZE = c.SIZE != null ? c.SIZE : DEFAULT_SIZE;
    this.ANIMATION_SPEED =
      c.ANIMATION_SPEED != null ? c.ANIMATION_SPEED : DEFAULT_ANIMATION_SPEED;
    this.nodeRewards = c.nodeRewards != null ? c.nodeRewards : {};
    this.groupLabels = c.groupLabels != null ? c.groupLabels : {};
    this.actionLabels = c.actionLabels != null ? c.actionLabels : {};

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
