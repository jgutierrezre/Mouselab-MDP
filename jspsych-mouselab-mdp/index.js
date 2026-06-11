// Plugin registration - entry point for jsPsych
(function (ctx) {
    var instance = null;

    var plugin = {
        trial: function (display_element, trialConfig) {
            trialConfig = jsPsych.pluginAPI.evaluateFunctionParameters(trialConfig);
            trialConfig.display = display_element;
            trialConfig.timing_post_trial = 0;
            if (window.MouselabMDPCtx.DEBUG_MODE) {
                console.log("trialConfig", trialConfig);
            }

            if (!instance) {
                display_element.empty();
                instance = new ctx.MouselabMDP(trialConfig);
                instance.run();
            } else {
                instance.reload(trialConfig);
            }

            if (trialConfig._block) {
                trialConfig._block.trialCount += 1;
            }
            return (ctx.TRIAL_INDEX += 1);
        },
    };

    jsPsych.plugins["mouselab-mdp"] = plugin;
})(window.MouselabMDPCtx);
