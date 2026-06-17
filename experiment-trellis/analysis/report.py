"""Print aggregate experiment summary to stdout."""
import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSV_DIR = ROOT / "output" / "csv"


def read_csv(name):
    path = CSV_DIR / name
    if not path.exists():
        print(f"Missing: {path}  (run analyze.py first)")
        return []
    with open(path, newline="") as f:
        return list(csv.DictReader(f))


def main():
    participants = read_csv("participants.csv")
    trials = read_csv("trials.csv")

    if not participants:
        return

    n = len(participants)
    win_rates = [float(p["win_rate"]) for p in participants]
    matched = sum(1 for p in participants if p["matches_optimal"] == "True")
    n_trials = [int(p["total_trials"]) for p in participants]

    print("=" * 50)
    print("        TRELLIS EXPERIMENT REPORT")
    print("=" * 50)
    print(f"  Participants:              {n}")
    print(f"  Mean win rate:             {sum(win_rates)/n:.1f}%")
    print(f"  Min / Max win rate:        {min(win_rates):.1f}% / {max(win_rates):.1f}%")
    print(f"  Matched optimal lock-in:   {matched}/{n} ({matched/n*100:.0f}%)")
    print(f"  Mean trials per person:    {sum(n_trials)/n:.1f}")
    print(f"  Min / Max trials:          {min(n_trials)} / {max(n_trials)}")
    print("-" * 50)

    print("\nPer-participant summary:")
    print(f"  {'ID':<8} {'Trials':<8} {'Win%':<8} {'Optimal':<8} {'Conv'}")
    for p in participants:
        opt = "Yes" if p["matches_optimal"] == "True" else "No"
        print(f"  {p['participant_id']:<8} {p['total_trials']:<8} {p['win_rate']:<8} {opt:<8} {p['converged']}")


if __name__ == "__main__":
    main()
