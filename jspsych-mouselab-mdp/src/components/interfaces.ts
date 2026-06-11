import type { QueryRecord, LabelObj, PendingTrail, TrialConfig, TrailInfo, Waypoint, Segment, EdgeData, TransitionInfo } from "../types/types";

export interface IMouselabMDP {
  canvas: fabric.Canvas;
  nodeDisplay: "never" | "hover" | "click" | "always";
  edgeDisplay: "never" | "hover" | "click" | "always";
  nodeClickCost: number;
  edgeClickCost: number;
  edgeLabels: "reward" | Record<string, string> | null;
  nodeLabels: Record<string, string> | null;
  nodeRewards: Record<string, number>;
  groupLabels: Record<string, string>;
  actionLabels: Record<string, string>;
  data: any;
  initTime: number;
  nodes: Record<string, any>;
  edgeViews: Record<string, Record<string, any>>;
  player: fabric.Image | null;
  pendingTrail: PendingTrail | null;
  keys: Record<string, number>;
  invKeys: Record<number, string>;
  keyListener: KeyboardListener | null;
  complete: boolean;
  ANIMATION_SPEED: number;
  SIZE: number;
  graph: Record<string, Record<string, EdgeData>>;
  initial: string;
  layout: Record<string, [number, number]>;
  playerImage: string;
  display: JQuery<HTMLElement>;

  draw(obj: fabric.Object): fabric.Object;
  addScore(v: number): void;
  recordQuery(queryType: string, targetType: string, target: string): void;
  getEdgeLabel(s0: string, actionName: string, r: number | null): string;
  isStochasticEdge(edge: EdgeData): boolean;
  clickNode(g: any, s: string): void;
  mouseoverNode(g: any, s: string): void;
  mouseoutNode(g: any, s: string): void;
  clickEdge(g: any, s0: string, actionName: string, r: number): void;
  mouseoverEdge(g: any, s0: string, actionName: string, r: number): void;
  mouseoutEdge(g: any, s0: string, actionName: string, r: number): void;
  handleKey(s0: string, a: string): void;
  sampleTransition(edge: EdgeData): TransitionInfo;
  animateMove(s1g: any, reward: number, via: any, finalState: string): void;
  arrive(s: string): void;
}
