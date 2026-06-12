import { CONFIG } from "../core/config";
import { redGreen } from "../core/utils";
import type { IMouselabMDP } from "./interfaces";
import type { EdgeData, LabelObj } from "../types/types";

interface ArrowLabelItem {
  type: "edge";
  edgeLabel: fabric.Text;
  y: number;
}

interface ArrowLineItem {
  type: "line";
  actionLabel: fabric.Text;
  key: fabric.Text;
  prob: fabric.Text;
  reward?: fabric.Text;
  y: number;
}

type ArrowTextItem = ArrowLabelItem | ArrowLineItem;

function actionColorForName(name: string): string {
  return (
    CONFIG.ACTION_COLORS[name.toUpperCase().charCodeAt(0) - 65] ||
    CONFIG.DEFAULT_EDGE_COLOR
  );
}

export interface SplitEdgeLabelsContext {
  edgeDisplay: "never" | "hover" | "click" | "always";
  edgeLabels: "reward" | Record<string, string> | null;
  groupLabels: Record<string, string>;
  actionLabels: Record<string, string>;
  parentName: string;
  allActions: Record<string, EdgeData>;
}

export function buildArrowLabels(
  ctx: SplitEdgeLabelsContext,
  targetName: string,
  midX: number,
  midY: number,
  mdpInstance: IMouselabMDP,
  edgeIdx: number
): LabelObj | null {
  const fontSize = CONFIG.BRANCH_LABEL_FONT_SIZE;
  const lineHeight = fontSize * 1.3;
  const pad = 6;
  const indent = 10;

  const texts: ArrowTextItem[] = [];
  let maxLabelWidth = 0;
  let labelY = 0;
  let gl: fabric.Text | null = null;

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
      evented: false,
    });
    gl.objectCaching = false;
    maxLabelWidth = gl.width + 14;
    labelY += lineHeight;
  }

  const eid = ctx.parentName + "_" + edgeIdx;
  const showEdgeLabel =
    ctx.edgeLabels && (ctx.edgeLabels as Record<string, string>)[eid];

  if (showEdgeLabel != null) {
    const edgeLabelText = new fabric.Text(showEdgeLabel, {
      fontSize: fontSize,
      fill: "#555",
      fontFamily: "helvetica",
      fontWeight: "bold",
      originX: "left",
      originY: "top",
      selectable: false,
      evented: false,
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
        const actionLabel =
          ctx.actionLabels && ctx.actionLabels[actionEid];

        const keyText = new fabric.Text(actionName, {
          fontSize: fontSize,
          fill: actColor,
          fontFamily: "helvetica",
          fontWeight: "bold",
          originX: "left",
          originY: "top",
          selectable: false,
          evented: false,
        });
        keyText.objectCaching = false;

        const probText = new fabric.Text(prob + "%", {
          fontSize: fontSize,
          fill: "#333",
          fontFamily: "helvetica",
          originX: "left",
          originY: "top",
          selectable: false,
          evented: false,
        });
        probText.objectCaching = false;

        let lineWidth: number;
        if (actionLabel) {
          const actionLabelText = new fabric.Text(actionLabel, {
            fontSize: fontSize,
            fill: "#333",
            fontFamily: "helvetica",
            originX: "left",
            originY: "top",
            selectable: false,
            evented: false,
          });
          actionLabelText.objectCaching = false;
          lineWidth =
            indent + actionLabelText.width + pad + keyText.width + pad + probText.width;

          const actionItem: ArrowLineItem = {
            type: "line",
            actionLabel: actionLabelText,
            key: keyText,
            prob: probText,
            y: labelY,
          };

          if (reward != null) {
            const rewardText = new fabric.Text(String(reward), {
              fontSize: fontSize,
              fill: redGreen(reward),
              fontFamily: "helvetica",
              originX: "left",
              originY: "top",
              selectable: false,
              evented: false,
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

          const keyOnlyItem: ArrowLineItem = {
            type: "line",
            actionLabel: null as any,
            key: keyText,
            prob: probText,
            y: labelY,
          };

          if (reward != null) {
            const rewardText = new fabric.Text(String(reward), {
              fontSize: fontSize,
              fill: redGreen(reward),
              fontFamily: "helvetica",
              originX: "left",
              originY: "top",
              selectable: false,
              evented: false,
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
    top: midY,
  });
  bgRect.objectCaching = false;
  if (ctx.edgeDisplay !== "always") {
    bgRect.opacity = 0;
  }
  mdpInstance.draw(bgRect);

  const result: LabelObj = { rect: bgRect, items: [] };
  let firstLineCenter = midY - (labelY - lineHeight) / 2;

  if (gl) {
    gl.set({
      left: midX - maxLabelWidth / 2 + 7,
      top: firstLineCenter,
      originY: "center",
    } as any);
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
        originY: "center",
      } as any);
      if (ctx.edgeDisplay !== "always") tObj.edgeLabel.opacity = 0;
      mdpInstance.draw(tObj.edgeLabel);
      result.items.push(tObj.edgeLabel);
    } else {
      if (tObj.actionLabel) {
        const ilx = lx + indent;
        tObj.actionLabel.set({
          left: ilx,
          top: ly,
          originY: "center",
        } as any);
        tObj.key.set({
          left: ilx + tObj.actionLabel.width + pad,
          top: ly,
          originY: "center",
        } as any);
        tObj.prob.set({
          left: ilx + tObj.actionLabel.width + pad + tObj.key.width + pad,
          top: ly,
          originY: "center",
        } as any);
        if (tObj.reward) {
          tObj.reward.set({
            left:
              ilx +
              tObj.actionLabel.width +
              pad +
              tObj.key.width +
              pad +
              tObj.prob.width +
              pad,
            top: ly,
            originY: "center",
          } as any);
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
          originY: "center",
        } as any);
        tObj.prob.set({
          left: lx + tObj.key.width + pad + 4,
          top: ly,
          originY: "center",
        } as any);
        if (tObj.reward) {
          tObj.reward.set({
            left:
              lx + tObj.key.width + pad + tObj.prob.width + pad + 4,
            top: ly,
            originY: "center",
          } as any);
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
