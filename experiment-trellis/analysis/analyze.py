"""Read all participant JSON files, compute metrics, export CSVs."""
import json
import csv
import os
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data" / "participants"
OUTPUT_DIR = ROOT / "output" / "csv"
CONFIG_PATH = ROOT / "static" / "config.json"


def load_participants():
    participants = []
    if not DATA_DIR.exists():
        print(f"Data directory not found: {DATA_DIR}")
        return participants
    for fpath in sorted(DATA_DIR.glob("*.json")):
        with open(fpath) as f:
            participants.append(json.load(f))
    return participants


def load_config():
    with open(CONFIG_PATH) as f:
        return json.load(f)


def write_participants_csv(participants, config):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    rows = []
    for p in participants:
        s = p.get("summary", {})
        li = p.get("lock_in", {})
        rows.append({
            "participant_id": p["participant_id"],
            "start_time": p["timestamps"]["start"],
            "end_time": p["timestamps"]["end"],
            "total_trials": p["total_trials_completed"],
            "win_rate": s.get("win_rate", 0),
            "trials_to_first_correct": s.get("trials_to_first_correct"),
            "converged": s.get("converged", False),
            "matches_optimal": li.get("matches_optimal", False),
            "final_sequence": " ".join(li.get("sequence", [])),
            "optimal_sequence": " ".join(
                list(config["optimal_policy"].values())[0]
                for _ in li.get("sequence", [])
            ),
        })
    if not rows:
        return
    with open(OUTPUT_DIR / "participants.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader()
        w.writerows(rows)
    print(f"Wrote {len(rows)} rows to participants.csv")


def write_trials_csv(participants):
    rows = []
    for p in participants:
        pid = p["participant_id"]
        for t in p.get("trials", []):
            rows.append({
                "participant_id": pid,
                "trial_number": t["trial_number"],
                "won": t["won"],
                "score": t.get("score", 0),
                "actions": " ".join(t.get("actions", [])),
                "states_visited": " ".join(t.get("states_visited", [])),
                "terminal_state": t.get("terminal_state", ""),
                "mean_rt_ms": round(
                    sum(t.get("reaction_times_ms", [0])) / max(len(t.get("reaction_times_ms", [1])), 1), 1
                ),
                "duration_ms": t.get("end_time_ms", 0) - t.get("start_time_ms", 0),
            })
    if not rows:
        return
    with open(OUTPUT_DIR / "trials.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader()
        w.writerows(rows)
    print(f"Wrote {len(rows)} rows to trials.csv")


def write_action_distribution(participants):
    """Per-participant, per-decision-step action counts."""
    rows = []
    for p in participants:
        pid = p["participant_id"]
        for t in p.get("trials", []):
            actions = t.get("actions", [])
            for step, a in enumerate(actions):
                rows.append({
                    "participant_id": pid,
                    "trial_number": t["trial_number"],
                    "decision_step": step + 1,
                    "action": a,
                })
    if not rows:
        return
    with open(OUTPUT_DIR / "action_distribution.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader()
        w.writerows(rows)
    print(f"Wrote {len(rows)} rows to action_distribution.csv")


def write_learning_curve(participants, config):
    """Win rate per trial number (aggregated across participants)."""
    trial_wins = {}
    trial_counts = Counter()
    for p in participants:
        for t in p.get("trials", []):
            tn = t["trial_number"]
            trial_wins[tn] = trial_wins.get(tn, 0) + (1 if t["won"] else 0)
            trial_counts[tn] += 1

    max_trial = max(trial_counts.keys()) if trial_counts else 0
    rows = []
    import numpy as np
    for tn in range(1, max_trial + 1):
        count = trial_counts.get(tn, 0)
        wins = trial_wins.get(tn, 0)
        rate = wins / count if count > 0 else 0
        sem = np.sqrt(rate * (1 - rate) / count) if count > 0 else 0
        rows.append({
            "trial_number": tn,
            "n_participants": count,
            "win_rate": round(rate, 4),
            "sem": round(sem, 4),
        })

    with open(OUTPUT_DIR / "learning_curve.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["trial_number", "n_participants", "win_rate", "sem"])
        w.writeheader()
        w.writerows(rows)
    print(f"Wrote {len(rows)} rows to learning_curve.csv")


def main():
    config = load_config()
    participants = load_participants()
    if not participants:
        print("No participant data found. Run generate_examples.py to create test data.")
        return

    print(f"Loaded {len(participants)} participant(s)")
    write_participants_csv(participants, config)
    write_trials_csv(participants)
    write_action_distribution(participants)
    write_learning_curve(participants, config)


if __name__ == "__main__":
    main()
