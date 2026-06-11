import { CONFIG } from "../core/config";

export class Text extends fabric.Text {
  constructor(txt: string, left: number, top: number, config?: fabric.TextOptions) {
    const str = String(txt);
    const conf: fabric.TextOptions = {
      left,
      top,
      fontFamily: "helvetica",
      fontSize: 14,
      objectCaching: false,
      ...config,
    };
    super(str, conf);
    this.objectCaching = false;
  }
}
