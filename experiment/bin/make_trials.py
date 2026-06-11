#!/usr/bin/env python3
"""Generates trials json for the demo experiment.

Trial definition schema:

    graph          {node_name: {action_name: edge}}
                   edge:
                     { "outcomes": [ { "prob": 1, "reward": r, "target": "n1" } ] }       -- deterministic
                     { "outcomes": [ { "prob": 0.75, ... }, { "prob": 0.25, ... } ] }      -- stochastic
                     {}                                                                     -- terminal

    layout         {node_name: (x, y)}       (float grid coords)
    nodeLabels     {node_name: label_string}  (shown on click/hover/always)
    nodeRewards    {node_name: reward}        (0 for most, 1 for target)
    nodeDisplay    "never" | "hover" | "click" | "always"
    edgeLabels     "reward" | {sourceName: "group label", "src__tgt": "edge label", ...}
    edgeDisplay    "never" | "hover" | "click" | "always"
    keys           {action_name: keycode}
    initial        str                        (starting node name)

    See jspsych-mouselab-mdp/core/config.js for the full schema."""

import json
import random
from pathlib import Path

def edge(*outcomes):
    """Build an edge dict with explicit named outcomes.
    Each outcome is a (prob, reward, target) tuple.
    edge((1, 0, "1"))                    -> deterministic
    edge((0.75, 5, "1"), (0.25, -3, "2")) -> stochastic
    """
    return {'outcomes': [{'prob': p, 'reward': r, 'target': t} for p, r, t in outcomes]}

def emoji():
    return random.choice('😀😃😄😁😆😅😂️😊😇🙂🙃😉😌😍😘😗😙😚😋😜😝😛🤑🤗🤓😎')

def grid(size):
    
    graph = {}
    layout = {}

    def reward():
        return random.randint(-9, 10)
    
    def state(x, y):
        name = '{}_{}'.format(x, y)
        if name in graph:
            return name

        graph[name] = {}
        layout[name] = [x, y]
        if y < size:
            graph[name]['down'] = edge((1, reward(), state(x, y+1)))
        if x < size:
            graph[name]['right'] = edge((1, reward(), state(x+1, y)))
        return name

    state(0, 0)

    return {
        'stateLabels': {s: emoji() for s in layout},
        'graph': graph,
        'layout': layout,
        'initial': '0_0',
    }

def grid_trials():
    yield {
        **grid(2),
        'centerMessage': '<b>Hover rewards</b>',
        'edgeDisplay': 'hover',
        'playerImage': 'static/images/oski.png',
        'playerImageScale': 0.1
    }
    yield {
        **grid(3),
        'centerMessage': '<b>Clickable states</b>',
        'edgeDisplay': False,
        'stateDisplay': 'click',
        'playerImage': 'static/images/spider.png'
    }
    yield {
        'centerMessage': '<b>Fully observable</b>',
        **grid(2),
    }

def fancy_trials():
    graph, layout = build('heart', size=2)
    yield {
        'graph': graph,
        'layout': layout,
        # 'stateLabels': dict(zip(graph.keys(), graph.keys())),
        'playerImageScale': 0.2,
        'size': 90,
        # 'stateRewards': {k: random.randint(-9, 9) for k in graph},
        # 'stateLabels': 'reward',
        'stateDisplay': 'click',
        'edgeDisplay': 'never',
        'initial': '0'
    }


def all_trials():
    return debug_trials()


def debug_trials():
    shapes = [
        ('binary_tree', {'levels': 4}, 'Binary tree', {'A': 65, 'B': 66}, 'A or B'),
        ('ternary_tree', {'levels': 4}, 'Ternary tree', {'A': 65, 'B': 66, 'C': 67}, 'A, B, or C'),
        ('trellis', {'depth': 3, 'width': 2}, 'Trellis w=2', {'A': 65, 'B': 66}, 'A or B'),
        ('trellis', {'depth': 3, 'width': 3}, 'Trellis w=3', {'A': 65, 'B': 66, 'C': 67}, 'A, B, or C'),
    ]
    combos = [
        # ('never', 'never'),
        # ('click', 'click'),
        ('hover', 'hover'),
        # ('always', 'always'),
    ]
    for shape_name, kwargs, title, keys, key_help in shapes:
        for node_disp, edge_disp in combos:
            graph, layout, labels, node_rewards = build(shape_name, reward_placement='node', **kwargs)
            labels = {k: f"node_{k}" for k in labels}
            group_labels = {}
            edge_labels = {}
            action_labels = {}
            group_idx = 0
            for s, actions in graph.items():
                if actions:
                    group_labels[s] = f"group_{group_idx}"
                    group_idx += 1
                first_action = next(iter(actions)) if actions else None
                stoch_idx = 0
                if first_action and isinstance(actions[first_action], dict) and len(actions[first_action].get('outcomes', [])) > 1:
                    for outcome in actions[first_action]['outcomes']:
                        eid = f"{s}_{stoch_idx}"
                        edge_labels[eid] = f"edge_{stoch_idx}"
                        for a in actions:
                            action_labels[f"{eid}_{a}"] = f"action_{a}_edge_{stoch_idx}"
                        stoch_idx += 1
                for a in actions:
                    edge_labels[f"{s}_{a}"] = f"edge_{s}_{a}"
            yield {
                'graph': graph,
                'layout': layout,
                'nodeLabels': labels,
                'nodeRewards': node_rewards,
                'groupLabels': group_labels,
                'edgeLabels': edge_labels,
                'actionLabels': action_labels,
                'nodeDisplay': node_disp,
                'edgeDisplay': edge_disp,
                'keys': keys,
                'centerMessage': f'<b>{title}</b><br>{node_disp} nodes / {edge_disp} edges — choose {key_help}',
                'lowerMessage': f'Press {key_help} to move.',
                'playerImage': 'static/images/plane.png',
                'playerImageScale': 0.12,
                'initial': '0',
            }


def main():

    trials = list(all_trials())
    outfile = Path(__file__).resolve().parents[1] / 'static/json/trials.json'
    with open(outfile, 'w+') as f:
        json.dump(trials, f)

    print('wrote {} trials to {}'.format(len(trials), outfile))



import numpy as np
import itertools as it
from scipy.io import savemat
import os
import json
from collections import defaultdict

from toolz import *

# ---------- Constructing environments ---------- #
DIRECTIONS = ('up', 'right', 'down', 'left')
ACTIONS = dict(zip(DIRECTIONS, it.count()))


BRANCH_DIRS = {
    2: {'up': ('right', 'left'),
        'right': ('up', 'down'),
        'down': ('right', 'left'),
        'left': ('up', 'down'),
        'all': ('right', 'left')},
    3: {'up': ('up', 'right', 'left'),
        'right': ('up', 'right', 'down'),
        'down': ('right', 'down', 'left'),
        'left': ('up', 'down', 'left'),
        'all': DIRECTIONS}
}

def move_xy(x, y, direction, dist=1):
    return {
        'right': (x+dist, y),
        'left': (x-dist, y),
        'down': (x, y+dist),
        'up': (x, y-dist),
    }.get(direction)



    
class Layouts:

    def cross(depth):
        graph = {}
        layout = {}
        names = it.count()

        def direct(prev):
            if prev == 'all':
                yield from DIRECTIONS
            else:
                yield prev
        
        def node(d, x, y, prev_dir):
            r = 0  # reward is 0 for now
            name = str(next(names))
            layout[name] = (x, y)
            graph[name] = {}
            if d > 0:
                for direction in direct(prev_dir):
                    x1, y1 = move_xy(x, y, direction, 1)
                    graph[name][direction] = edge((1, 0, node(d-1, x1, y1, direction)))
                                            
            return name
        
        node(depth, 0, 0, 'all')
        return graph, layout


    def tree(branch, depth, first='up', **kwargs):
        graph = {}
        layout = {}
        names = it.count()

        def dist(d):
            if branch == 3:
                return 2 ** (d - 1)
            else:
                return 2 ** (d/2 - 0.5)

        def node(d, x, y, prev_dir):
            r = 0  # reward is 0 for now
            name = str(next(names))
            layout[name] = (x, y)
            graph[name] = {}
            if d > 0:
                for direction in BRANCH_DIRS[branch][prev_dir]:
                    x1, y1 = move_xy(x, y, direction, dist(branch, d))
                    graph[name][direction] = edge((1, 0, node(d-1, x1, y1, direction)))
                                            
            return name

        node(depth, 0, 0, first)
        return graph, layout


    def binary_tree(levels=4, reward_placement='none'):
        graph = {}
        layout = {}
        labels = {}
        leaf_rewards = {}
        leaf_names = []
        names = it.count()

        def reward():
            return 1

        def node(level, x, y):
            name = str(next(names))
            layout[name] = (x, y)
            labels[name] = emoji()
            graph[name] = {}
            if level == levels - 1:
                leaf_names.append(name)
                leaf_rewards[name] = None
                return name
            if level < levels - 1:
                spread = 2 ** (levels - level - 2)
                upper = node(level + 1, x + 1, y - spread)
                lower = node(level + 1, x + 1, y + spread)
                graph[name]['A'] = edge(
                    (0.75, leaf_rewards.get(upper), upper),
                    (0.25, leaf_rewards.get(lower), lower),
                )
                graph[name]['B'] = edge(
                    (0.25, leaf_rewards.get(upper), upper),
                    (0.75, leaf_rewards.get(lower), lower),
                )
            return name

        node(0, 0, 0)
        if leaf_names:
            has_node = reward_placement in ('node', 'both')
            has_edge = reward_placement in ('edge', 'both')
            if has_node or has_edge:
                winner = random.choice(leaf_names)
                rv = reward()
            if has_node:
                leaf_rewards[winner] = rv
            if has_edge:
                for actions in graph.values():
                    for edge_obj in actions.values():
                        for outcome in edge_obj.get('outcomes', []):
                            if outcome['target'] == winner:
                                outcome['reward'] = rv
        for actions in graph.values():
            for edge_obj in actions.values():
                for outcome in edge_obj.get('outcomes', []):
                    if outcome['reward'] is None:
                        outcome['reward'] = 0
        for name in graph:
            if name not in leaf_rewards or leaf_rewards[name] is None:
                leaf_rewards[name] = 0
        return graph, layout, labels, leaf_rewards


    def ternary_tree(levels=4, reward_placement='none'):
        graph = {}
        layout = {}
        labels = {}
        leaf_rewards = {}
        leaf_names = []
        names = it.count()

        def reward():
            return 1

        def node(level, x, y):
            name = str(next(names))
            layout[name] = (x, y)
            labels[name] = emoji()
            graph[name] = {}
            if level == levels - 1:
                leaf_names.append(name)
                leaf_rewards[name] = None
                return name
            if level < levels - 1:
                spread = 2 ** (levels - level - 2)
                upper = node(level + 1, x + 1, y - spread)
                middle = node(level + 1, x + 1, y)
                lower = node(level + 1, x + 1, y + spread)
                r_u = leaf_rewards.get(upper)
                r_m = leaf_rewards.get(middle)
                r_l = leaf_rewards.get(lower)
                graph[name]['A'] = edge(
                    (0.60, r_u, upper),
                    (0.25, r_m, middle),
                    (0.15, r_l, lower),
                )
                graph[name]['B'] = edge(
                    (0.15, r_u, upper),
                    (0.60, r_m, middle),
                    (0.25, r_l, lower),
                )
                graph[name]['C'] = edge(
                    (0.25, r_u, upper),
                    (0.15, r_m, middle),
                    (0.60, r_l, lower),
                )
            return name

        node(0, 0, 0)
        if leaf_names:
            has_node = reward_placement in ('node', 'both')
            has_edge = reward_placement in ('edge', 'both')
            if has_node or has_edge:
                winner = random.choice(leaf_names)
                rv = reward()
            if has_node:
                leaf_rewards[winner] = rv
            if has_edge:
                for actions in graph.values():
                    for edge_obj in actions.values():
                        for outcome in edge_obj.get('outcomes', []):
                            if outcome['target'] == winner:
                                outcome['reward'] = rv
        for actions in graph.values():
            for edge_obj in actions.values():
                for outcome in edge_obj.get('outcomes', []):
                    if outcome['reward'] is None:
                        outcome['reward'] = 0
        for name in graph:
            if name not in leaf_rewards or leaf_rewards[name] is None:
                leaf_rewards[name] = 0
        return graph, layout, labels, leaf_rewards


    TRELLIS_PROBS = {
        2: [[0.75, 0.25],
            [0.25, 0.75]],
        3: [[0.60, 0.25, 0.15],
            [0.20, 0.60, 0.20],
            [0.15, 0.25, 0.60]],
    }

    def trellis(depth=3, width=2, reward_placement='none'):
        graph = {}
        layout = {}
        labels = {}
        leaf_rewards = {}
        leaf_names = []

        def reward():
            return 1

        action_names = [chr(65 + i) for i in range(width)]

        root = '0'
        layout[root] = (0, (width - 1) * 1.5)
        labels[root] = emoji()
        graph[root] = {}

        for layer in range(1, depth + 1):
            for idx in range(width):
                name = f'{layer}_{idx}'
                layout[name] = (layer, idx * 3)
                labels[name] = emoji()
                graph[name] = {}
                if layer == depth:
                    leaf_names.append(name)
                    leaf_rewards[name] = None

        probs = Layouts.TRELLIS_PROBS[width]
        for a_idx, a_name in enumerate(action_names):
            outcomes = []
            for t_idx in range(width):
                target = f'1_{t_idx}'
                r = leaf_rewards.get(target) if depth == 1 else None
                outcomes.append((probs[a_idx][t_idx], r, target))
            graph[root][a_name] = edge(*outcomes)

        for layer in range(1, depth):
            for idx in range(width):
                src = f'{layer}_{idx}'
                for a_idx, a_name in enumerate(action_names):
                    outcomes = []
                    for t_idx in range(width):
                        target = f'{layer + 1}_{t_idx}'
                        r = leaf_rewards.get(target) if layer + 1 == depth else None
                        outcomes.append((probs[a_idx][t_idx], r, target))
                    graph[src][a_name] = edge(*outcomes)

        if leaf_names:
            has_node = reward_placement in ('node', 'both')
            has_edge = reward_placement in ('edge', 'both')
            if has_node or has_edge:
                winner = random.choice(leaf_names)
                rv = reward()
            if has_node:
                leaf_rewards[winner] = rv
            if has_edge:
                for actions in graph.values():
                    for edge_obj in actions.values():
                        for outcome in edge_obj.get('outcomes', []):
                            if outcome['target'] == winner:
                                outcome['reward'] = rv
        return graph, layout, labels, leaf_rewards



    def heart(size):
        last_full = (size + 1)* 2

        def layer(h):            

            def full():
                x_max = 0.5 * h
                x = -x_max
                while x < x_max:
                    yield (x, h)
                    x += 1
            
            skip = h - last_full
            keep = size + 1 - skip
            if skip <= 0:
                yield from full()
            else:
                lay = drop(skip, full())
                yield from take(keep, lay)
                lay = drop(skip, lay)
                yield from take(keep, lay)

        all_nodes = concat(layer(h) for h in range(1, 3 * size + 3))
        layout = dict(zip(it.count(), all_nodes))
        r_layout = {v: k for k, v in layout.items()}

        graph = {n: {} for n in layout}
        for n, (x, y) in layout.items():
            left = r_layout.get((x - 0.5, y + 1))
            if left:
                graph[n]['left'] = edge((1, 0, left))
            right = r_layout.get((x + 0.5, y + 1))
            if right:
                graph[n]['right'] = edge((1, 0, right))

        return graph, layout


def rescale(layout):
    names, xy = zip(*layout.items())
    x, y = np.array(list(xy), dtype=float).T
    y *= -1
    x -= x.min()
    y -= y.min()
    y *= 0.5
    x *= 1.5
    return dict(zip(names, zip(x.tolist(), y.tolist())))


def build(kind, **kwargs):
    result = getattr(Layouts, kind)(**kwargs)
    if len(result) == 4:
        graph, layout, labels, rewards = result
        return graph, rescale(layout), labels, rewards
    if len(result) == 3:
        graph, layout, labels = result
        return graph, rescale(layout), labels, None
    graph, layout = result
    return graph, rescale(layout)



if __name__ == '__main__':
    main()
    # s = Stims().run()
