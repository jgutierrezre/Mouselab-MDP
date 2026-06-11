const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ["jspsych-mouselab-mdp/src/index.ts"],
  bundle: true,
  outfile: "jspsych-mouselab-mdp/dist/mouselab-mdp.js",
  format: "iife",
  globalName: "MouselabMDPSetup",
  platform: "browser",
  target: "es2015",
  sourcemap: true,
  external: [
    "jquery",
    "fabric",
    "underscore",
  ],
  banner: {
    js: "// Mouselab-MDP jsPsych plugin - generated bundle",
  },
}).catch(() => process.exit(1));
