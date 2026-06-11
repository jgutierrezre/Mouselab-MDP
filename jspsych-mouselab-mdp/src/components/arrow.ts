import { CONFIG } from "../core/config";
import { angle, polarMove } from "../core/utils";

export class Arrow extends fabric.Group {
  ang: number;
  centerX: number;
  centerY: number;

  constructor(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    adj1: number = 0,
    adj2: number = 0,
    color: string = CONFIG.DEFAULT_EDGE_COLOR,
    width: number = CONFIG.EDGE_WIDTH
  ) {
    const ang = angle(x1, y1, x2, y2);
    const ref = polarMove(x1, y1, ang, adj1);
    x1 = ref[0];
    y1 = ref[1];
    const ref1 = polarMove(x2, y2, ang, -(adj2 + 7.5));
    x2 = ref1[0];
    y2 = ref1[1];

    const line = new fabric.Line([x1, y1, x2, y2], {
      stroke: color,
      selectable: false,
      strokeWidth: width,
    });

    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const deltaX = line.left - centerX;
    const deltaY = line.top - centerY;

    const point = new fabric.Triangle({
      left: x2 + deltaX,
      top: y2 + deltaY,
      pointType: "arrow_start",
      angle: (ang * 180) / Math.PI,
      width: CONFIG.ARROW_HEAD_SIZE,
      height: CONFIG.ARROW_HEAD_SIZE,
      fill: color,
    });

    super([line, point]);

    this.ang = ang;
    this.centerX = centerX;
    this.centerY = centerY;
  }
}
