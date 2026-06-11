export interface MouselabConfig {
  ANIMATION_SPEED: number;
  SIZE: number;
  EDGE_WIDTH: number;
  HOVER_EDGE_WIDTH: number;
  ARROW_HEAD_SIZE: number;
  BRANCH_LABEL_FONT_SIZE: number;
  ACTION_COLORS: string[];
  DEFAULT_EDGE_COLOR: string;
  TRAIL_COLOR: string;
  TRAIL_WIDTH: number;
  STEM_COLOR: string;
  STEM_WIDTH: number;
  NODE_INTERACTION_MODE: "hover" | "click" | "always" | "never" | null;
  EDGE_INTERACTION_MODE: "hover" | "click" | "always" | "never" | null;
  DEBUG_SHOW_VALUES: boolean;
}

export const CONFIG: MouselabConfig = {
  ANIMATION_SPEED: 0.5,
  SIZE: 120,
  EDGE_WIDTH: 4,
  HOVER_EDGE_WIDTH: 6,
  ARROW_HEAD_SIZE: 10,
  BRANCH_LABEL_FONT_SIZE: 12,
  ACTION_COLORS: ["#2196F3", "#F44336", "#4CAF50", "#FF9800"],
  DEFAULT_EDGE_COLOR: "#888",
  TRAIL_COLOR: "#1565C0",
  TRAIL_WIDTH: 5,
  STEM_COLOR: "#888",
  STEM_WIDTH: 4,
  NODE_INTERACTION_MODE: null,
  EDGE_INTERACTION_MODE: null,
  DEBUG_SHOW_VALUES: false,
};
