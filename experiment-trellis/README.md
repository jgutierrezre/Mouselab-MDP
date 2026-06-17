# Trellis Navigation Experiment

A reproducible experiment measuring how participants learn and exploit probabilistic transition dynamics in a trellis environment.

Built on the [Mouselab-MDP](..) navigation plugin.

## Quick Start

```bash
# Install dependencies
mise run setup

# Start the server
mise run serve

# Open in browser
# http://localhost:8000/experiment-trellis/static/index.html
```

## Configuration

Experiment parameters are randomized per participant at runtime. Fixed constants:

| Parameter | Value | Description |
|-----------|-------|-------------|
| `trellis_depth` | 3 | Number of decision layers |
| `trellis_width` | 2 | Number of branches at each split |
| `win_reward` | 1 | Points for reaching the winning state |
| `lose_reward` | 0 | Points for reaching a losing state |
| `prob_pool` | [0.65, 0.75, 0.85] | Discrete set of probability strengths |

Per state, each action independently draws a probability from the pool and randomly assigns which child it prefers.

## Experiment Flow

1. **Instructions** - Brief explanation of the task
2. **Exploration** - Participant navigates the trellis repeatedly, choosing A or B
3. **Lock In** - Participant submits their final strategy (sequence of A/B)
4. **Results** - Feedback on performance, data saved to server

## Data

Participant data is saved to `data/participants/{id}.json` via POST to `/api/save`.

### Data Schema

```json
{
  "participant_id": "P1234",
  "experiment_config": { ... },
  "timestamps": { "start": "...", "end": "..." },
  "trials": [
    {
      "trial_number": 1,
      "actions": ["A", "A", "B"],
      "states_visited": ["0", "1_0", "2_0", "3_1"],
      "transitions": [{ "from": "0", "action": "A", "to": "1_0", "prob": 0.75, "reward": 0 }, ...],
      "terminal_state": "3_1",
      "terminal_reward": 0,
      "won": false,
      "reaction_times_ms": [400, 350, 1200],
      "score": 0
    }
  ],
  "total_trials_completed": 27,
  "lock_in": {
    "sequence": ["A", "A", "A"],
    "matches_optimal": true
  },
  "summary": {
    "win_rate": 56.0,
    "trials_to_first_correct": 5,
    "converged": true,
    "optimal_policy": { "0": "A", ... }
  }
}
```

## Analysis

### Generate Example Data

```bash
mise run trellis-examples
```

### Run Analysis Pipeline

```bash
mise run trellis-analyze
mise run trellis-plot
mise run trellis-report
```

## Directory Structure

```
experiment-trellis/
├── README.md
├── config/
│   └── experiment.yaml
├── static/
│   ├── index.html
│   ├── css/experiment.css
│   ├── js/
│   │   ├── randomize.js       # Config generation + DP solver
│   │   ├── wrappers.js        # MouselabMDP prototype overrides
│   │   └── experiment.js      # Main experiment logic
│   └── images/
├── data/
│   ├── participants/
│   └── example/
├── analysis/
│   ├── analyze.py
│   ├── visualize.py
│   └── report.py
├── generate_examples.py
└── output/
    ├── csv/
    └── plots/
```

## Dependencies

**Runtime:** jQuery, Underscore, Fabric.js, jsPsych

**Analysis:** Python 3.11+ with numpy, scipy, toolz, matplotlib, pandas, pyyaml
