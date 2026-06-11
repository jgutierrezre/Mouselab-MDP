// Config file - central configuration for MouselabMDP rendering and behavior
(function (ctx) {
    ctx.CONFIG = {
        ANIMATION_SPEED: 0.5,    // px per ms multiplier (lower = faster)
        SIZE: 120,               // default state node diameter
        EDGE_WIDTH: 4,           // arrow stroke width
        HOVER_EDGE_WIDTH: 6,     // arrow stroke width on hover
        ARROW_HEAD_SIZE: 10,     // arrowhead triangle size
        BRANCH_LABEL_FONT_SIZE: 12,
        ACTION_Y_OFFSET: 8,      // vertical px between overlapping split-edge action arrows
        ACTION_COLORS: [
            "#2196F3",  // A - blue
            "#F44336",  // B - red
            "#4CAF50",  // C - green
            "#FF9800",  // D - orange
        ],
        DEFAULT_EDGE_COLOR: "#888",
        TRAIL_COLOR: "#1565C0",
        TRAIL_WIDTH: 5,
        STEM_COLOR: "#888",
        STEM_WIDTH: 4,
    };
})(window.MouselabMDPCtx = window.MouselabMDPCtx || {});
