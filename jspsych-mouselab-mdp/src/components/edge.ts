import { Arrow } from "./arrow";
import { Text } from "./text";
import { IMouselabMDP } from "./interfaces";
import { CONFIG } from "../core/config";
import { angle, polarMove, redGreen } from "../core/utils";

export class Edge extends fabric.Group {
  s0: string;
  actionName: string;
  arrow: Arrow;
  label: Text;
  hitBox: fabric.Rect;

  constructor(
    c1: { left: number; top: number; radius: number },
    reward: number,
    c2: { left: number; top: number; radius: number },
    config: {
      s0: string;
      actionName: string;
      spacing?: number;
      adjX?: number;
      adjY?: number;
      rotateLabel?: boolean;
      label?: string;
      SIZE?: number;
      mdpInstance: IMouselabMDP;
    }
  ) {
    const SIZE = config.SIZE || CONFIG.SIZE;
    const mdpInstance = config.mdpInstance;
    const spacing = config.spacing != null ? config.spacing : CONFIG.DEFAULT_EDGE_SPACING;
    const adjX = config.adjX != null ? config.adjX : 0;
    const adjY = config.adjY != null ? config.adjY : 0;
    const rotateLabel = config.rotateLabel != null ? config.rotateLabel : false;
    const initialLabel = config.label != null ? config.label : "";

    const x1 = c1.left + adjX;
    const y1 = c1.top + adjY;
    const x2 = c2.left + adjX;
    const y2 = c2.top + adjY;

    const arrow = new Arrow(
      x1,
      y1,
      x2,
      y2,
      c1.radius + spacing,
      c2.radius + spacing,
      CONFIG.DEFAULT_EDGE_COLOR,
      CONFIG.EDGE_WIDTH
    );
    arrow.set({
      selectable: false,
      evented: false,
    });

    let ang = (arrow.ang + Math.PI / 2) % (Math.PI * 2);
    if (0.5 * Math.PI <= ang && ang <= 1.5 * Math.PI) {
      ang += Math.PI;
    }

    const ref = polarMove(
      x1,
      y1,
      angle(x1, y1, x2, y2),
      SIZE * CONFIG.EDGE_LABEL_OFFSET_RATIO
    );
    const labX = ref[0];
    const labY = ref[1];

    const label = new Text("----------", labX, labY, {
      angle: rotateLabel ? (ang * 180) / Math.PI : 0,
      fill: redGreen(initialLabel),
      fontSize: SIZE * CONFIG.NODE_FONT_SIZE_RATIO,
    });

    const angRad = angle(x1, y1, x2, y2);
    const hitStart = polarMove(x1, y1, angRad, c1.radius + spacing);
    const hitEnd = polarMove(x2, y2, angRad, -(c2.radius + spacing));
    const dx = hitEnd[0] - hitStart[0];
    const dy = hitEnd[1] - hitStart[1];

    const hitBox = new fabric.Rect({
      left: hitStart[0],
      top: hitStart[1],
      width: Math.hypot(dx, dy),
      height: CONFIG.EDGE_WIDTH + 4,
      originX: "left",
      originY: "center",
      angle: (Math.atan2(dy, dx) * 180) / Math.PI,
      fill: "rgba(0,0,0,0)",
      selectable: false,
      evented: true,
    });

    super([arrow, label]);

    this.s0 = config.s0;
    this.actionName = config.actionName;
    this.arrow = arrow;
    this.label = label;
    this.hitBox = hitBox;

    this.objectCaching = false;

    const self = this;
    this.hitBox.on("mousedown", () => {
      return mdpInstance.clickEdge(self, self.s0, self.actionName, reward);
    });
    this.hitBox.on("mouseover", () => {
      if (mdpInstance.edgeDisplay !== "hover") return;
      if (self.arrow && self.arrow._objects && self.arrow._objects[0]) {
        self.arrow._objects[0].set({ strokeWidth: CONFIG.HOVER_EDGE_WIDTH });
        self.arrow.dirty = true;
      }
      return mdpInstance.mouseoverEdge(self, self.s0, self.actionName, reward);
    });
    this.hitBox.on("mouseout", () => {
      if (mdpInstance.edgeDisplay !== "hover") return;
      if (self.arrow && self.arrow._objects && self.arrow._objects[0]) {
        self.arrow._objects[0].set({ strokeWidth: CONFIG.EDGE_WIDTH });
        self.arrow.dirty = true;
      }
      return mdpInstance.mouseoutEdge(self, self.s0, self.actionName, reward);
    });

    (this as any).setLabel(initialLabel);
    mdpInstance.draw(this.hitBox);
  }

  setLabel(txt: string): this {
    if (txt) {
      this.label.setText("" + txt);
      this.label.setFill(redGreen(txt));
    } else {
      this.label.setText("");
    }
    this.dirty = true;
    return this;
  }
}
