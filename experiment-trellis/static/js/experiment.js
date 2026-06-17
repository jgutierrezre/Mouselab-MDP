(function () {
  "use strict";

  function showError(msg) {
    var c = $("#experiment-container");
    c.html('<div style="color:red;padding:20px;"><h2>Error</h2><pre>' + msg + '</pre></div>');
    console.error(msg);
  }

  try {

  var $container = $("#experiment-container");
  var config = window.TRELLIS_CONFIG;
  var allTrialData = [];
  var trialCount = 0;
  var experimentStartTime;
  var mdpInstance = null;
  var restartTimer = null;
  var lockedIn = false;

  if (!config) {
    throw new Error('TRELLIS_CONFIG not generated. Check randomize.js and config.js.');
  }
  if (typeof MouselabMDPSetup === 'undefined' || !MouselabMDPSetup.MouselabMDP) {
    throw new Error('MouselabMDPSetup.MouselabMDP not available. Check dist/mouselab-mdp.js is loaded.');
  }

  function graphStates(depth, width) {
    var states = ["0"];
    for (var layer = 1; layer <= depth; layer++) {
      for (var idx = 0; idx < width; idx++) {
        states.push(layer + "_" + idx);
      }
    }
    return states;
  }

  function buildTrellisConfig() {
    var depth = config.trellis_depth;
    var width = config.trellis_width;
    var probs = config.probs;
    var actionNames = config.action_names;
    var winIdx = config.winning_terminal_index;
    var winReward = config.win_reward;
    var loseReward = config.lose_reward;

    var graph = {};
    var layout = {};
    var nodeLabels = {};
    var nodeRewards = {};
    var groupLabels = {};
    var edgeLabels = {};
    var actionLabels = {};
    var labelCounter = 0;

    graph["0"] = {};
    layout["0"] = [0, 1.5];
    nodeLabels["0"] = "node_" + (labelCounter++);
    nodeRewards["0"] = 0;

    for (var layer = 1; layer <= depth; layer++) {
      for (var idx = 0; idx < width; idx++) {
        var name = layer + "_" + idx;
        graph[name] = {};
        layout[name] = [layer * 1.5, idx * 3.0];
        nodeLabels[name] = "node_" + (labelCounter++);
        nodeRewards[name] = (layer === depth && idx === winIdx) ? winReward : (layer === depth ? loseReward : 0);
      }
    }

    var allStates = graphStates(depth, width);
    for (var si = 0; si < allStates.length; si++) {
      var src = allStates[si];
      var parts = src.split("_");
      var layer = parseInt(parts[0], 10);
      if (isNaN(layer)) layer = 0;
      if (layer === depth) continue;

      var stateProbs = probs[src];
      var children = [];
      for (var c = 0; c < width; c++) {
        children.push((layer + 1) + "_" + c);
      }

      for (var ai = 0; ai < actionNames.length; ai++) {
        var a = actionNames[ai];
        var outcomes = [];
        for (var ci = 0; ci < width; ci++) {
          var prob = stateProbs[a][ci];
          var reward = 0;
          var target = children[ci];
          if (layer + 1 === depth) {
            var tIdx = parseInt(target.split("_")[1], 10);
            reward = (tIdx === winIdx) ? winReward : loseReward;
          }
          outcomes.push({ prob: prob, reward: reward, target: target });
        }
        graph[src][a] = { outcomes: outcomes };
      }
    }

    var groupIdx = 0;
    for (var s in graph) {
      var actions = graph[s];
      if (Object.keys(actions).length > 0) {
        groupLabels[s] = "group_" + (groupIdx++);
      }
      for (var act in actions) {
        edgeLabels[s + "_" + act] = "edge_" + s + "_" + act;
      }
      var firstAction = Object.keys(actions)[0];
      if (firstAction && actions[firstAction] && actions[firstAction].outcomes && actions[firstAction].outcomes.length > 1) {
        for (var oi = 0; oi < actions[firstAction].outcomes.length; oi++) {
          var eid = s + "_" + oi;
          edgeLabels[eid] = "edge_" + oi;
          for (var act2 in actions) {
            actionLabels[eid + "_" + act2] = "action_" + act2 + "_edge_" + oi;
          }
        }
      }
    }

    var keys = {};
    for (var k = 0; k < actionNames.length; k++) {
      keys[actionNames[k]] = config.keycodes[actionNames[k]];
    }

    return {
      graph: graph,
      layout: layout,
      nodeLabels: nodeLabels,
      nodeRewards: nodeRewards,
      nodeDisplay: config.node_display,
      edgeDisplay: config.edge_display,
      groupLabels: groupLabels,
      edgeLabels: edgeLabels,
      actionLabels: actionLabels,
      keys: keys,
      initial: "0",
      centerMessage: "<b>Trellis Navigation</b><br>Choose A or B at each step",
      lowerMessage: "Press A or B to move.  Space = Lock In",
      playerImage: config.player_image,
      playerImageScale: config.player_scale
    };
  }

  function showInstructions() {
    var actionKeys = config.action_names.join(" or ");
    $container.html(
      '<div class="instructions">' +
      '<h1>Trellis Navigation Experiment</h1>' +
      '<p>Navigate through a decision tree by pressing <b>' + actionKeys + '</b> at each step.</p>' +
      '<p>Each choice leads to one of two possible next states, with <b>probabilities that you must learn through experience</b>.</p>' +
      '<p>One final destination is a <b style="color:#28a745;">WINNING state</b>. The other is a <b style="color:#dc3545;">losing state</b>. Each win scores 1 point.</p>' +
      '<ul>' +
      '<li>Navigate from left to right by pressing A or B at each decision point.</li>' +
      '<li>After reaching an end state, you will see whether you won or lost.</li>' +
      '<li>Repeat as many times as you need to learn the probabilities.</li>' +
      '<li>When you feel confident, click <b>Lock In Strategy</b> to submit your final answer.</li>' +
      '</ul>' +
      '<button class="start-btn" id="btn-start">Start Experiment</button>' +
      '</div>'
    );
    $("#btn-start").on("click", function () {
      experimentStartTime = Date.now();
      startTrial();
    });
  }

  function startTrial() {
    clearTimeout(restartTimer);
    $("#result-flash").remove();

    if (!mdpInstance) {
      $container.empty();
      $container.css({ position: "relative" });
    }

    var trialCfg = buildTrellisConfig();
    trialCfg.display = $container;
    var wonSoFar = countWins();
    trialCfg.leftMessage = wonSoFar + " wins / " + trialCount + " trials";
    if (trialCount > 0) {
      trialCfg.leftMessage += " (" + Math.round(wonSoFar / trialCount * 100) + "%)";
    }
    trialCfg.rightMessage =
      '<button id="btn-lock-in-header" style="padding:3px 10px;font-size:13px;' +
      'background:#28a745;color:#fff;border:none;border-radius:3px;cursor:pointer">Lock In Strategy</button>';

    if (mdpInstance) {
      mdpInstance._onComplete = onTrialComplete;
      mdpInstance.reload(trialCfg);
    } else {
      try {
        mdpInstance = new MouselabMDPSetup.MouselabMDP(trialCfg);
        mdpInstance._onComplete = onTrialComplete;
        mdpInstance.run();
      } catch (e) {
        showError('Failed to create MDP: ' + e.message + '\n' + (e.stack || ''));
        return;
      }
    }

    $container.off("click", "#btn-lock-in-header").on("click", "#btn-lock-in-header", function () {
      lockedIn = true;
      clearTimeout(restartTimer);
      showLockIn();
    });
  }

  function onTrialComplete(data) {
    trialCount++;
    var won = data.score > 0;

    allTrialData.push({
      trial_number: trialCount,
      start_time_ms: data.actionTimes.length > 0 ? data.actionTimes[0] - (data.rt[0] || 0) : 0,
      end_time_ms: data.actionTimes.length > 0 ? data.actionTimes[data.actionTimes.length - 1] : 0,
      actions: data.actions.slice(),
      states_visited: data.path.slice(),
      transitions: data.transitions.slice().map(function (t) {
        return { from: t.state, action: t.action, to: t.nextState, prob: t.probability, reward: t.reward };
      }),
      terminal_state: data.path.length > 0 ? data.path[data.path.length - 1] : "",
      terminal_reward: data.score,
      won: won,
      reaction_times_ms: data.rt.slice(),
      score: data.score
    });

    updateScoreHeader(won, data.score);

    $("#result-flash").remove();
    var flashClass = won ? "flash-win" : "flash-lose";
    var flashText = won ? "WIN" : "LOSE";
    $('<div id="result-flash" class="' + flashClass + '">' + flashText + '</div>')
      .appendTo($container)
      .delay(600)
      .fadeOut(200, function () { $(this).remove(); });

    restartTimer = setTimeout(function () {
      startTrial();
    }, 900);
  }

  function updateScoreHeader(won, score) {
    var winCount = countWins();
    var rate = trialCount > 0 ? Math.round(winCount / trialCount * 100) : 0;
    var color = won ? "#28a745" : "#dc3545";
    $("#mouselab-msg-left").html(
      '<span style="color:' + color + '">' + winCount + '</span> wins / ' + trialCount + ' trials (' + rate + '%)'
    );
    $("#mouselab-msg-right").html(
      '<button id="btn-lock-in-header" style="padding:3px 10px;font-size:13px;' +
      'background:#28a745;color:#fff;border:none;border-radius:3px;cursor:pointer">Lock In Strategy</button>'
    );
    $container.off("click", "#btn-lock-in-header").on("click", "#btn-lock-in-header", function () {
      lockedIn = true;
      clearTimeout(restartTimer);
      showLockIn();
    });
  }

  function countWins() {
    var c = 0;
    for (var i = 0; i < allTrialData.length; i++) {
      if (allTrialData[i].won) c++;
    }
    return c;
  }

  function nonTerminalStates(depth, width) {
    var states = [];
    for (var layer = 0; layer < depth; layer++) {
      if (layer === 0) {
        states.push("0");
      } else {
        for (var idx = 0; idx < width; idx++) {
          states.push(layer + "_" + idx);
        }
      }
    }
    return states;
  }

  function stateLabel(state) {
    if (state === "0") return "Decision 1 (start)";
    var parts = state.split("_");
    var layer = parseInt(parts[0], 10);
    var idx = parseInt(parts[1], 10);
    var position = idx === 0 ? "top" : (idx === 1 ? "bottom" : "row " + idx);
    return "Decision " + layer + " (" + position + ")";
  }

  function showLockIn() {
    if (mdpInstance) {
      mdpInstance.reset();
      mdpInstance = null;
    }
    $container.empty();

    var depth = config.trellis_depth;
    var width = config.trellis_width;
    var actionNames = config.action_names;
    var layers = [];

    layers.push({ label: "Step 1 (start)", states: ["0"] });
    for (var layer = 1; layer < depth; layer++) {
      var layerStates = [];
      for (var idx = 0; idx < width; idx++) {
        layerStates.push(layer + "_" + idx);
      }
      layers.push({
        label: "Step " + (layer + 1),
        states: layerStates
      });
    }

    var html = '';
    html += '<div class="lock-in-screen">';
    html += '<h2>Lock In Your Strategy</h2>';
    html += '<p>For each position in the decision tree, choose A or B.</p>';

    for (var li = 0; li < layers.length; li++) {
      var group = layers[li];
      if (group.states.length === 1) {
        html +=
          '<div class="lock-in-group">' +
          '<div class="lock-group-label">' + group.label + '</div>' +
          '<label class="lock-choice"><input type="radio" name="choice-' + group.states[0] + '" value="A"> A</label>' +
          '<label class="lock-choice"><input type="radio" name="choice-' + group.states[0] + '" value="B"> B</label>' +
          '</div>';
      } else {
        html += '<div class="lock-in-group">';
        html += '<div class="lock-group-label">' + group.label + '</div>';
        for (var si = 0; si < group.states.length; si++) {
          var s = group.states[si];
          var rowLabel = si === 0 ? "Top" : "Bottom";
          html +=
            '<div class="lock-sub-row">' +
            '<span class="lock-sub-label">' + rowLabel + '</span>' +
            '<label class="lock-choice"><input type="radio" name="choice-' + s + '" value="A"> A</label>' +
            '<label class="lock-choice"><input type="radio" name="choice-' + s + '" value="B"> B</label>' +
            '</div>';
        }
        html += '</div>';
      }
    }

    html += '<button class="submit-btn" id="btn-submit-strategy">Confirm Strategy</button>';
    html += '<p class="error-msg" id="lock-in-error"></p>';
    html += '</div>';
    $container.html(html);

    var allStates = nonTerminalStates(depth, width);
    $("#btn-submit-strategy").on("click", function () {
      var strategy = {};
      var sequence = [];
      for (var i = 0; i < allStates.length; i++) {
        var s = allStates[i];
        var selected = $("input[name='choice-" + s + "']:checked").val();
        if (!selected) {
          $("#lock-in-error").text("Please make a choice for every position.");
          return;
        }
        strategy[s] = selected;
        sequence.push(selected);
      }

      var optimal = config.optimal_policy;
      var match = true;
      for (var st in optimal) {
        if (!optimal.hasOwnProperty(st)) continue;
        if (strategy[st] !== optimal[st]) {
          match = false;
          break;
        }
      }

      var result = {
        strategy: strategy,
        sequence: sequence,
        timestamp_ms: Date.now() - experimentStartTime,
        matches_optimal: match
      };

      showResults(result);
    });
  }

  function showResults(lockInResult) {
    var winCount = 0;
    for (var i = 0; i < allTrialData.length; i++) {
      if (allTrialData[i].won) winCount++;
    }
    var winRate = allTrialData.length > 0 ? (winCount / allTrialData.length * 100).toFixed(1) : "0.0";

    var matchClass = lockInResult.matches_optimal ? "match-yes" : "match-no";
    var matchText = lockInResult.matches_optimal ? "Yes" : "No";

    var optimal = config.optimal_policy;
    var states = nonTerminalStates(config.trellis_depth, config.trellis_width);
    var strategyRows = "";
    for (var i = 0; i < states.length; i++) {
      var s = states[i];
      var yours = lockInResult.strategy[s];
      var best = optimal[s];
      var yoursClass = (yours === best) ? "match-yes" : "match-no";
      strategyRows +=
        '<div class="result-row">' +
        '<span>' + stateLabel(s) + '</span>' +
        '<span class="' + yoursClass + '">' + yours + '</span>' +
        '<span class="result-optimal">' + best + '</span>' +
        '</div>';
    }

    $container.html(
      '<div class="results-screen">' +
      '<h2>Experiment Complete</h2>' +
      '<div class="result-row"><span>Trials completed</span><span>' + allTrialData.length + '</span></div>' +
      '<div class="result-row"><span>Win rate</span><span>' + winRate + '%</span></div>' +
      '<div class="result-section">' +
      '<h3>Your Strategy vs Optimal</h3>' +
      '<div class="result-row result-header"><span>Position</span><span>You</span><span>Optimal</span></div>' +
      strategyRows +
      '</div>' +
      '<div class="result-row"><span>All choices correct</span><span class="' + matchClass + '">' + matchText + '</span></div>' +
      '<p class="saved-msg" id="save-status">Saving results...</p>' +
      '</div>'
    );

    var participantId = "P" + String(Math.floor(Math.random() * 9000) + 1000);
    var payload = {
      participant_id: participantId,
      experiment_config: {
        trellis_depth: config.trellis_depth,
        trellis_width: config.trellis_width,
        winning_terminal_index: config.winning_terminal_index,
        win_reward: config.win_reward,
        lose_reward: config.lose_reward,
        probs: config.probs,
        action_names: config.action_names,
        optimal_policy: config.optimal_policy
      },
      timestamps: {
        start: new Date(experimentStartTime).toISOString(),
        end: new Date().toISOString()
      },
      trials: allTrialData,
      total_trials_completed: allTrialData.length,
      lock_in: lockInResult,
      summary: {
        win_rate: parseFloat(winRate),
        trials_to_first_correct: findFirstCorrectTrial(),
        converged: convergedCheck(),
        optimal_policy: config.optimal_policy
      }
    };

    saveData(payload);
  }

  function findFirstCorrectTrial() {
    var optimal = config.optimal_policy;
    for (var i = 0; i < allTrialData.length; i++) {
      var trial = allTrialData[i];
      var allMatch = true;
      for (var j = 0; j < trial.actions.length; j++) {
        var stateAtStep = trial.states_visited[j];
        if (optimal[stateAtStep] && optimal[stateAtStep] !== trial.actions[j]) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) return i + 1;
    }
    return null;
  }

  function convergedCheck() {
    if (allTrialData.length < 5) return false;
    var last5 = allTrialData.slice(-5);
    var same = true;
    for (var i = 1; i < last5.length; i++) {
      if (last5[i].actions.join(",") !== last5[0].actions.join(",")) {
        same = false;
        break;
      }
    }
    return same;
  }

  function saveData(payload) {
    $.ajax({
      type: "POST",
      url: "/api/save",
      data: JSON.stringify(payload),
      contentType: "application/json",
      success: function () {
        $("#save-status").text("Results saved. Thank you for participating!");
      },
      error: function () {
        $("#save-status").text("Could not save automatically. Please show this screen to the researcher.");
      }
    });
  }

  $(function () {
    document.addEventListener("keydown", function (e) {
      if (lockedIn) return;
      if (e.code !== "Space") return;
      if (!mdpInstance) return;
      e.preventDefault();
      lockedIn = true;
      clearTimeout(restartTimer);
      $("#result-flash").remove();
      mdpInstance.reset();
      showLockIn();
    });

    showInstructions();
  });

  } catch (e) {
    showError('Initialization error: ' + e.message + '\n' + (e.stack || ''));
  }

})();
