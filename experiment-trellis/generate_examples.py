"""Generate synthetic participant datasets for testing analysis."""
import json
import random
import math
from pathlib import Path
from datetime import datetime, timedelta

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data" / "participants"

PROB_POOL = [0.65, 0.75, 0.85]
FIXED_DEPTH = 3
FIXED_WIDTH = 2


def state_list(depth, width):
    states = ["0"]
    for layer in range(1, depth + 1):
        for idx in range(width):
            states.append(f"{layer}_{idx}")
    return states


def action_names(width):
    return [chr(65 + i) for i in range(width)]


def generate_random_config():
    rng = random.Random()
    depth = FIXED_DEPTH
    width = FIXED_WIDTH
    actions = action_names(width)

    probs = {}
    for s in state_list(depth, width):
        probs[s] = {}
        for a in actions:
            strength = rng.choice(PROB_POOL)
            pref = rng.randint(0, 1)
            if pref == 0:
                probs[s][a] = [strength, round(1 - strength, 2)]
            else:
                probs[s][a] = [round(1 - strength, 2), strength]

    winning_terminal = rng.randint(0, width - 1)
    win_reward = 1
    lose_reward = 0

    V = {}
    policy = {}
    for idx in range(width):
        t = f"{depth}_{idx}"
        V[t] = win_reward if idx == winning_terminal else lose_reward

    for layer in range(depth - 1, -1, -1):
        if layer == 0:
            layer_states = ["0"]
        else:
            layer_states = [f"{layer}_{idx}" for idx in range(width)]
        for s in layer_states:
            best_val = -float("inf")
            best_a = actions[0]
            for a in actions:
                q = 0
                for ci in range(width):
                    child = f"{layer + 1}_{ci}"
                    q += probs[s][a][ci] * V[child]
                if q > best_val:
                    best_val = q
                    best_a = a
            V[s] = best_val
            policy[s] = best_a

    return {
        "trellis_depth": depth,
        "trellis_width": width,
        "winning_terminal_index": winning_terminal,
        "win_reward": win_reward,
        "lose_reward": lose_reward,
        "probs": probs,
        "action_names": actions,
        "optimal_policy": policy,
    }


def simulate_traversal(config, policy=None):
    width = config["trellis_width"]
    depth = config["trellis_depth"]
    probs = config["probs"]
    actions = config["action_names"]
    win_reward = config["win_reward"]
    lose_reward = config["lose_reward"]
    win_idx = config["winning_terminal_index"]

    actions_taken = []
    states = []
    transitions = []
    rt = []
    score = 0
    rng = random.Random()

    current = "0"
    states.append(current)

    for layer in range(depth):
        if policy and current in policy:
            action = policy[current]
        elif policy and f"step_{layer}" in policy:
            action = policy[f"step_{layer}"]
        else:
            action = rng.choice(actions)

        a_idx = actions.index(action)
        actions_taken.append(action)

        state_probs = probs[current][action]
        roll = rng.random()
        cumulative = 0
        target = None
        prob = None
        for t_idx in range(width):
            cumulative += state_probs[t_idx]
            if roll <= cumulative:
                target = f"{layer + 1}_{t_idx}"
                prob = state_probs[t_idx]
                break
        if target is None:
            target = f"{layer + 1}_{width - 1}"
            prob = state_probs[width - 1]

        reward = 0
        if layer == depth - 1:
            t_idx = int(target.split("_")[1])
            reward = win_reward if t_idx == win_idx else lose_reward
            score = reward

        transitions.append({
            "from": current,
            "action": action,
            "to": target,
            "prob": prob,
            "reward": reward,
        })
        rt.append(rng.randint(200, 1500))
        current = target
        states.append(current)

    return {
        "actions": actions_taken,
        "states_visited": states,
        "transitions": transitions,
        "terminal_state": current,
        "terminal_reward": score,
        "won": score > 0,
        "reaction_times_ms": rt,
        "score": score,
    }


def generate_participant(pid, config, profile, n_trials):
    optimal = config["optimal_policy"]
    wrong_policy = {}
    for k, v in optimal.items():
        wrong_policy[k] = "B" if v == "A" else "A"

    start_time = datetime.now() - timedelta(minutes=random.randint(5, 180))
    trial_start_offset = 0

    trials = []
    rng = random.Random()

    for tn in range(1, n_trials + 1):
        if profile == "random":
            policy = None
        elif profile == "optimal":
            policy = optimal
        elif profile == "wrong":
            policy = wrong_policy
        elif profile == "learner":
            p_optimal = min(0.99, 0.5 + 0.08 * tn)
            if rng.random() < p_optimal:
                policy = optimal
            else:
                policy = None
        elif profile == "slow_learner":
            p_optimal = min(0.99, 0.5 + 0.03 * tn)
            if rng.random() < p_optimal:
                policy = optimal
            else:
                policy = None
        else:
            policy = None

        trial = simulate_traversal(config, policy)
        trial["trial_number"] = tn
        trial["start_time_ms"] = trial_start_offset
        trial_end = trial_start_offset + sum(trial["reaction_times_ms"]) + 500
        trial["end_time_ms"] = trial_end
        trial_start_offset = trial_end + 1000
        trials.append(trial)

    win_count = sum(1 for t in trials if t["won"])
    win_rate = win_count / n_trials * 100

    if profile in ("optimal", "learner", "slow_learner"):
        matches = True
        sequence = [optimal.get("0", "A")] * config["trellis_depth"]
    elif profile == "wrong":
        matches = False
        sequence = ["B"] * config["trellis_depth"]
    else:
        matches = False
        sequence = [rng.choice(["A", "B"]) for _ in range(config["trellis_depth"])]

    lock_in = {
        "strategy": {"step_" + str(i): s for i, s in enumerate(sequence)},
        "sequence": sequence,
        "timestamp_ms": trial_start_offset,
        "matches_optimal": matches,
    }

    converged = False
    if n_trials >= 5:
        last5 = [tuple(t["actions"]) for t in trials[-5:]]
        converged = len(set(last5)) == 1

    return {
        "participant_id": pid,
        "experiment_config": {
            "trellis_depth": config["trellis_depth"],
            "trellis_width": config["trellis_width"],
            "winning_terminal_index": config["winning_terminal_index"],
            "win_reward": config["win_reward"],
            "lose_reward": config["lose_reward"],
            "probs": config["probs"],
            "action_names": config["action_names"],
            "optimal_policy": config["optimal_policy"],
        },
        "timestamps": {
            "start": start_time.isoformat(),
            "end": (start_time + timedelta(seconds=trial_start_offset // 1000)).isoformat(),
        },
        "trials": trials,
        "total_trials_completed": n_trials,
        "lock_in": lock_in,
        "summary": {
            "win_rate": round(win_rate, 1),
            "trials_to_first_correct": find_first_correct(trials, config),
            "converged": converged,
            "optimal_policy": config["optimal_policy"],
        },
    }


def find_first_correct(trials, config):
    optimal = config["optimal_policy"]
    for i, t in enumerate(trials):
        all_match = True
        for j, a in enumerate(t["actions"]):
            state = t["states_visited"][j]
            if state in optimal and optimal[state] != a:
                all_match = False
                break
        if all_match:
            return i + 1
    return None


def main():
    config = generate_random_config()
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    profiles = [
        ("learner", 25),
        ("slow_learner", 20),
        ("optimal", 10),
        ("wrong", 8),
        ("random", 15),
        ("learner", 30),
        ("learner", 18),
        ("slow_learner", 22),
        ("optimal", 12),
        ("random", 10),
        ("learner", 28),
        ("optimal", 13),
        ("wrong", 7),
        ("slow_learner", 24),
        ("learner", 35),
    ]

    for i, (profile, n_trials) in enumerate(profiles):
        pid = f"EXAMPLE_{i + 1:03d}"
        participant = generate_participant(pid, config, profile, n_trials)
        path = DATA_DIR / f"{pid}.json"
        with open(path, "w") as f:
            json.dump(participant, f, indent=2)
        print(f"Generated {pid}: {profile} profile, {n_trials} trials")

    example_dir = ROOT / "data" / "example"
    example_dir.mkdir(parents=True, exist_ok=True)
    for fpath in sorted(DATA_DIR.glob("EXAMPLE_*.json"))[:3]:
        dest = example_dir / fpath.name
        dest.write_text(fpath.read_text(), encoding="utf-8")
    print(f"Copied examples to {example_dir}")


if __name__ == "__main__":
    main()
