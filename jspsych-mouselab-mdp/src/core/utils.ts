export let DEBUG_MODE = false;

export let TRIAL_INDEX = 1;

export function incrementTrialIndex(): number {
  return (TRIAL_INDEX += 1);
}

export const SIZE = 120;

export function PRINT(...args: unknown[]): void {
  if (!DEBUG_MODE) return;
  console.log.apply(console, args);
}

export const LOG_INFO = PRINT;
export const LOG_DEBUG = PRINT;

// Patches applied to fabric.Object when module loads
if (typeof fabric !== "undefined") {
  fabric.Object.prototype.originX = "center" as any;
  fabric.Object.prototype.originY = "center" as any;
  fabric.Object.prototype.selectable = false;
  fabric.Object.prototype.hoverCursor = "plain";
}

export function angle(x1: number, y1: number, x2: number, y2: number): number {
  const x = x2 - x1;
  const y = y2 - y1;
  let ang: number;
  if (x === 0) {
    ang = y === 0 ? 0 : y > 0 ? Math.PI / 2 : (Math.PI * 3) / 2;
  } else if (y === 0) {
    ang = x > 0 ? 0 : Math.PI;
  } else {
    ang =
      x < 0
        ? Math.atan(y / x) + Math.PI
        : y < 0
          ? Math.atan(y / x) + 2 * Math.PI
          : Math.atan(y / x);
  }
  return ang + Math.PI / 2;
}

export function polarMove(
  x: number,
  y: number,
  ang: number,
  dist: number
): [number, number] {
  x += dist * Math.sin(ang);
  y -= dist * Math.cos(ang);
  return [x, y];
}

export function dist(
  o1: { left: number; top: number },
  o2: { left: number; top: number }
): number {
  return Math.sqrt(
    (o1.left - o2.left) ** 2 + (o1.top - o2.top) ** 2
  );
}

export function redGreen(val: number | string): string {
  if (typeof val === "number") {
    if (val > 0) return "#080";
    if (val < 0) return "#b00";
    return "#888";
  }
  const n = parseFloat(String(val));
  if (isNaN(n)) return "#888";
  if (n > 0) return "#080";
  if (n < 0) return "#b00";
  return "#888";
}

export function round(x: number): number {
  return Math.round(x * 100) / 100;
}

export function checkObj<T extends Record<string, unknown>>(
  obj: T,
  keys?: string[]
): T {
  if (!keys) {
    keys = Object.keys(obj) as string[];
  }
  for (const k of keys) {
    if (obj[k] === undefined) {
      console.log("Bad Object: ", obj);
      throw new Error(k + " is undefined");
    }
  }
  return obj;
}

export const KEYS: Record<string, number> = _.mapObject(
  {
    up: "uparrow",
    down: "downarrow",
    right: "rightarrow",
    left: "leftarrow",
  },
  jsPsych.pluginAPI.convertKeyCharacterToKeyCode
);
