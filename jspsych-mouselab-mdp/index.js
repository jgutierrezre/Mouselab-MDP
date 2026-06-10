// Plugin registration - entry point for jsPsych
(function (ctx) {
    var plugin = {
        trial: function (display_element, trialConfig) {
            var trial;
            trialConfig = jsPsych.pluginAPI.evaluateFunctionParameters(trialConfig);
            trialConfig.display = display_element;
            console.log("trialConfig", trialConfig);
            display_element.empty();
            trial = new ctx.MouselabMDP(trialConfig);
            trial.run();
            if (trialConfig._block) {
                trialConfig._block.trialCount += 1;
            }
            return (ctx.TRIAL_INDEX += 1);
        },
    };

    jsPsych.plugins["mouselab-mdp"] = plugin;
})(window.MouselabMDPCtx);
