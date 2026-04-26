---
title: Tasks
---

# Tasks

## Overview

Tasks handle what the robot perceives (observation acquisition) and what objects exist in the scene (scene state management). Tasks provide the interface between the simulation scene and the controller layer.

---

## Task Hierarchy

```
BaseTask (tasks/base_task.py)
├── SingleObjectTask    # Single object operations (pick, open, close)
├── DualObjectTask      # Two object operations (pour, place)
├── WorkflowTask        # Multi-step workflows
├── NavigationTask      # Mobile robot navigation
└── MobilePickTask      # Mobile robot pick
```

---

## BaseTask

### Key Responsibilities

| Responsibility | Description |
| --- | --- |
| Camera setup | Initialize and configure cameras |
| Object management | Track scene objects |
| Material system | Apply object materials |
| State collection | Gather observations |

### Key Methods

| Method | Description |
| --- | --- |
| reset() | Reset scene for new episode |
| get_observation() | Get full observation dict |
| get_camera_data(camera_name) | Get image data from camera |
| get_object_position(object_name) | Get object world position |
| setup_cameras() | Initialize camera sensors |

---

## WorkflowTask

Extends BaseTask for multi-step workflows:

### Key Features

| Feature | Description |
| --- | --- |
| Scene object parsing | Parse workflow scene_objects config |
| Safe placement | Safe object placement verification |
| Dual position queries | Support for geometry and transform positions |
| Role aliases | Support for target/source role mapping |

---

## Task Configuration

```yaml
task:
  max_steps: 1000
  obj_paths:
    - path: "/World/conical_bottle02"
      position_range:
        x: [0.22, 0.32]
        y: [-0.07, 0.03]
        z: [0.80, 0.80]
      material: "plastic"
```

---

## Scene Objects

### Object Definition

```python
scene_objects = [
    {
        "name": "source_beaker",
        "path": "/World/beaker_2",
        "position_range": {
            "x": [0.20, 0.28],
            "y": [0.05, 0.12],
            "z": [0.06, 0.065]
        },
        "relative_to": "table",
        "parent_object": None
    },
    {
        "name": "target_beaker",
        "path": "/World/target_beaker",
        "position_range": {...}
    }
]
```

### Position Resolution

- `position_range`: Random position within bounds
- `relative_to`: Reference frame for position (e.g., "table")
- `parent_object`: Attach to another object

---

## Observation Acquisition

### Camera Setup

```yaml
cameras_names: ["camera_1", "camera_2"]
cameras:
  - prim_path: "/World/Camera1"
    name: "camera_1"
    translation: [2, 0, 2]
    resolution: [256, 256]
    focal_length: 6
    orientation: [0.61237, 0.35355, 0.35355, 0.61237]
    image_type: "rgb"  # rgb, depth, pointcloud, segmentation
```

### Get Camera Data

```python
# Get RGB image
rgb_image = task.get_camera_data("camera_1")["rgb"]

# Get depth image
depth_image = task.get_camera_data("camera_1")["depth"]
```

### Get Robot State

```python
joint_positions = task.get_robot_state()["joint_positions"]
gripper_state = task.get_robot_state()["gripper_state"]
```

---

## Task vs Controller Separation

```
Task Layer                    Controller Layer
(What is perceived)           (How to act)
─────────────────────────────────────────────
Camera setup ──────────────► Controller gets observation
Object positions ──────────► Controller computes action
Scene state queries ────────► Success checking
Episode reset ─────────────► Controller reset
```

---

## Key Files

| Purpose | File |
| --- | --- |
| Base task | tasks/base_task.py |
| Single object task | tasks/single_object_task.py |
| Dual object task | tasks/dual_object_task.py |
| Workflow task | tasks/workflow_task.py |
| Navigation task | tasks/navigation_task.py |
| Mobile pick task | tasks/mobile_pick_task.py |
