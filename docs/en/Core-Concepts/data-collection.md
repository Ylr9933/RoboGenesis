---
title: Data Collection
---

# Data Collection

## Overview

RoboGenesis collects demonstration data in HDF5 format for policy learning. Data collection uses scripted controllers in collect mode to execute predefined skill sequences.

---

## Data Collector Architecture

```
DataCollector (base)
├── DefaultDataCollector   # Standard HDF5 writing
└── MockCollector         # For testing
```

---

## HDF5 Episode Structure

Each episode file contains:

```
episode_000.h5/
├── observation/
│   ├── images/
│   │   ├── camera_1_rgb        # [H, W, 3] uint8
│   │   └── camera_2_rgb        # [H, W, 3] uint8
│   └── robot_state/
│       ├── joint_positions     # [7] float32
│       ├── joint_velocities    # [7] float32
│       └── gripper_state       # [2] float32
├── action                     # [7+2] float32 (joints + gripper)
├── timestamp                  # float64
└── success                    # bool

episode_001.h5/
...
```

---

## DataCollector

**File:** `data_collectors/data_collector.py`

### Key Methods

| Method | Description |
| --- | --- |
| start_new_episode() | Start new episode |
| write_step(obs, action) | Record step data |
| finish_episode(success) | Finalize episode |
| resume() | Resume interrupted episode |

### Usage

```python
from data_collectors.data_collector import DataCollector
collector = DataCollector(cfg)
collector.start_new_episode()
for step in range(max_steps):
    obs = task.get_observation()
    action = controller.forward()
    collector.write_step(obs, action)
    if controller.is_done():
        success = check_success()
        collector.finish_episode(success)
        break
```

---

## Configuration

```yaml
collector:
  type: "default"           # or "mock"
  compression: null           # or "gzip"
  chunk_size: 100            # HDF5 chunk size
  output_dir: "outputs/collect/"
```

---

## Multi-Camera Support

```yaml
cameras_names: ["camera_1", "camera_2", "camera_3"]
cameras:
  - prim_path: "/World/Camera1"
    name: "camera_1"
    image_type: "rgb"
  - prim_path: "/World/Camera2"
    name: "camera_2"
    image_type: "depth"
  - prim_path: "/World/Camera3"
    name: "camera_3"
    image_type: "pointcloud"
```

All cameras are recorded in the HDF5 file under `observation/images/`.

---

## Data Types

| Type | Description | Format |
| --- | --- | --- |
| RGB Image | Color image | uint8 [H, W, 3] |
| Depth Image | Depth values | float32 [H, W] |
| Point Cloud | XYZ + RGB | float32 [N, 6] |
| Joint Positions | Robot joint positions | float32 [DOF] |
| Joint Velocities | Robot joint velocities | float32 [DOF] |
| Action | Policy action | float32 [DOF + gripper] |

---

## Data Conversion

Convert RoboGenesis format to LeRobot format:

```bash
python scripts/convert_labsim_data_to_lerobot.py \
    --data_dir outputs/collect/xxx/dataset \
    --num_processes 8 \
    --fps 60 \
    --repo_name RoboGenesis/level3-pick
```

**Parameters:**

- `--data_dir`: Path to collected HDF5 episodes
- `--num_processes`: Parallel conversion workers
- `--fps`: Frames per second for timestamp
- `--repo_name`: HuggingFace dataset name

---

## Pre-collected Data

Pre-collected datasets available on HuggingFace.

**Dataset structure:**

```
RoboGenesis-Dataset/
├── level1_pick/
│   ├── meta.json
│   └── episodes/
│       ├── episode_000.h5
│       └── ...
├── level2_pour/
├── level3_workflow/
└── level4_long_horizon/
```

---

## Key Files

| Purpose | File |
| --- | --- |
| Data collector | data_collectors/data_collector.py |
| Mock collector | data_collectors/mock_collector.py |
| Collector factory | factories/collector_factory.py |
| Conversion script | scripts/convert_labsim_data_to_lerobot.py |
