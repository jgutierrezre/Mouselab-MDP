import { Arrow } from "./arrow";
import { IMouselabMDP } from "./interfaces";
import { CONFIG } from "../core/config";
import { angle, polarMove, SIZE as DEFAULT_SIZE } from "../core/utils";
import { buildArrowLabels, SplitEdgeLabelsContext } from "./split-edge-labels";
import type { EdgeData, LabelObj } from "../types/types";

export class SplitEdge {
  children: any[];
  allActions: Record<string, EdgeData>;
  edgeDisplay: "never" | "hover" | "click" | "always";
  SIZE: number;
  edgeLabels: "reward" | Record<string, string> | null;
  groupLabels: Record<string, string>;
  actionLabels: Record<string, string>;
  actions?: any;
  parent: any;
  branchPoint: { left: number; top: number } | null;
  stemStart: { left: number; top: number } | null;
  stemLine: fabric.Line | null;
  arrows: Arrow[];
  hitBoxes: fabric.Rect[];
  labels: (LabelObj | null)[];
  objects: fabric.Object[];
  objectCaching: boolean;
  mdpInstance: IMouselabMDP | null;
  hoveredIndex: number | null;

  constructor(
    c1: any,
    children: any[],
    config: {
      allActions?: Record<string, EdgeData>;
      edgeDisplay?: "never" | "hover" | "click" | "always";
      SIZE?: number;
      edgeLabels?: "reward" | Record<string, string> | null;
      groupLabels?: Record<string, string>;
      actionLabels?: Record<string, string>;
      actions?: any;
    } = {}
  ) {
    this.children = children;
    this.allActions = config.allActions || {};
    this.edgeDisplay = config.edgeDisplay != null ? config.edgeDisplay : "hover";
    this.SIZE = config.SIZE || DEFAULT_SIZE;
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
  }

  private _labelsContext(): SplitEdgeLabelsContext {
    return {
      edgeDisplay: this.edgeDisplay,
      edgeLabels: this.edgeLabels,
      groupLabels: this.groupLabels,
      actionLabels: this.actionLabels,
      parentName: this.parent.name,
      allActions: this.allActions,
    };
  }

  paintTrail(index: number, color: string, width: number): void {
    if (this.stemLine) {
      this.stemLine.set({ stroke: color, strokeWidth: width });
      this.stemLine.dirty = true;
    }
    if (index < 0 || index >= this.arrows.length) {
      return;
    }
    const arrow = this.arrows[index];
    if (arrow && (arrow as any)._objects && (arrow as any)._objects[0]) {
      (arrow as any)._objects[0].set({ stroke: color, strokeWidth: width });
      if ((arrow as any)._objects[1]) {
        (arrow as any)._objects[1].set({ fill: color });
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

  attach(mdpInstance: IMouselabMDP): this {
    const radiusGap = 8;
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
        strokeLineCap: "round",
      }
    );
    mdpInstance.draw(this.stemLine);

    const arrowPositions: { midX: number; midY: number; childName: string }[] = [];
    for (let i = 0; i < this.children.length; i++) {
      const childState = this.children[i];
      const midX = branchX + 0.55 * (childState.left - branchX);
      const midY = branchY + 0.55 * (childState.top - branchY);

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
        evented: false,
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
        angle: (Math.atan2(dy, dx) * 180) / Math.PI,
        fill: "rgba(0, 0, 0, 0)",
        selectable: false,
        evented: true,
      });
      this.hitBoxes.push(hitBox);
      mdpInstance.draw(hitBox);

      arrowPositions.push({
        midX: midX,
        midY: midY,
        childName: childState.name,
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

  _setLabelVisibility(labelObj: LabelObj | null, visible: boolean): void {
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

  _attachArrowHover(
    hitBox: fabric.Rect,
    index: number,
    labelObj: LabelObj | null,
    mdpInstance: IMouselabMDP
  ): void {
    const self = this;
    hitBox.on("mouseover", () => {
      if (self.edgeDisplay !== "hover") return;
      self._highlightLine(self.stemLine!, true);
      for (let k = 0; k < self.arrows.length; k++) {
        self._highlightLine(self.arrows[k] as any, k === index);
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
      self._resetLine(self.stemLine!);
      for (let k = 0; k < self.arrows.length; k++) {
        self._resetLine(self.arrows[k] as any);
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
      if (self.hoveredIndex != null && self.hoveredIndex !== index) {
        for (let k = 0; k < self.labels.length; k++) {
          if (k === self.hoveredIndex) {
            self._setLabelVisibility(self.labels[k], false);
          }
        }
      }
      const already = self.hoveredIndex === index;
      self.hoveredIndex = already ? null : index;
      for (let k = 0; k < self.labels.length; k++) {
        self._setLabelVisibility(self.labels[k], k === self.hoveredIndex);
      }
      if (!already) {
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

  _highlightLine(line: any, on: boolean): void {
    if (!line) return;
    if (line._objects && line._objects[0]) {
      line._savedWidth = line._objects[0].strokeWidth;
      if (on) {
        line._objects[0].set({ strokeWidth: CONFIG.HOVER_EDGE_WIDTH });
        if (line._objects[1]) {
          line._savedHeadSize = line._objects[1].width;
          line._objects[1].set({
            width: CONFIG.ARROW_HEAD_SIZE + 6,
            height: CONFIG.ARROW_HEAD_SIZE + 6,
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

  _resetLine(line: any): void {
    if (!line) return;
    if (line._objects && line._objects[0]) {
      line._objects[0].set({
        strokeWidth: line._savedWidth || CONFIG.EDGE_WIDTH,
      });
      if (line._objects[1]) {
        line._objects[1].set({
          width: line._savedHeadSize || CONFIG.ARROW_HEAD_SIZE,
          height: line._savedHeadSize || CONFIG.ARROW_HEAD_SIZE,
        });
      }
    } else if (line.set) {
      line.set({ strokeWidth: line._savedWidth || CONFIG.STEM_WIDTH });
    }
    line.dirty = true;
  }
}
