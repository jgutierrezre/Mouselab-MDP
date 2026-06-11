(function () {
  "use strict";

  var $container = $("#experiment-container");
  var config = window.TRELLIS_CONFIG;
  var allTrialData = [];
  var trialCount = 0;
  var experimentStartTime;
  var mdpInstance = null;
  var restartTimer = null;
  var lockedIn = false;

  // ---------- Trellis builder ----------

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

    // Root -> layer 1
    for (var a = 0; a < width; a++) {
      var outcomes0 = [];
      for (var t = 0; t < width; t++) {
        outcomes0.push({ prob: probs[a][t], reward: 0, target: "1_" + t });
      }
      graph["0"][actionNames[a]] = { outcomes: outcomes0 };
    }

    // Intermediate layers
    for (var layer = 1; layer < depth; layer++) {
      for (var idx = 0; idx < width; idx++) {
        var src = layer + "_" + idx;
        for (var a = 0; a < width; a++) {
          var outcomes = [];
          for (var t = 0; t < width; t++) {
            outcomes.push({ prob: probs[a][t], reward: 0, target: (layer + 1) + "_" + t });
          }
          graph[src][actionNames[a]] = { outcomes: outcomes };
        }
      }
    }

    // Labels for edges and groups
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

  // ---------- Instructions ----------

  function showInstructions() {
    var actionKeys = config.action_names.join(" or ");
    $container.html(
      '<div class="instructions">' +
      '<h1>Trellis Navigation Experiment</h1>' +
      '<p>In this experiment, you will navigate through a decision tree by pressing <b>' + actionKeys + '</b> at each step.</p>' +
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

  // ---------- Trial ----------

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
      mdpInstance = new window.MouselabMDPCtx.MouselabMDP(trialCfg);
      mdpInstance._onComplete = onTrialComplete;
      mdpInstance.run();
    }

    $container.off("click", "#btn-lock-in-header").on("click", "#btn-lock-in-header", function () {
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
      showLockIn();
    });
  }

  // ---------- Lock In ----------

  function countWins() {
    var c = 0;
    for (var i = 0; i < allTrialData.length; i++) {
      if (allTrialData[i].won) c++;
    }
    return c;
  }

  function showLockIn() {
    if (mdpInstance) {
      mdpInstance.reset();
      mdpInstance = null;
    }
    $container.empty();

    var depth = config.trellis_depth;
    var rows = "";
    for (var step = 0; step < depth; step++) {
      rows +=
        '<div class="choice-row">' +
        '<span class="choice-label">Decision ' + (step + 1) + '</span>' +
        '<label><input type="radio" name="choice-' + step + '" value="A"> A</label>' +
        '<label><input type="radio" name="choice-' + step + '" value="B"> B</label>' +
        '</div>';
    }

    $container.html(
      '<div class="lock-in-screen">' +
      '<h2>Lock In Your Strategy</h2>' +
      '<p>Submit the sequence of actions you believe maximizes your chance of winning.</p>' +
      rows +
      '<button class="submit-btn" id="btn-submit-strategy">Confirm Strategy</button>' +
      '<p class="error-msg" id="lock-in-error"></p>' +
      '</div>'
    );

    $("#btn-submit-strategy").on("click", function () {
      var strategy = {};
      var sequence = [];
      for (var step = 0; step < depth; step++) {
        var selected = $("input[name='choice-" + step + "']:checked").val();
        if (!selected) {
          $("#lock-in-error").text("Please make a choice for each decision point.");
          return;
        }
        sequence.push(selected);
        // The optimal_policy maps per-state, but participant specifies per-step.
        // At each step, there may be multiple states; we record the step-level choice.
        var stepKey = "step_" + step;
        strategy[stepKey] = selected;
      }

      var optimal = config.optimal_policy;
      var match = true;
      for (var key in optimal) {
        if (!optimal.hasOwnProperty(key)) continue;
        var layer = parseInt(key.split("_")[0]);
        if (isNaN(layer)) layer = 0;
        if (strategy["step_" + layer] !== optimal[key]) {
          match = false;
        }
      }

      var result = {
        strategy: strategy,
        sequence: sequence,
        timestamp_ms: Date.now() - experimentStartTime,
        matches_optimal: match
      };

      showResults(result, sequence);
    });
  }

  // ---------- Results & Save ----------

  function showResults(lockInResult, sequence) {
    var winCount = 0;
    for (var i = 0; i < allTrialData.length; i++) {
      if (allTrialData[i].won) winCount++;
    }
    var winRate = allTrialData.length > 0 ? (winCount / allTrialData.length * 100).toFixed(1) : "0.0";
    var optimalSeq = [];
    for (var s = 0; s < config.trellis_depth; s++) {
      optimalSeq.push(config.optimal_policy["0"]); // all same in symmetric trellis
    }
    var matchClass = lockInResult.matches_optimal ? "match-yes" : "match-no";
    var matchText = lockInResult.matches_optimal ? "Yes" : "No";

    $container.html(
      '<div class="results-screen">' +
      '<h2>Experiment Complete</h2>' +
      '<div class="result-row"><span>Trials completed</span><span>' + allTrialData.length + '</span></div>' +
      '<div class="result-row"><span>Win rate</span><span>' + winRate + '%</span></div>' +
      '<div class="result-row"><span>Your strategy</span><span>' + sequence.join(" ") + '</span></div>' +
      '<div class="result-row"><span>Optimal strategy</span><span>' + optimalSeq.join(" ") + '</span></div>' +
      '<div class="result-row"><span>Matches optimal</span><span class="' + matchClass + '">' + matchText + '</span></div>' +
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
      if (trial.won) {
        // Check if all actions match optimal for the states visited
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

  // ---------- Entry ----------

  $(function () {
    // Global listener: Space locks in any time after a trial completes
    document.addEventListener("keydown", function (e) {
      if (lockedIn) return;
      if (e.code !== "Space") return;
      if (!mdpInstance) return;
      if (!mdpInstance.complete) return;
      e.preventDefault();
      lockedIn = true;
      clearTimeout(restartTimer);
      $("#result-flash").remove();
      showLockIn();
    });

    showInstructions();
  });

})();
