# Trellis Navigation Experiment

A reproducible experiment measuring how participants learn and exploit probabilistic transition dynamics in a 2-width trellis environment.

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

All experiment parameters live in `static/config.json`:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `trellis_depth` | 3 | Number of decision layers |
| `trellis_width` | 2 | Number of branches at each split |
| `winning_terminal_index` | 0 | Which terminal state wins |
| `win_reward` | 10 | Points for reaching the winning state |
| `lose_reward` | -1 | Points for reaching a losing state |
| `probs` | [[0.75, 0.25], [0.25, 0.75]] | Transition probability matrix (action x target) |
| `node_display` | "never" | How node labels appear (never/hover/click/always) |
| `edge_display` | "never" | How edge labels appear |

The human-readable reference is in `config/experiment.yaml`.

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
      "terminal_reward": -1,
      "won": false,
      "reaction_times_ms": [400, 350, 1200],
      "score": -1
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

This creates 15 synthetic participant datasets with varied behavior profiles (random, learner, optimal, wrong, slow learner).

### Run Analysis Pipeline

```bash
# 1. Compute metrics and export CSVs
mise run trellis-analyze

# 2. Generate plots from CSVs
mise run trellis-plot

# 3. Print summary report
mise run trellis-report
```

### Output Files

| File | Content |
|------|---------|
| `output/csv/participants.csv` | Per-participant summary (trials, win rate, matched optimal) |
| `output/csv/trials.csv` | Per-trial data (actions, states, RTs, outcome) |
| `output/csv/action_distribution.csv` | Per-step action counts |
| `output/csv/learning_curve.csv` | Win rate per trial number (aggregated) |
| `output/plots/learning_curve.png` | Win rate over trials with error bands |
| `output/plots/action_distribution.png` | Bar chart of A/B choices per decision step |
| `output/plots/optimal_convergence.png` | % choosing optimal action per step over trials |
| `output/plots/reaction_times.png` | Reaction time trend |
| `output/plots/heatmap_{pid}.png` | Per-participant action heatmaps |

## Directory Structure

```
experiment-trellis/
├── README.md
├── config/
│   └── experiment.yaml          # Human-readable experiment spec
├── static/
│   ├── index.html               # Entry point
│   ├── config.json              # Experiment parameters (single source of truth)
│   ├── css/experiment.css
│   ├── js/
│   │   ├── config.js            # JS copy of config.json
│   │   ├── wrappers.js          # MouselabMDP prototype overrides
│   │   └── experiment.js        # Main experiment logic
│   └── images/                  # Player sprites
├── data/
│   ├── participants/            # Saved participant JSONs
│   └── example/                 # Example datasets
├── analysis/
│   ├── analyze.py               # JSON → metrics → CSV
│   ├── visualize.py             # CSV → plots
│   └── report.py                # Console summary
├── generate_examples.py         # Synthetic data generator
└── output/
    ├── csv/                     # Exported tables
    └── plots/                   # Generated figures
```

## Optimal Policy

For the default configuration (winning terminal = 3_0):

- **Always choose A** at every decision point
- This gives a ~56.25% win rate vs 50% chance
- The "always B" policy gives ~43.75%
- Any mixed policy falls between these extremes

## Dependencies

**Runtime:** jQuery, Underscore, Fabric.js, jsPsych (keyboard listener only)

**Analysis:** Python 3.11+ with numpy, scipy, toolz, matplotlib, pandas, pyyaml

## Future Work

- Counterbalance winning terminal across participants
- Measure relearning after switching the winning state
- Show observed empirical probabilities instead of hiding all transition info
- Pre-registration and crowd-sourcing integration
