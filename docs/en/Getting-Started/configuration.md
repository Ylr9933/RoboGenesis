---
title: Configuration
---

# Configuration

## Hydra Configuration

RoboGenesis uses Hydra for hierarchical configuration management. All configurations are YAML-based and can be overridden via command line or config files.

---

## Configuration Structure

```
config/
├── atomic_skills/           # Atomic skill configs
│   ├── pick.yaml            # Default (Franka)
│   ├── place.yaml
│   ├── pour.yaml
│   ├── press.yaml
│   ├── shake.yaml
│   ├── stir.yaml
│   ├── open_door.yaml
│   ├── close_door.yaml
│   ├── openclose.yaml
│   └── heat_liquid.yaml
│   ├── franka/              # Robot-specific overrides
│   ├── fr3/
│   ├── ur5e/
│   ├── ur16e/
│   ├── festo/
│   ├── piper/
│   └── rizon4/
│       └── pick.yaml       # e.g., Rizon4 pick config
├── workflows/               # Multi-step workflow configs
│   ├── workflow_pick_pour.yaml
│   ├── workflow_clean_beaker.yaml
│   ├── workflow_heat_stir_reaction.yaml
│   ├── workflow_double_rinse_protocol.yaml
│   ├── workflow_reagent_prep.yaml
│   ├── workflow_sample_preparation.yaml
│   └── workflow_full_lab_protocol.yaml
├── object_properties.yaml   # Per-object geometry
├── simulation.yaml          # Physics parameters
└── composite_skills.yaml    # Skill compositions
```

---

## Config File Structure

A typical atomic skill config looks like this:

```yaml
# config/atomic_skills/pick.yaml

# Basic configuration
name: atomic_pick
task_type: "workflow"
controller_type: "workflow"
mode: "collect"                    # "collect" or "infer"

# Scene configuration
usd_path: "assets/chemistry_lab/pick_task/scene.usd"

# Task parameters
task:
  max_steps: 1000
  obj_paths:
    - path: "/World/conical_bottle02"
      position_range:
        x: [0.22, 0.32]
        y: [-0.07, 0.03]
        z: [0.80, 0.80]

# Data collection
max_episodes: 100

# Camera configuration
cameras_names: ["camera_1", "camera_2"]
cameras:
  - prim_path: "/World/Camera1"
    name: "camera_1"
    translation: [2, 0, 2]
    resolution: [256, 256]
    focal_length: 6
    orientation: [0.61237, 0.35355, 0.35355, 0.61237]
    image_type: "rgb"

# Robot configuration
robot:
  type: "franka"
  position: [-0.4, -0, 0.71]

# Data collector
collector:
  type: "default"
  compression: null
```

---

## Configuration Override

### Command Line Override

```bash
# Override robot type
python main.py --config-name atomic_skills/pick --override robot.type=rizon4

# Override multiple params
python main.py --config-name atomic_skills/pick --override robot.type=fr3 robot.position=[0,0,0.8]

# Override task parameters
python main.py --config-name workflows/workflow_pick_pour --override task.max_steps=2000
```

### Config File Override

Create a robot-specific config in `config/atomic_skills/rizon4/pick.yaml`:

```yaml
# config/atomic_skills/rizon4/pick.yaml

defaults:
  - /atomic_skills/pick  # Inherit from default

robot:
  type: "rizon4"
  position: [0, 0, 0.71]  # Override
```

---

## Workflow Config Structure

```yaml
# config/workflows/workflow_pick_pour.yaml

name: workflow_pick_pour
task_type: "workflow"
controller_type: "workflow"
mode: "collect"

workflow:
  table_prim_path: "/World/table"
  language_instruction: "Pick up source beaker and pour into target"
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
        pre_offset_x: 0.05
        pre_offset_z: 0.05
        after_offset_z: 0.4
    - skill: "pour"
      target_object: "target_beaker"
      params:
        events_dt: [0.006, 0.002, 0.009, 0.01, 0.009, 0.01]
        pour_speed: -1
```

---

## Object Properties Config

```yaml
# config/object_properties.yaml

conical_bottle02:
  geometry_type: "cylinder"
  dimensions: [0.03, 0.10]  # radius, height
  gripper_offset: 0.025
  mass: 0.5

beaker_2:
  geometry_type: "cylinder"
  dimensions: [0.04, 0.10]
  gripper_offset: 0.02
  mass: 0.3
```

---

## Simulation Config

```yaml
# config/simulation.yaml

physics:
  dt: 0.005                  # Simulation time step
  substeps: 10               # Physics substeps
  gravity: [0, 0, -9.81]     # Gravity vector

rendering:
  width: 1920
  height: 1080
  fps: 60
```

---

## Key Config Parameters

| Parameter | Description |
| --- | --- |
| mode | "collect" or "infer" |
| robot.type | Robot type (franka, ur5e, etc.) |
| robot.position | Robot base position |
| task.max_steps | Maximum steps per episode |
| max_episodes | Number of episodes to run |
| usd_path | Path to scene USD file |
| cameras | Camera configurations |
| infer.policy_model_path | Path to trained model |

---

## Config Best Practices

- **Start with defaults** — Use the built-in Franka configs as templates
- **Robot-specific overrides** — Create per-robot configs for different platforms
- **Hierarchical inheritance** — Use Hydra's defaults list for config reuse
- **Command-line overrides** — Prefer CLI overrides for quick experiments
- **Validate before run** — Use `python main.py --config-name config --help` to validate

---

## Next Steps

| Topic | Next Step |
| --- | --- |
| Run first episode | [First Episode](./first-episode.md) |
| Understand robots | [Robots](../../Core-Concepts/robots.md) |
| Learn about skills | [Skills](../../Skills/atomic-skills.md) |
| Build workflows | [Workflow Configuration](../../Configuration/workflow-config.md) |
