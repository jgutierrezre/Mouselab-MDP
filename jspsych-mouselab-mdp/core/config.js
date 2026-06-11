// Configuration: global defaults for MouselabMDP rendering and behavior
//
// Trial definition schema:
//   graph:     { stateName: { actionName: edge } }
//   layout:    { stateName: [x, y] }
//
//   Edge:
//     { "outcomes": [ { "prob": 1, "reward": r, "target": "s1" } ] }        -- deterministic
//     { "outcomes": [ { "prob": 0.75, ... }, { "prob": 0.25, ... } ] }      -- stochastic
//     {}                                                                     -- terminal
//
//   Edge outcomes are always explicit; isStochasticEdge checks outcomes.length > 1.
//
//   Optional trial fields:
//     stateLabels:     { stateName: labelString }   -- shown on click/hover
//     stateDisplay:    "never" | "hover" | "click" | "always"
//     stateClickCost:  number                        -- score penalty per state click
//     edgeLabels:      "reward" | { "0__1": label }  -- what to show for edges
//     edgeDisplay:     "never" | "hover" | "click" | "always"
//     edgeClickCost:   number                        -- score penalty per edge click
//     keys:            { actionName: keyCode }       -- keyboard mapping
//     initial:         string                        -- starting state name
//     playerImage:     string                        -- URL for player avatar
//     playerImageScale: number                       -- avatar scale factor
//     SIZE:            number                        -- pixel size per grid unit
//     ANIMATION_SPEED: number                        -- px per ms multiplier
//     leftMessage:     string | function             -- "Round: 1/3"
//     centerMessage:   string                        -- title / instructions
//     rightMessage:    string | function             -- score display
//     lowerMessage:    string                        -- key hint
//
//   Config-level overrides (defined below):
//     STATE_INTERACTION_MODE:  null | "hover" | "click" | "always" | "never"
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
        ACTION_COLORS: [
            "#2196F3",
            "#F44336",
            "#4CAF50",
            "#FF9800",
        ],
        DEFAULT_EDGE_COLOR: "#888",
        TRAIL_COLOR: "#1565C0",
        TRAIL_WIDTH: 5,
        STEM_COLOR: "#888",
        STEM_WIDTH: 4,

        STATE_INTERACTION_MODE: null,
        EDGE_INTERACTION_MODE: null,
        DEBUG_SHOW_VALUES: false,
    };
})(window.MouselabMDPCtx = window.MouselabMDPCtx || {});
