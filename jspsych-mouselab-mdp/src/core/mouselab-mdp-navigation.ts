import { MouselabMDP } from "./mouselab-mdp";
import { PRINT, LOG_DEBUG, angle, polarMove, dist } from "./utils";
import type { EdgeData, TransitionInfo, TrailInfo, Waypoint, Segment } from "../types/types";

const CONFIG = {
  ACTION_COLORS: ["#2196F3", "#F44336", "#4CAF50", "#FF9800"],
  TRAIL_COLOR: "#1565C0",
  TRAIL_WIDTH: 5,
};

(MouselabMDP.prototype as any).handleKey = function (this: MouselabMDP, s0: string, a: string): void {
  try {
    LOG_DEBUG("handleKey", s0, a);
    this.data.actions.push(a);
    this.data.actionTimes.push(Date.now() - this.initTime);
    const edgeData = this.graph[s0] && this.graph[s0][a];
    if (!edgeData) return;
    const transition = (this as any).sampleTransition(edgeData) as TransitionInfo;
    const reward = transition.reward;
    const s1 = transition.nextState;

    const edgeView =
      this.edgeViews != null
        ? this.edgeViews[s0] != null
          ? this.edgeViews[s0][a]
          : undefined
        : undefined;

    this.data.transitions.push({
      state: s0,
      action: a,
      reward: reward,
      nextState: s1,
      probability: transition.probability,
    });

    if (edgeView != null && transition.outcomeIndex != null) {
      this.pendingTrail = {
        edgeView: edgeView,
        outcomeIndex: transition.outcomeIndex,
        actionChar: a.toUpperCase(),
      };
    }
    if (this.player) {
      this.canvas.bringToFront(this.player);
    }
    LOG_DEBUG(s0 + ", " + a + " -> " + reward + ", " + s1);
    const s1g = this.nodes[s1];
    (this as any).animateMove(
      s1g,
      reward,
      edgeView != null ? edgeView.branchPoint : undefined,
      s1
    );
  } catch (err: any) {
    (this as any)._handleError("handleKey", err);
  }
};

(MouselabMDP.prototype as any).sampleTransition = function (
  this: MouselabMDP, edge: EdgeData
): TransitionInfo {
  const outcomes = edge.outcomes;
  if (outcomes.length === 1) {
    return {
      reward: outcomes[0].reward,
      nextState: outcomes[0].target,
      probability: 1,
      outcomeIndex: undefined,
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
        outcomeIndex: i,
      };
    }
  }
  const last = outcomes[outcomes.length - 1];
  return {
    reward: last.reward,
    nextState: last.target,
    probability: last.prob,
    outcomeIndex: outcomes.length - 1,
  };
};

(MouselabMDP.prototype as any).animateMove = function (
  this: MouselabMDP,
  s1g: any,
  reward: number,
  via: { left: number; top: number } | undefined,
  finalState: string
): void {
  if (!this.player) {
    PRINT("animateMove called without initialized player");
    (this as any).arrive(finalState);
    return;
  }

  const waypoints: Waypoint[] = [{ left: this.player.left, top: this.player.top }];
  if (via != null) {
    waypoints.push(via);
  }
  waypoints.push({ left: s1g.left, top: s1g.top });

  const segments: Segment[] = [];
  let totalDist = 0;
  for (let i = 1; i < waypoints.length; i++) {
    const d = dist(waypoints[i - 1], waypoints[i]);
    segments.push({
      from: waypoints[i - 1],
      to: waypoints[i],
      dist: d,
      accum: totalDist,
    });
    totalDist += d;
  }

  let trailInfo: TrailInfo | null = null;
  const pendingTrail = this.pendingTrail;
  if (pendingTrail && waypoints.length >= 3) {
    const edgeView = pendingTrail.edgeView;
    const childNode = edgeView.children[pendingTrail.outcomeIndex];
    const nodeGap =
      edgeView.stemStart.left - edgeView.parent.left - edgeView.parent.radius;
    const ang = angle(
      edgeView.branchPoint.left,
      edgeView.branchPoint.top,
      childNode.left,
      childNode.top
    );
    const ae = polarMove(
      childNode.left,
      childNode.top,
      ang,
      -(childNode.radius + nodeGap + 7.5)
    );
    const arrowEnd = { left: ae[0], top: ae[1] };
    const seg0dx = waypoints[1].left - waypoints[0].left;
    const seg0dy = waypoints[1].top - waypoints[0].top;
    const seg0Len = segments[0].dist;
    const stemProj =
      ((edgeView.stemStart.left - waypoints[0].left) * seg0dx +
        (edgeView.stemStart.top - waypoints[0].top) * seg0dy) /
      seg0Len;
    const stemOffset = Math.max(0, Math.min(seg0Len, stemProj));
    const seg1dx = waypoints[2].left - waypoints[1].left;
    const seg1dy = waypoints[2].top - waypoints[1].top;
    const seg1Len = segments[1].dist;
    const arrowProj =
      ((arrowEnd.left - waypoints[1].left) * seg1dx +
        (arrowEnd.top - waypoints[1].top) * seg1dy) /
      seg1Len;
    const arrowLen = Math.max(0, Math.min(seg1Len, arrowProj));
    const color =
      CONFIG.ACTION_COLORS[pendingTrail.actionChar.charCodeAt(0) - 65] ||
      CONFIG.TRAIL_COLOR;
    trailInfo = {
      stemStart: edgeView.stemStart,
      branchPoint: edgeView.branchPoint,
      arrowEnd: arrowEnd,
      color: color,
      width: CONFIG.TRAIL_WIDTH,
      stemOffset: stemOffset,
      stemLen: seg0Len - stemOffset,
      arrowLen: arrowLen,
      seg0Dist: seg0Len,
    };
  }

  const duration = totalDist * this.ANIMATION_SPEED;
  const self = this;
  fabric.util.animate({
    startValue: 0,
    endValue: totalDist,
    duration: duration,
    onChange: function (traveled: number) {
      let k: number;
      for (k = segments.length - 1; k >= 0; k--) {
        if (traveled >= segments[k].accum) break;
      }
      const seg = segments[k];
      const segT = Math.min((traveled - seg.accum) / seg.dist, 1);
      const pos = {
        left: seg.from.left + (seg.to.left - seg.from.left) * segT,
        top: seg.from.top + (seg.to.top - seg.from.top) * segT,
      };
      self.player!.set(pos);

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
            left:
              trailInfo.stemStart.left +
              (trailInfo.branchPoint.left - trailInfo.stemStart.left) * stemT,
            top:
              trailInfo.stemStart.top +
              (trailInfo.branchPoint.top - trailInfo.stemStart.top) * stemT,
          };
          const lineOpts = {
            stroke: trailInfo.color,
            strokeWidth: trailInfo.width,
            selectable: false,
            evented: false,
            strokeLineCap: "round" as CanvasLineCap,
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
              y2: stemEnd.top,
            } as any);
            self._trailStemLine.setCoords();
          }
        }
        if (branchRevealed > 0) {
          const branchT = branchRevealed / trailInfo.arrowLen;
          const branchEnd = {
            left:
              trailInfo.branchPoint.left +
              (trailInfo.arrowEnd.left - trailInfo.branchPoint.left) * branchT,
            top:
              trailInfo.branchPoint.top +
              (trailInfo.arrowEnd.top - trailInfo.branchPoint.top) * branchT,
          };
          if (!self._trailBranchLine) {
            self._trailBranchLine = new fabric.Line(
              [trailInfo.branchPoint.left, trailInfo.branchPoint.top, branchEnd.left, branchEnd.top],
              {
                stroke: trailInfo.color,
                strokeWidth: trailInfo.width,
                selectable: false,
                evented: false,
                strokeLineCap: "round",
              }
            );
            self.canvas.add(self._trailBranchLine);
          } else {
            self._trailBranchLine.set({
              x1: trailInfo.branchPoint.left,
              y1: trailInfo.branchPoint.top,
              x2: branchEnd.left,
              y2: branchEnd.top,
            } as any);
            self._trailBranchLine.setCoords();
          }
        }
        self.canvas.bringToFront(self.player!);
      }
      self.canvas.renderAll();
    },
    onComplete: function () {
      if (self._trailStemLine) {
        self.canvas.remove(self._trailStemLine);
        self._trailStemLine = null;
      }
      if (self._trailBranchLine) {
        self.canvas.remove(self._trailBranchLine);
        self._trailBranchLine = null;
      }
      (self as any).addScore(reward);
      (self as any).arrive(finalState);
    },
  });
};

(MouselabMDP.prototype as any).arrive = function (this: MouselabMDP, s: string): void {
  LOG_DEBUG("arrive", s);
  const ACTION_COLORS = ["#2196F3", "#F44336", "#4CAF50", "#FF9800"];
  const TRAIL_COLOR = "#1565C0";
  const TRAIL_WIDTH = 5;

  if (this.pendingTrail) {
    const trailColor =
      ACTION_COLORS[this.pendingTrail.actionChar.charCodeAt(0) - 65] || TRAIL_COLOR;
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
  if (nodeReward != null) (this as any).addScore(nodeReward);

  let keys: number[];
  if (this.graph[s]) {
    keys = Object.keys(this.graph[s]).map((a) => this.keys[a]);
  } else {
    keys = [];
  }

  if (!keys.length) {
    this.complete = true;
    (this as any).checkFinished();
    return;
  }

  const self = this;
  this.keyListener = jsPsych.pluginAPI.getKeyboardResponse({
    valid_responses: keys,
    rt_method: "date",
    persist: false,
    allow_held_key: false,
    callback_function: function (info: KeyboardResponseInfo) {
      const action = self.invKeys[String(info.key)];
      LOG_DEBUG("key", info.key);
      self.data.rt.push(info.rt);
      (self as any).handleKey(s, action);
    },
  });
};
