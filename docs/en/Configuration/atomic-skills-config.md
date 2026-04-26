---
title: Atomic Skills Configuration
---

# Atomic Skills Configuration

## Overview

This page documents the YAML configuration format for atomic skill configs.

---

## Config Structure

```yaml
# config/atomic_skills/pick.yaml

name: atomic_pick
task_type: "workflow"
controller_type: "workflow"
mode: "collect"
usd_path: "assets/chemistry_lab/pick_task/scene.usd"
task:
  max_steps: 1000
  obj_paths:
    - path: "/World/conical_bottle02"
      position_range:
        x: [0.22, 0.32]
        y: [-0.07, 0.03]
        z: [0.80, 0.80]
      material: "plastic"
  max_episodes: 100
  cameras_names: ["camera_1", "camera_2"]
  cameras:
    - prim_path: "/World/Camera1"
      name: "camera_1"
      translation: [2, 0, 2]
      resolution: [256, 256]
      focal_length: 6
      orientation: [0.61237, 0.35355, 0.35355, 0.61237]
      image_type: "rgb"
robot:
  type: "franka"
  position: [-0.4, -0, 0.71]
collector:
  type: "default"
  compression: null
```

---

## Pick Config

**File:** `config/atomic_skills/pick.yaml`

```yaml
name: atomic_pick
task:
  max_steps: 1000
  obj_paths:
    - path: "/World/conical_bottle02"
      position_range:
        x: [0.22, 0.32]
        y: [-0.07, 0.03]
        z: [0.80, 0.80]
robot:
  type: "franka"
  position: [-0.4, -0, 0.71]
```

### Key Parameters

| Parameter | Description |
| --- | --- |
| name | Task name (atomic_pick) |
| task_type | Task type (workflow) |
| controller_type | Controller type (workflow) |
| mode | Mode (collect or infer) |
| usd_path | Path to scene USD file |
| max_steps | Max steps per episode |
| robot.type | Robot type (franka) |
| robot.position | Robot base position |

---

## Place Config

**File:** `config/atomic_skills/place.yaml`

```yaml
name: atomic_place
task:
  max_steps: 1000
  obj_paths:
    - path: "/World/conical_bottle02"
      position_range:
        x: [0.35, 0.45]
        y: [-0.10, 0.05]
        z: [0.80, 0.80]
```

---

## Pour Config

**File:** `config/atomic_skills/pour.yaml`

```yaml
name: atomic_pour
workflow:
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
```

---

## Robot-Specific Configs

```
config/atomic_skills/
├── pick.yaml              # Default (Franka)
├── place.yaml
├── pour.yaml
├── press.yaml
├── shake.yaml
├── stir.yaml
├── open_door.yaml
├── close_door.yaml
├── openclose.yaml
├── heat_liquid.yaml
├── franka/               # Franka overrides
│   ├── pick.yaml
│   └── place.yaml
├── fr3/                  # FR3 overrides
│   └── pick.yaml
├── ur5e/                 # UR5e overrides
│   └── pick.yaml
├── ur16e/                # UR16e overrides
│   └── pick.yaml
├── festo/                # Festo overrides
│   └── pick.yaml
├── piper/                # Piper overrides
│   └── pick.yaml
└── rizon4/               # Rizon4 overrides
    └── pick.yaml
```

### Example: Rizon4 Pick Config

**File:** `config/atomic_skills/rizon4/pick.yaml`

```yaml
defaults:
  - /atomic_skills/pick  # Inherit from default

robot:
  type: "rizon4"
  position: [0, 0, 0.71]
```

---

## Camera Configuration

```yaml
cameras_names: ["camera_1", "camera_2"]
cameras:
  - prim_path: "/World/Camera1"
    name: "camera_1"
    translation: [2, 0, 2]
    resolution: [256, 256]
    focal_length: 6
    orientation: [0.61237, 0.35355, 0.35355, 0.61237]
    image_type: "rgb"          # rgb, depth, pointcloud, segmentation
```

---

## Object Position Range

```yaml
obj_paths:
  - path: "/World/object"
    position_range:
      x: [0.20, 0.32]    # Min and max X
      y: [-0.07, 0.03]   # Min and max Y
      z: [0.80, 0.80]    # Min and max Z
```

---

## Key Files

| File | Description |
| --- | --- |
| config/atomic_skills/pick.yaml | Pick skill config |
| config/atomic_skills/place.yaml | Place skill config |
| config/atomic_skills/pour.yaml | Pour skill config |
| config/atomic_skills/stir.yaml | Stir skill config |
| config/atomic_skills/shake.yaml | Shake skill config |
| config/atomic_skills/press.yaml | Press skill config |
