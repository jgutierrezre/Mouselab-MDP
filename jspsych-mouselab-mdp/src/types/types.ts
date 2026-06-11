// Shared type definitions for Mouselab-MDP

export interface Outcome {
  prob: number;
  reward: number;
  target: string;
}

export interface EdgeData {
  outcomes: Outcome[];
}

export interface TransitionInfo {
  reward: number;
  nextState: string;
  probability: number;
  outcomeIndex: number | undefined;
}

export interface TrialConfig {
  graph: Record<string, Record<string, EdgeData>>;
  layout: Record<string, [number, number]>;
  initial: string;
  display: JQuery<HTMLElement>;
  timing_post_trial?: number;
  trialIndex?: number;
  _block?: { trialCount: number };

  nodeLabels?: Record<string, string> | null;
  nodeDisplay?: "never" | "hover" | "click" | "always";
  nodeClickCost?: number;
  nodeRewards?: Record<string, number>;

  edgeLabels?: "reward" | Record<string, string>;
  edgeDisplay?: "never" | "hover" | "click" | "always";
  edgeClickCost?: number;

  keys?: Record<string, number>;
  playerImage?: string;
  playerImageScale?: number;

  leftMessage?: string;
  centerMessage?: string;
  rightMessage?: string;
  lowerMessage?: string;

  SIZE?: number;
  ANIMATION_SPEED?: number;

  groupLabels?: Record<string, string>;
  actionLabels?: Record<string, string>;
}

export interface TrailInfo {
  stemStart: { left: number; top: number };
  branchPoint: { left: number; top: number };
  arrowEnd: { left: number; top: number };
  color: string;
  width: number;
  stemOffset: number;
  stemLen: number;
  arrowLen: number;
  seg0Dist: number;
}

export interface Waypoint {
  left: number;
  top: number;
}

export interface Segment {
  from: Waypoint;
  to: Waypoint;
  dist: number;
  accum: number;
}

export interface PendingTrail {
  edgeView: any; // SplitEdge - forward reference
  outcomeIndex: number;
  actionChar: string;
}

export interface LabelObj {
  rect: fabric.Rect;
  items: fabric.Object[];
}

export interface QueryRecord {
  target: string[];
  time: number[];
}

export interface TrialData {
  trialIndex: number;
  score: number;
  path: string[];
  rt: number[];
  actions: string[];
  actionTimes: number[];
  transitions: {
    state: string;
    action: string;
    reward: number;
    nextState: string;
    probability: number;
  }[];
  queries: {
    click: { node: QueryRecord; edge: QueryRecord };
    mouseover: { node: QueryRecord; edge: QueryRecord };
    mouseout: { node: QueryRecord; edge: QueryRecord };
  };
  error?: { method: string; message: string };
}
