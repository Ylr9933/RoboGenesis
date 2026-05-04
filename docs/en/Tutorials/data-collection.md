---
title: Data Collection
---

# Data Collection

## Overview

This tutorial walks through collecting demonstration data using scripted controllers. Data is stored in HDF5 format for policy learning.

---

## Prerequisites

- RoboGenesis installed (see [Installation](../../Getting-Started/installation.md))
- Environment activated (conda activate RoboGenesis)
- Isaac Sim 5.1 accessible

---

## Step 1: Select Configuration

### Atomic Skills

Single-skill data collection:

```bash
# Franka (default)
python main.py --config-name atomic_skills/pick

# Rizon4
python main.py --config-name atomic_skills/rizon4/pick

# UR5e
python main.py --config-name atomic_skills/ur5e/pick

# FR3
python main.py --config-name atomic_skills/fr3/pick
```

### Workflows

Multi-step data collection:

```bash
# Pick + Pour
python main.py --config-name workflows/workflow_pick_pour

# Heat + Stir reaction
python main.py --config-name workflows/workflow_heat_stir_reaction

# Clean beaker
python main.py --config-name workflows/workflow_clean_beaker
```

---

## Step 2: Configure Collection

### Basic Config

```yaml
# config/atomic_skills/pick.yaml
mode: "collect"                    # Data collection mode
max_episodes: 100                  # Number of episodes

robot:
  type: "franka"
  position: [-0.4, -0, 0.71]

task:
  max_steps: 1000
  obj_paths:
    - path: "/World/conical_bottle02"
      position_range:
        x: [0.22, 0.32]
        y: [-0.07, 0.03]
        z: [0.80, 0.80]
```

### Camera Config

```yaml
cameras_names: ["camera_1", "camera_2"]
cameras:
  - prim_path: "/World/Camera1"
    name: "camera_1"
    translation: [2, 0, 2]
    resolution: [256, 256]
    focal_length: 6
    orientation: [0.61237, 0.35355, 0.35355, 0.61237]
    image_type: "rgb"
  - prim_path: "/World/Camera2"
    name: "camera_2"
    translation: [0, -2, 1.5]
    resolution: [256, 256]
    focal_length: 6
    orientation: [0.5, 0.5, 0.5, 0.5]
    image_type: "depth"
```

### Collector Config

```yaml
collector:
  type: "default"
  compression: null    # or "gzip"
  chunk_size: 100
```

---

## Step 3: Run Collection

```bash
python main.py --config-name atomic_skills/pick
```

**Expected output:**

```
[INFO] Loading scene from assets/chemistry_lab/...
[INFO] Robot initialized: franka
[INFO] DataCollector: Starting episode 1/100
[INFO] Skill execution: pick (phase 0/7)
[INFO] Episode 1 completed, success: True
[INFO] Data saved to: outputs/collect/2026.04.24/12.34.56_atomic_pick/
[INFO] Episode 2/100 completed, success: True
...
[INFO] Collection complete: 95/100 episodes successful (95%)
```

---

## Output Structure

```
outputs/collect/
└── 2026.04.24/
    └── 12.34.56_atomic_pick/
        ├── dataset/
        │   ├── episode_000.h5
        │   ├── episode_001.h5
        │   └── ...
        ├── success.csv            # Episode success log
        └── config.yaml           # Saved config
```

---

## HDF5 Episode Structure

```python
import h5py

with h5py.File("episode_000.h5", "r") as f:
    # Observation images
    print(f["observation/images/camera_1_rgb"].shape)   # (H, W, 3)
    print(f["observation/images/camera_2_rgb"].shape)   # (H, W, 3)

    # Robot state
    print(f["observation/robot_state/joint_positions"].shape)  # (7,)
    print(f["observation/robot_state/gripper_state"].shape)     # (2,)

    # Action
    print(f["action"].shape)  # (9,) - 7 joints + 2 gripper

    # Metadata
    print(f["timestamp"][()])  # float64
    print(f["success"][()])     # bool
```

---

## Resumable Collection

Use ResumableDataCollector to resume interrupted collection:

```python
collector = DataCollector(cfg)
collector.resume(output_dir)  # Continues from last episode
```

---

## Multi-Robot Collection

For each robot type, create a separate config:

```bash
# Collect with Franka
python main.py --config-name atomic_skills/franka/pick

# Collect with Rizon4
python main.py --config-name atomic_skills/rizon4/pick
```

Output directories are separated by robot type:

```
outputs/collect/2026.04.24/
├── 12.34.56_atomic_pick/        # Franka
└── 12.45.00_atomic_pick_rizon4/  # Rizon4
```

---

## Data Conversion

Convert to LeRobot format for training:

```bash
python scripts/convert_labsim_data_to_lerobot.py \
    --data_dir outputs/collect/2026.04.24/12.34.56_atomic_pick/dataset \
    --num_processes 8 \
    --fps 60 \
    --repo_name RoboGenesis/level1-pick
```

**Parameters:**

<div style="text-align: center; margin: 1.5em 0;" markdown>

| Parameter | Description |
| --- | --- |
| --data_dir | Path to collected HDF5 episodes |
| --num_processes | Parallel conversion workers |
| --fps | Frames per second for timestamp |
| --repo_name | HuggingFace dataset name |

</div>

---

## Best Practices

- **Collect diverse data:** Vary object positions across episodes
- **Check success rate:** Target >90% success before training
- **Multiple cameras:** Use 2+ cameras for better observation
- **Balance dataset:** Collect similar episodes for each skill
- **Validate recordings:** Check HDF5 files after collection

---

## Next Steps

<div style="text-align: center; margin: 1.5em 0;" markdown>

| Goal | Next Tutorial |
| --- | --- |
| Train a policy | [Training](./training.md) |
| Run inference | [Inference](./inference.md) |
| Custom workflow | [Custom Workflow](./custom-workflow.md) |

</div>
