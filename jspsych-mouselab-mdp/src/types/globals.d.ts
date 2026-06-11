// Ambient type declarations for global browser dependencies.
// These libraries are loaded via <script> tags and exposed as globals.

// ---- Underscore.js ----------------------------------------------------------
interface UnderscoreStatic {
  extend(destination: any, ...sources: any[]): any;
  pick<T extends object, K extends keyof T>(object: T, ...keys: K[]): Pick<T, K>;
  invert<K extends string, V extends string>(obj: Record<K, V>): Record<V, K>;
  mapObject<T extends object, V>(
    obj: T,
    iteratee: (value: T[keyof T], key: keyof T & string) => V
  ): Record<keyof T & string, V>;
  values<T>(obj: Record<string, T>): T[];
  unzip<T>(arrays: T[][]): T[][];
  max(list: number[]): number;
  keys(obj: object): string[];
}
declare const _: UnderscoreStatic;

// ---- jQuery -----------------------------------------------------------------
interface JQuery<TElement = HTMLElement> {
  html(htmlString: string): JQuery<TElement>;
  empty(): JQuery<TElement>;
  appendTo(target: JQuery | HTMLElement | string): JQuery<TElement>;
  attr(attributes: Record<string, number | string>): JQuery<TElement>;
  css(propertyName: string, value: string): JQuery<TElement>;
  length: number;
}
interface JQueryStatic {
  <TElement extends HTMLElement = HTMLElement>(
    selector: string | HTMLElement,
    context?: any
  ): JQuery<TElement>;
  (element: HTMLElement): JQuery;
  (html: string, attributes?: Record<string, string>): JQuery;
  (readyFn: () => void): void;
}
declare const $: JQueryStatic;

// ---- Fabric.js --------------------------------------------------------------
declare namespace fabric {
  class Object {
    static prototype: Object;
    originX: string;
    originY: string;
    selectable: boolean;
    hoverCursor: string;
    objectCaching: boolean;
    perPixelTargetFind: boolean;
    dirty: boolean;
    left: number;
    top: number;
    width: number;
    height: number;
    opacity: number;
    on(eventName: string, handler: (...args: any[]) => void): void;
    set(options: any): Object;
    set(key: string, value: any): Object;
    setCoords(): void;
    bringToFront(): Object;
    scale(val: number): Object;
  }

  class Canvas {
    constructor(element: string | HTMLCanvasElement, options?: CanvasOptions);
    add(...objects: Object[]): Canvas;
    remove(...objects: Object[]): Canvas;
    clear(): Canvas;
    renderAll(): Canvas;
    bringToFront(object: Object): Canvas;
    setWidth(width: number): void;
    setHeight(height: number): void;
    dispose(): void;
    width: number;
    height: number;
  }

  interface CanvasOptions {
    selection?: boolean;
    subTargetCheck?: boolean;
    renderOnAddRemove?: boolean;
  }

  class Group extends Object {
    constructor(objects?: Object[], options?: any);
    _objects: Object[];
    addWithUpdate(obj: Object): Group;
    removeWithUpdate(obj: Object): Group;
  }

  class Circle extends Object {
    constructor(options?: CircleOptions);
    radius: number;
  }

  interface CircleOptions {
    left?: number;
    top?: number;
    fill?: string;
    radius?: number;
    label?: string;
    originX?: string;
    originY?: string;
  }

  class Line extends Object {
    constructor(points: number[], options?: LineOptions);
    set(points: any): Line;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    strokeWidth: number;
    stroke: string;
  }

  interface LineOptions {
    stroke?: string;
    selectable?: boolean;
    strokeWidth?: number;
    evented?: boolean;
    strokeLineCap?: string;
  }

  class Rect extends Object {
    constructor(options?: RectOptions);
  }

  interface RectOptions {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    rx?: number;
    ry?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    selectable?: boolean;
    evented?: boolean;
    originX?: string;
    originY?: string;
    opacity?: number;
    angle?: number;
  }

  class Triangle extends Object {
    constructor(options?: TriangleOptions);
    width: number;
    height: number;
  }

  interface TriangleOptions {
    left?: number;
    top?: number;
    pointType?: string;
    angle?: number;
    width?: number;
    height?: number;
    fill?: string;
  }

  class Text extends Object {
    constructor(text: string, options?: TextOptions);
    setText(text: string): Text;
    setFill(fill: string): Text;
    text: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    fill: string;
  }

  interface TextOptions {
    left?: number;
    top?: number;
    fontSize?: number;
    fill?: string;
    fontWeight?: string;
    fontFamily?: string;
    angle?: number;
    originX?: string;
    originY?: string;
    selectable?: boolean;
    evented?: boolean;
    objectCaching?: boolean;
  }

  class Image extends Object {
    constructor(element: HTMLImageElement, options?: ImageOptions);
    scale(val: number): Image;
    getElement(): HTMLImageElement;
  }

  interface ImageOptions {
    left?: number;
    top?: number;
  }

  namespace Image {
    function fromURL(
      url: string,
      callback: (img: Image) => void,
      options?: any
    ): void;
  }

  namespace util {
    function animate(options: AnimateOptions): void;
  }

  interface AnimateOptions {
    startValue: number;
    endValue: number;
    duration: number;
    onChange: (value: number) => void;
    onComplete: () => void;
  }
}

// ---- jsPsych ----------------------------------------------------------------
interface JsPsychPluginAPI {
  evaluateFunctionParameters(obj: any): any;
  convertKeyCharacterToKeyCode(char: string): number;
  getKeyboardResponse(options: KeyboardResponseOptions): KeyboardListener;
  cancelKeyboardResponse(listener: KeyboardListener): void;
}

interface KeyboardResponseOptions {
  valid_responses: number[];
  rt_method: string;
  persist: boolean;
  allow_held_key: boolean;
  callback_function: (info: KeyboardResponseInfo) => void;
}

interface KeyboardResponseInfo {
  key: number;
  rt: number;
}

type KeyboardListener = object;

interface JsPsychStatic {
  plugins: Record<string, any>;
  pluginAPI: JsPsychPluginAPI;
  finishTrial(data: any): void;
}

declare const jsPsych: JsPsychStatic;
