import { MouselabMDP } from "./core/mouselab-mdp";
import "./core/mouselab-mdp-display";
import "./core/mouselab-mdp-scoring";
import "./core/mouselab-mdp-navigation";
import "./core/mouselab-mdp-lifecycle";
import { incrementTrialIndex } from "./core/utils";
import type { TrialConfig } from "./types/types";

let instance: MouselabMDP | null = null;

const plugin = {
  trial: function (display_element: JQuery<HTMLElement>, trialConfig: TrialConfig): number {
    trialConfig = jsPsych.pluginAPI.evaluateFunctionParameters(trialConfig) as TrialConfig;
    trialConfig.display = display_element;
    (trialConfig as any).timing_post_trial = 0;

    if (!instance) {
      display_element.empty();
      instance = new MouselabMDP(trialConfig);
      (instance as any).run();
    } else {
      (instance as any).reload(trialConfig);
    }

    if (trialConfig._block) {
      trialConfig._block.trialCount += 1;
    }
    return incrementTrialIndex();
  },
};

jsPsych.plugins["mouselab-mdp"] = plugin;
