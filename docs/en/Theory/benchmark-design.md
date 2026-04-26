---
title: Benchmark Design
---

# Benchmark Design

## Overview

RoboGenesis provides a hierarchical benchmark for scientific embodied agents. This page explains the benchmark design rationale.

---

## Hierarchical Structure

```
Level 1: Atomic Skills (single manipulation)
├── pick, place, pour, stir, shake
├── press, open, close, move
│
Level 2: Skill Compositions (two-object operations)
├── pick + place (object transport)
├── pick + pour (liquid transfer)
├── stir + shake (mixing)
│
Level 3: Workflows (multi-step protocols)
├── heat + stir reaction
├── clean + rinse protocol
├── reagent preparation
│
Level 4: Long-Horizon Protocols (full lab procedures)
└── full_lab_protocol
```

---

## Level Definitions

### Level 1: Atomic Skills

Single manipulation primitives.

- pick: Grasp object
- place: Release object
- pour: Transfer liquid
- stir: Mix with rod
- shake: Agitate container
- press: Activate device
- open/close: Manipulate door/container

Evaluation: Per-skill success rate

### Level 2: Skill Compositions

Two-skill compositions requiring object tracking.

- pick + place: Object transport
- pick + pour: Liquid transfer
- stir + shake: Mixing protocol

Evaluation: End-to-end success

### Level 3: Workflows

Multi-step protocols (3-5 steps).

- heat + stir: Chemical reaction
- clean + rinse: Beaker cleaning
- reagent prep: Solution preparation

Evaluation: All steps successful

### Level 4: Long-Horizon

Complete lab procedures (6+ steps).

- full_lab_protocol: Complete experiment workflow

Evaluation: Full procedure success

---

## Evaluation Metrics

### Success Rate

```python
success_rate = successful_episodes / total_episodes
```

### Step Success

```python
step_success = successful_steps / total_steps
```

### Horizon

```python
avg_horizon = sum(episode_lengths) / num_episodes
```

---

## Task Complexity

| Level | Complexity |
| --- | --- |
| 1 | Fixed |
| 2 | Dynamic |
| 3 | Dynamic |
| 4 | Dynamic + relations |

---

## Generalization

### Position Generalization

Objects placed at random positions within specified ranges.

```yaml
position_range:
  x: [0.20, 0.32]  # Random X in range
  y: [-0.07, 0.03]  # Random Y in range
  z: [0.80, 0.80]   # Fixed Z
```

### Material Generalization

Objects with randomized materials for OOD robustness.

```yaml
materials: ["plastic", "metal", "glass"]
```

---

## Benchmark Tasks

### Chemistry Lab Tasks

| Task | Description |
| --- | --- |
| pick | Grasp object |
| pick + place | Object transport |
| pour | Liquid transfer |
| pick + pour | Two-container pour |
| heat_stir | Heat and stir reaction |
| pick + press + stir | Complex workflow |
| full_protocol | Complete experiment |

---

## Key Files

| 用途 | 文件 |
| --- | --- |
| 原子技能配置 | config/atomic_skills/ |
| 工作流配置 | config/workflows/ |
| 成功条件 | controllers/workflow/success_conditions/ |

---

## Citation

For detailed benchmark methodology, see:

```bibtex
@article{待补充,
author    = {待补充},
title     = {待补充},
journal   = {待补充},
year      = {待补充},
}
```
