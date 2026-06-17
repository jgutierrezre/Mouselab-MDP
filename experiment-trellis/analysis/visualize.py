"""Generate publication-ready plots from CSVs produced by analyze.py."""
import csv
import os
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
CSV_DIR = ROOT / "output" / "csv"
PLOT_DIR = ROOT / "output" / "plots"


def read_csv(name):
    path = CSV_DIR / name
    if not path.exists():
        print(f"Missing: {path}")
        return []
    with open(path, newline="") as f:
        return list(csv.DictReader(f))


def plot_learning_curve():
    data = read_csv("learning_curve.csv")
    if not data:
        return
    trials = [int(r["trial_number"]) for r in data]
    rates = [float(r["win_rate"]) for r in data]
    sems = [float(r["sem"]) for r in data]

    plt.figure(figsize=(8, 5))
    plt.plot(trials, rates, "b-", linewidth=2, label="Observed win rate")
    plt.fill_between(trials,
                     [r - s for r, s in zip(rates, sems)],
                     [r + s for r, s in zip(rates, sems)],
                     alpha=0.2, color="b")
    plt.axhline(y=0.5, color="gray", linestyle=":", label="Chance")
    plt.xlabel("Trial number")
    plt.ylabel("Win rate")
    plt.title("Learning Curve: Win Rate Over Trials")
    plt.legend()
    plt.tight_layout()
    PLOT_DIR.mkdir(parents=True, exist_ok=True)
    plt.savefig(PLOT_DIR / "learning_curve.png", dpi=150)
    plt.close()
    print("Saved learning_curve.png")


def plot_action_distribution():
    data = read_csv("action_distribution.csv")
    if not data:
        return
    from collections import defaultdict
    by_step = defaultdict(lambda: defaultdict(int))
    for r in data:
        step = int(r["decision_step"])
        action = r["action"]
        by_step[step][action] += 1

    steps = sorted(by_step.keys())
    actions = sorted(set(a for s in by_step.values() for a in s))
    fig, axes = plt.subplots(1, len(steps), figsize=(4 * len(steps), 4), sharey=True)
    if len(steps) == 1:
        axes = [axes]

    colors = {"A": "#007bff", "B": "#dc3545"}
    for i, step in enumerate(steps):
        act_counts = by_step[step]
        labels = actions
        counts = [act_counts.get(a, 0) for a in labels]
        axes[i].bar(labels, counts, color=[colors.get(a, "#999") for a in labels])
        axes[i].set_title(f"Decision {step}")
        axes[i].set_ylabel("Count")
    fig.suptitle("Action Distribution by Decision Step")
    plt.tight_layout()
    plt.savefig(PLOT_DIR / "action_distribution.png", dpi=150)
    plt.close()
    print("Saved action_distribution.png")


def plot_optimal_convergence():
    data = read_csv("action_distribution.csv")
    if not data:
        return
    from collections import defaultdict
    by_trial_step = defaultdict(lambda: defaultdict(int))
    for r in data:
        trial = int(r["trial_number"])
        step = int(r["decision_step"])
        action = r["action"]
        key = (trial, step)
        by_trial_step[key][action] = by_trial_step[key].get(action, 0) + 1

    max_trial = max(int(r["trial_number"]) for r in data)
    steps = sorted(set(int(r["decision_step"]) for r in data))

    fig, axes = plt.subplots(1, len(steps), figsize=(4 * len(steps), 4), sharey=True)
    if len(steps) == 1:
        axes = [axes]

    for i, step in enumerate(steps):
        trial_nums = list(range(1, max_trial + 1))
        prop_a = []
        for tn in trial_nums:
            key = (tn, step)
            total = sum(by_trial_step[key].values())
            count_a = by_trial_step[key].get("A", 0)
            prop_a.append(count_a / total * 100 if total > 0 else 0)
        axes[i].plot(trial_nums, prop_a, "b-", linewidth=1.5)
        axes[i].axhline(y=50, color="gray", linestyle=":", label="Chance")
        axes[i].set_title(f"Decision {step}")
        axes[i].set_xlabel("Trial")
        axes[i].set_ylabel("% choosing A")
    fig.suptitle("Convergence Toward Optimal Policy")
    plt.tight_layout()
    plt.savefig(PLOT_DIR / "optimal_convergence.png", dpi=150)
    plt.close()
    print("Saved optimal_convergence.png")


def plot_rt_trend():
    data = read_csv("trials.csv")
    if not data:
        return
    from collections import defaultdict
    rt_by_trial = defaultdict(list)
    for r in data:
        trial = int(r["trial_number"])
        rt = float(r.get("mean_rt_ms", 0))
        if rt > 0:
            rt_by_trial[trial].append(rt)

    trials = sorted(rt_by_trial.keys())
    means = [np.mean(rt_by_trial[t]) for t in trials]
    sems = [np.std(rt_by_trial[t]) / np.sqrt(len(rt_by_trial[t])) for t in trials]

    plt.figure(figsize=(8, 5))
    plt.plot(trials, means, "g-", linewidth=2)
    plt.fill_between(trials,
                     [m - s for m, s in zip(means, sems)],
                     [m + s for m, s in zip(means, sems)],
                     alpha=0.2, color="g")
    plt.xlabel("Trial number")
    plt.ylabel("Mean reaction time (ms)")
    plt.title("Reaction Time Over Trials")
    plt.tight_layout()
    plt.savefig(PLOT_DIR / "reaction_times.png", dpi=150)
    plt.close()
    print("Saved reaction_times.png")


def plot_participant_heatmap():
    data = read_csv("action_distribution.csv")
    if not data:
        return
    pids = sorted(set(r["participant_id"] for r in data))
    for pid in pids:
        pid_data = [r for r in data if r["participant_id"] == pid]
        max_trial = max(int(r["trial_number"]) for r in pid_data)
        max_step = max(int(r["decision_step"]) for r in pid_data)
        grid = np.zeros((max_step, max_trial))
        for r in pid_data:
            trial = int(r["trial_number"]) - 1
            step = int(r["decision_step"]) - 1
            grid[step, trial] = 1 if r["action"] == "A" else 0

        fig, ax = plt.subplots(figsize=(max(6, max_trial * 0.4), max(2, max_step * 0.6)))
        cmap = plt.cm.RdYlGn
        im = ax.imshow(grid, aspect="auto", cmap=cmap, vmin=0, vmax=1)
        ax.set_xlabel("Trial")
        ax.set_ylabel("Decision step")
        ax.set_title(f"Action heatmap: {pid}  (green=A, red=B)")
        ax.set_yticks(range(max_step))
        ax.set_yticklabels([f"Step {i+1}" for i in range(max_step)])
        plt.colorbar(im, ax=ax, ticks=[0, 1], label="Action (0=B, 1=A)")
        plt.tight_layout()
        plt.savefig(PLOT_DIR / f"heatmap_{pid}.png", dpi=150)
        plt.close()
    print(f"Saved heatmaps for {len(pids)} participant(s)")


def main():
    PLOT_DIR.mkdir(parents=True, exist_ok=True)
    plot_learning_curve()
    plot_action_distribution()
    plot_optimal_convergence()
    plot_rt_trend()
    plot_participant_heatmap()
    print("All plots generated.")


if __name__ == "__main__":
    main()
