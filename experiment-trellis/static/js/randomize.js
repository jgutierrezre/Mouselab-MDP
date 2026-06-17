(function () {
  "use strict";

  var PROB_POOL = [0.65, 0.75, 0.85];
  var FIXED_DEPTH = 3;
  var FIXED_WIDTH = 2;

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function generateStateProbs(depth, width) {
    var allStates = stateList(depth, width);
    var probs = {};
    var actionNames = actionNameList(width);
    for (var si = 0; si < allStates.length; si++) {
      var s = allStates[si];
      probs[s] = {};
      for (var ai = 0; ai < actionNames.length; ai++) {
        var a = actionNames[ai];
        var strength = pickRandom(PROB_POOL);
        var prefChild = Math.random() < 0.5 ? 0 : 1;
        if (prefChild === 0) {
          probs[s][a] = [strength, round2(1 - strength)];
        } else {
          probs[s][a] = [round2(1 - strength), strength];
        }
      }
    }
    return probs;
  }

  function actionNameList(width) {
    var names = [];
    for (var i = 0; i < width; i++) {
      names.push(String.fromCharCode(65 + i));
    }
    return names;
  }

  function stateList(depth, width) {
    var states = ["0"];
    for (var layer = 1; layer <= depth; layer++) {
      for (var idx = 0; idx < width; idx++) {
        states.push(layer + "_" + idx);
      }
    }
    return states;
  }

  function nonTerminalStates(depth, width) {
    var states = [];
    for (var layer = 0; layer < depth; layer++) {
      for (var idx = 0; idx < width; idx++) {
        if (layer === 0) {
          states.push("0");
        } else {
          states.push(layer + "_" + idx);
        }
      }
    }
    return states;
  }

  function terminalStates(depth, width) {
    var states = [];
    for (var idx = 0; idx < width; idx++) {
      states.push(depth + "_" + idx);
    }
    return states;
  }

  function computeOptimalPolicy(probs, depth, width, winningTerminalIndex, winReward, loseReward) {
    var V = {};
    var policy = {};
    var actionNames = actionNameList(width);

    var terminals = terminalStates(depth, width);
    for (var ti = 0; ti < terminals.length; ti++) {
      var t = terminals[ti];
      var tIdx = parseInt(t.split("_")[1], 10);
      V[t] = (tIdx === winningTerminalIndex) ? winReward : loseReward;
    }

    for (var layer = depth - 1; layer >= 0; layer--) {
      var layerStates;
      if (layer === 0) {
        layerStates = ["0"];
      } else {
        layerStates = [];
        for (var idx = 0; idx < width; idx++) {
          layerStates.push(layer + "_" + idx);
        }
      }
      for (var si = 0; si < layerStates.length; si++) {
        var s = layerStates[si];
        var bestValue = -Infinity;
        var bestAction = actionNames[0];

        for (var ai = 0; ai < actionNames.length; ai++) {
          var a = actionNames[ai];
          var stateProbs = probs[s][a];
          var qValue = 0;
          for (var ci = 0; ci < width; ci++) {
            var child = (layer + 1) + "_" + ci;
            qValue += stateProbs[ci] * V[child];
          }
          if (qValue > bestValue) {
            bestValue = qValue;
            bestAction = a;
          }
        }
        V[s] = bestValue;
        policy[s] = bestAction;
      }
    }

    return { policy: policy, values: V };
  }

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function buildKeycodes(width) {
    var kc = {};
    for (var i = 0; i < width; i++) {
      var name = String.fromCharCode(65 + i);
      kc[name] = 65 + i;
    }
    return kc;
  }

  window.generateRandomConfig = function () {
    var depth = FIXED_DEPTH;
    var width = FIXED_WIDTH;
    var probs = generateStateProbs(depth, width);
    var winningTerminalIndex = Math.random() < 0.5 ? 0 : 1;
    var winReward = 1;
    var loseReward = 0;
    var actionNames = actionNameList(width);

    var result = computeOptimalPolicy(probs, depth, width, winningTerminalIndex, winReward, loseReward);

    return {
      trellis_depth: depth,
      trellis_width: width,
      winning_terminal_index: winningTerminalIndex,
      win_reward: winReward,
      lose_reward: loseReward,
      probs: probs,
      action_names: actionNames,
      keycodes: buildKeycodes(width),
      player_image: "images/plane.png",
      player_scale: 0.12,
      node_display: "never",
      edge_display: "never",
      optimal_policy: result.policy
    };
  };
})();
