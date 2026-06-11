// Configuration: global defaults for MouselabMDP rendering and behavior
//
// Trial definition schema:
//   graph:     { nodeName: { actionName: edge } }
//   layout:    { nodeName: [x, y] }
//
//   Edge:
//     { "outcomes": [ { "prob": 1, "reward": r, "target": "n1" } ] }       -- deterministic
//     { "outcomes": [ { "prob": 0.75, ... }, { "prob": 0.25, ... } ] }      -- stochastic
//     {}                                                                     -- terminal
//
//   Optional trial fields:
//     nodeLabels:      { nodeName: labelString }   -- shown on click/hover
//     nodeDisplay:     "never" | "hover" | "click" | "always"
//     nodeClickCost:   number                       -- score penalty per node click
//     nodeRewards:     { nodeName: reward }         -- applied on arrival
//     edgeLabels:      "reward" | { "0__1": label } -- what to show for edges
//     edgeDisplay:     "never" | "hover" | "click" | "always"
//     edgeClickCost:   number                       -- score penalty per edge click
//     keys:            { actionName: keyCode }      -- keyboard mapping
//     initial:         string                       -- starting node name
//     playerImage:     string                       -- URL for player avatar
//
//   Config-level overrides:
//     NODE_INTERACTION_MODE:   null | "hover" | "click" | "always" | "never"
//     EDGE_INTERACTION_MODE:   null | "hover" | "click" | "always" | "never"
//     DEBUG_SHOW_VALUES:       boolean  -- force all labels to "always"
(function (ctx) {
    ctx.CONFIG = {
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
})((window.MouselabMDPCtx = window.MouselabMDPCtx || {}));
