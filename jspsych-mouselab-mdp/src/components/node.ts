import { Text } from "./text";
import { IMouselabMDP } from "./interfaces";
import { redGreen } from "../core/utils";
import { CONFIG } from "../core/config";

export class Node extends fabric.Group {
  name: string;
  mdpInstance: IMouselabMDP;
  reward: number | null;
  circle: fabric.Circle;
  labelBg: fabric.Rect;
  label: Text;
  rewardText: Text;
  radius: number;

  constructor(
    name: string,
    left: number,
    top: number,
    config: {
      fill?: string;
      label?: string;
      reward?: number | null;
      SIZE?: number;
      mdpInstance: IMouselabMDP;
    }
  ) {
    const cellSize = config.SIZE || CONFIG.SIZE;
    const mdpInstance = config.mdpInstance;
    const rewardVal = config.reward != null ? config.reward : null;

    const px = (left + 0.5) * cellSize;
    const py = (top + 0.5) * cellSize;
    const lineHeight = cellSize * CONFIG.NODE_LINE_HEIGHT_RATIO;

    const conf: any = {
      left: px,
      top: py,
      fill: CONFIG.NODE_DEFAULT_FILL,
      radius: cellSize * CONFIG.NODE_RADIUS_RATIO,
      label: "",
    };
    _.extend(conf, config);
    const circle = new fabric.Circle(conf);

    const labelBg = new fabric.Rect({
      left: px,
      top: py,
      width: 0,
      height: 0,
      rx: CONFIG.NODE_LABEL_BG_RADIUS,
      ry: CONFIG.NODE_LABEL_BG_RADIUS,
      fill: "white",
      stroke: CONFIG.NODE_LABEL_BG_STROKE,
      strokeWidth: 1,
      selectable: false,
      evented: false,
      originX: "center",
      originY: "center",
      opacity: 0,
    });
    labelBg.objectCaching = false;

    const fs = cellSize * CONFIG.NODE_FONT_SIZE_RATIO;
    const label = new Text("", px, py - lineHeight / 2, {
      fontSize: fs,
      fill: CONFIG.NODE_LABEL_TEXT_FILL,
      fontWeight: "bold",
    });
    const rewardText = new Text("", px, py + lineHeight / 2, {
      fontSize: fs,
      fill: CONFIG.NODE_REWARD_TEXT_FILL,
    });

    const radius = circle.radius;

    super([circle, labelBg, label, rewardText]);

    this.name = name;
    this.mdpInstance = mdpInstance;
    this.reward = rewardVal;
    this.circle = circle;
    this.labelBg = labelBg;
    this.label = label;
    this.rewardText = rewardText;
    this.radius = radius;

    this.objectCaching = false;
    this.perPixelTargetFind = true;

    this.on("mousedown", () => {
      if (mdpInstance.nodeDisplay !== "click") return;
      return mdpInstance.clickNode(this, this.name);
    });
    this.on("mouseover", () => {
      if (mdpInstance.nodeDisplay !== "hover") return;
      return mdpInstance.mouseoverNode(this, this.name);
    });
    this.on("mouseout", () => {
      if (mdpInstance.nodeDisplay !== "hover") return;
      return mdpInstance.mouseoutNode(this, this.name);
    });

    (this as any).setLabel(conf.label);
  }

  setLabel(txt: string, reward?: number | null): this {
    const r = reward != null ? reward : this.reward;
    if (txt) {
      const parts = txt.split("  ");
      this.label.setText(parts[0] || "");
      const rewardStr = parts[1] || (r != null ? String(r) : "");
      this.rewardText.setText(rewardStr);
      this.rewardText.setFill(
        r != null ? redGreen(r) : "#888"
      );
      this.dirty = true;

      const maxW = Math.max(this.label.width, this.rewardText.width);
      const lineH = this.label.fontSize * 1.3;
      const totalH =
        (this.label.text ? lineH : 0) +
        (this.rewardText.text ? lineH : 0);

      this.labelBg.set({
        width: maxW + CONFIG.NODE_LABEL_PADDING_X,
        height: totalH + CONFIG.NODE_LABEL_PADDING_Y,
      });
      this.labelBg.opacity = 1;
      this.labelBg.dirty = true;
      this.mdpInstance.canvas.bringToFront(this);
    } else {
      this.label.setText("");
      this.rewardText.setText("");
      this.labelBg.opacity = 0;
      this.labelBg.dirty = true;
      this.dirty = true;
    }
    return this;
  }
}
