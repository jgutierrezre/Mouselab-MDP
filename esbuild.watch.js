const esbuild = require("esbuild");

const rebuildPlugin = {
  name: "rebuild-logger",
  setup(build) {
    build.onEnd((result) => {
      if (result.errors.length) {
        console.error("[watch] Build failed:", result.errors);
      } else {
        console.log("[watch] Rebuilt dist/mouselab-mdp.js");
      }
    });
  },
};

async function watch() {
  const ctx = await esbuild.context({
    entryPoints: ["jspsych-mouselab-mdp/src/index.ts"],
    bundle: true,
    outfile: "jspsych-mouselab-mdp/dist/mouselab-mdp.js",
    format: "iife",
    globalName: "MouselabMDPSetup",
    platform: "browser",
    target: "es2015",
    sourcemap: true,
    external: ["jquery", "fabric", "underscore"],
    banner: { js: "// Mouselab-MDP jsPsych plugin - generated bundle" },
    plugins: [rebuildPlugin],
  });

  await ctx.watch();
  console.log("[watch] Watching jspsych-mouselab-mdp/src/ for changes...");
}

watch().catch(() => process.exit(1));
