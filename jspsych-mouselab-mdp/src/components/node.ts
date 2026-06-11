import { Text } from "./text";
import { IMouselabMDP } from "./interfaces";
import { redGreen } from "../core/utils";

const DEFAULT_SIZE = 120;

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
    const cellSize = config.SIZE || DEFAULT_SIZE;
    const mdpInstance = config.mdpInstance;
    const rewardVal = config.reward != null ? config.reward : null;

    const px = (left + 0.5) * cellSize;
    const py = (top + 0.5) * cellSize;
    const lineHeight = cellSize / 5;

    const conf: any = {
      left: px,
      top: py,
      fill: "#bbbbbb",
      radius: cellSize / 4,
      label: "",
    };
    _.extend(conf, config);
    const circle = new fabric.Circle(conf);

    const labelBg = new fabric.Rect({
      left: px,
      top: py,
      width: 0,
      height: 0,
      rx: 4,
      ry: 4,
      fill: "white",
      stroke: "#444",
      strokeWidth: 1,
      selectable: false,
      evented: false,
      originX: "center",
      originY: "center",
      opacity: 0,
    });
    labelBg.objectCaching = false;

    const fs = cellSize / 6;
    const label = new Text("", px, py - lineHeight / 2, {
      fontSize: fs,
      fill: "#222",
      fontWeight: "bold",
    });
    const rewardText = new Text("", px, py + lineHeight / 2, {
      fontSize: fs,
      fill: "#888",
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
      const rewardStr = parts[1] || "$" + (r != null ? r : 0);
      this.rewardText.setText(rewardStr);
      this.rewardText.setFill(
        r != null ? redGreen(r) : redGreen(rewardStr)
      );
      this.dirty = true;

      const maxW = Math.max(this.label.width, this.rewardText.width);
      const lineH = this.label.fontSize * 1.3;
      const totalH =
        (this.label.text ? lineH : 0) +
        (this.rewardText.text ? lineH : 0);

      this.labelBg.set({
        width: maxW + 8,
        height: totalH + 4,
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
