---
title: Workflow Configuration
---

# Workflow Configuration

## Overview

This page documents the YAML configuration format for workflow configs.

---

## Basic Structure

```yaml
# config/workflows/workflow_pick_pour.yaml

name: workflow_pick_pour
task_type: "workflow"
controller_type: "workflow"
mode: "collect"
usd_path: "assets/chemistry_lab/lab.usd"
workflow:
  table_prim_path: "/World/table"
  language_instruction: "Pick source beaker and pour into target"
  scene_objects:
    - name: "source_beaker"
      path: "/World/beaker_2"
      position_range:
        x: [0.20, 0.28]
        y: [0.05, 0.12]
        z: [0.06, 0.065]
    - name: "target_beaker"
      path: "/World/target_beaker"
      position_range:
        x: [0.35, 0.45]
        y: [-0.10, 0.05]
        z: [0.06, 0.065]
  steps:
    - skill: "pick"
      target_object: "source_beaker"
      params:
        end_effector_euler: [0, 90, 30]
        events_dt: [0.002, 0.002, 0.005, 0.02, 0.08, 0.01, 0.02]
    - skill: "pour"
      target_object: "target_beaker"
      params:
        events_dt: [0.006, 0.002, 0.009, 0.01, 0.009, 0.01]
        pour_speed: -1
task:
  max_steps: 2000
  max_episodes: 100
robot:
  type: "franka"
  position: [-0.4, -0, 0.71]
collector:
  type: "default"
```

---

## Workflow Section

### Scene Objects

```yaml
scene_objects:
  - name: "object_name"           # Unique identifier
    path: "/World/object_prim"    # USD prim path
    position_range:              # Random position range
      x: [0.20, 0.32]
      y: [-0.07, 0.03]
      z: [0.80, 0.80]
    relative_to: "table"         # Reference frame (optional)
    parent_object: null          # Parent object (optional)
```

### Steps

```yaml
steps:
  - skill: "pick"                # Skill name
    target_object: "source_beaker" # Target object name
    params:                       # Skill-specific parameters
      end_effector_euler: [0, 90, 30]
      events_dt: [0.002, 0.002, 0.005, 0.02, 0.08, 0.01, 0.02]
```

---

## Example Workflows

### Pick + Pour

**File:** `config/workflows/workflow_pick_pour.yaml`

```yaml
name: workflow_pick_pour
workflow:
  language_instruction: "Pick source beaker and pour into target"
  scene_objects:
    - name: "source_beaker"
      path: "/World/beaker_2"
      position_range:
        x: [0.20, 0.28]
        y: [0.05, 0.12]
        z: [0.06, 0.065]
    - name: "target_beaker"
      path: "/World/target_beaker"
      position_range:
        x: [0.35, 0.45]
        y: [-0.10, 0.05]
        z: [0.06, 0.065]
  steps:
    - skill: "pick"
      target_object: "source_beaker"
    - skill: "pour"
      target_object: "target_beaker"
```

### Heat + Stir Reaction

**File:** `config/workflows/workflow_heat_stir_reaction.yaml`

```yaml
name: workflow_heat_stir_reaction
workflow:
  language_instruction: "Heat and stir the reaction"
  scene_objects:
    - name: "beaker"
      path: "/World/beaker_1"
      position_range:
        x: [0.30, 0.40]
        y: [0.0, 0.10]
        z: [0.06, 0.065]
    - name: "hotplate"
      path: "/World/hotplate"
      position_range:
        x: [0.30, 0.40]
        y: [0.0, 0.10]
        z: [0.76, 0.76]
  steps:
    - skill: "pick"
      target_object: "beaker"
    - skill: "place"
      target_object: "hotplate"
    - skill: "press"
      target_object: "hotplate"
      params:
        press_force: 10.0
    - skill: "stir"
      target_object: "beaker"
      params:
        stir_duration: 5.0
```

### Clean Beaker

**File:** `config/workflows/workflow_clean_beaker.yaml`

```yaml
name: workflow_clean_beaker
workflow:
  language_instruction: "Clean the beaker using double rinse protocol"
  steps:
    - skill: "pick"
      target_object: "beaker"
    - skill: "move"
      target_position: [sink_x, sink_y, sink_z]
    - skill: "shake"
      params:
        amplitude: 0.1
        duration: 2.0
    - skill: "move"
      target_position: [rinse_x, rinse_y, rinse_z]
    - skill: "shake"
      params:
        amplitude: 0.1
        duration: 2.0
    - skill: "place"
      target_object: "rack"
```

---

## Robot-Specific Workflows

```
config/workflows/
├── workflow_pick_pour.yaml          # Default (Franka)
├── workflow_pick_pour_rizon4.yaml   # Rizon4 variant
├── workflow_pick_pour_ur5e.yaml     # UR5e variant
├── workflow_heat_stir_reaction.yaml
├── workflow_heat_stir_reaction_franka.yaml
├── workflow_heat_stir_reaction_ur5e.yaml
├── workflow_clean_beaker.yaml
├── workflow_double_rinse_protocol.yaml
├── workflow_reagent_prep.yaml
├── workflow_sample_preparation.yaml
└── workflow_full_lab_protocol.yaml
```

---

## Available Skills

| Skill | Description |
| --- | --- |
| pick | Pick up an object |
| place | Place an object |
| pour | Pour liquid |
| stir | Stir contents |
| shake | Shake object |
| press | Press button/switch |
| pressZ | Z-axis press |
| open | Open door/drawer |
| close | Close door/drawer |
| move | Move to position |

---

## Key Files

| File | Description |
| --- | --- |
| config/workflows/workflow_pick_pour.yaml | Pick and pour workflow |
| config/workflows/workflow_heat_stir_reaction.yaml | Heat and stir workflow |
| config/workflows/workflow_clean_beaker.yaml | Clean beaker workflow |
| config/workflows/workflow_double_rinse_protocol.yaml | Double rinse protocol |
