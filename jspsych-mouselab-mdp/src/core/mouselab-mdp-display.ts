import { MouselabMDP } from "./mouselab-mdp";
import { LOG_DEBUG } from "./utils";

(MouselabMDP.prototype as any).clickNode = function (this: MouselabMDP, g: any, s: string): void {
  LOG_DEBUG("clickNode " + s);
  if (this.nodeDisplay === "click" && !g.label.text) {
    (this as any).addScore(-this.nodeClickCost);
    const parts: string[] = [];
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
    (this as any).recordQuery("click", "node", s);
  }
};

(MouselabMDP.prototype as any).mouseoverNode = function (this: MouselabMDP, g: any, s: string): void {
  LOG_DEBUG("mouseoverNode " + s);
  if (this.nodeDisplay === "hover") {
    const parts: string[] = [];
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
  (this as any).recordQuery("mouseover", "node", s);
};

(MouselabMDP.prototype as any).mouseoutNode = function (this: MouselabMDP, g: any, s: string): void {
  LOG_DEBUG("mouseoutNode " + s);
  if (this.nodeDisplay === "hover") {
    g.setLabel("");
    if (this.player) this.canvas.bringToFront(this.player);
  }
  (this as any).recordQuery("mouseout", "node", s);
};

(MouselabMDP.prototype as any).clickEdge = function (
  this: MouselabMDP, g: any, s0: string, actionName: string, r: number
): void {
  LOG_DEBUG("clickEdge " + s0 + " " + actionName + " " + r);
  if (this.edgeDisplay === "click" && !g.label.text) {
    (this as any).addScore(-this.edgeClickCost);
    g.setLabel((this as any).getEdgeLabel(s0, actionName, r));
    (this as any).recordQuery("click", "edge", s0 + "__" + actionName);
  }
};

(MouselabMDP.prototype as any).mouseoverEdge = function (
  this: MouselabMDP, g: any, s0: string, actionName: string, r: number
): void {
  LOG_DEBUG("mouseoverEdge " + s0 + " " + actionName + " " + r);
  if (this.edgeDisplay === "hover") {
    g.setLabel((this as any).getEdgeLabel(s0, actionName, r));
  }
  (this as any).recordQuery("mouseover", "edge", s0 + "__" + actionName);
};

(MouselabMDP.prototype as any).mouseoutEdge = function (
  this: MouselabMDP, g: any, s0: string, actionName: string, r: number
): void {
  LOG_DEBUG("mouseoutEdge " + s0 + " " + actionName + " " + r);
  if (this.edgeDisplay === "hover") {
    g.setLabel("");
  }
  (this as any).recordQuery("mouseout", "edge", s0 + "__" + actionName);
};
