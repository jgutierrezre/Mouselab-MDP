import { MouselabMDP } from "./mouselab-mdp";
import { LOG_DEBUG, round, redGreen } from "./utils";
import type { EdgeData } from "../types/types";

interface QueryRecord {
  target: string[];
  time: number[];
}

(MouselabMDP.prototype as any).addScore = function (this: MouselabMDP, v: number): void {
  this.data.score = round(this.data.score + v);
  $("#mouselab-score").html("$" + this.data.score);
  $("#mouselab-score").css("color", redGreen(this.data.score));
};

(MouselabMDP.prototype as any).recordQuery = function (
  this: MouselabMDP, queryType: string, targetType: string, target: string
): void {
  this.canvas.renderAll();
  LOG_DEBUG("recordQuery " + queryType + " " + targetType + " " + target);
  const queryBucket: QueryRecord =
    (this.data.queries as any)[queryType][targetType];
  queryBucket.target.push(target);
  queryBucket.time.push(Date.now() - this.initTime);
};

(MouselabMDP.prototype as any).getEdgeLabel = function (
  this: MouselabMDP, s0: string, actionName: string, r: number | null
): string {
  const eid = s0 + "_" + actionName;
  const edgeLabel =
    (this.edgeLabels && (this.edgeLabels as Record<string, string>)[eid]) || eid;
  const parts: string[] = [edgeLabel, actionName];
  if (r != null) parts.push("$" + r);
  return parts.join("  ");
};

(MouselabMDP.prototype as any).isStochasticEdge = function (
  this: MouselabMDP, edge: EdgeData
): boolean {
  return edge.outcomes && edge.outcomes.length > 1;
};
