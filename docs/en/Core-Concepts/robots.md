---
title: Robots
---

# Robots

## Overview

RoboGenesis supports 7 robot platforms across different manufacturers. Each robot is implemented as a Python class that inherits from either GenericArm (base class) or directly from Isaac Sim's Robot class.

---

## Supported Robots

| Robot | Gripper | Asset Source | DOF | Manufacturer |
| --- | --- | --- | --- | --- |
| Franka (Panda) | Prismatic (built-in) | Isaac Sim CDN | 7 | Franka Robotics |
| UR5e | Robotiq 2F-85 (revolute) | Isaac Sim CDN | 6 | Universal Robots |
| UR16e | Robotiq 2F-85 (revolute) | Isaac Sim CDN | 6 | Universal Robots |
| FR3 | Prismatic (built-in) | Isaac Sim CDN | 7 | Franka Robotics |
| Festo | Robotiq 2F-85 (revolute) | Isaac Sim CDN | 6 | Festo |
| Piper | Prismatic (built-in) | Isaac Sim CDN | 6 | AgileX |
| Rizon4 | Robotiq 2F-85 (revolute) | Isaac Sim CDN | 7 | Flexiv |

---

## Base Class: GenericArm

`robots/base/generic_arm.py` provides a reusable base class for new robot implementations.

### Key Class Constants

| Constant | Description |
| --- | --- |
| ARM_DOF | Number of arm degrees of freedom |
| GRIPPER_TYPE | Gripper type (prismatic or revolute) |
| GRIPPER_DOF_INDICES | Gripper joint indices |
| GRIPPER_OPEN | Open position values |
| GRIPPER_CLOSED | Closed position values |
| GRIPPER_MAX_WIDTH | Maximum gripper width |
| TCP_OFFSET_LOCAL | Tool center point offset |

### Key Methods

| Method | Description |
| --- | --- |
| _resolve_usd_path() | Return USD path for robot asset |
| _attach_gripper(stage) | Attach gripper to robot |
| initialize(physics_sim_view) | Initialize robot joints and controllers |
| post_reset() | Reset robot to initial state |
| get_gripper_position() | Get TCP world position |

---

## Robot Directory Structure

Each robot follows this pattern:

```
robots/<robot_name>/
├── <robot_name>.py           # Main robot class
├── __init__.py               # Exports robot class
├── rmpflow_controller.py     # RMPFlow motion planning
├── <robot_name>.urdf         # URDF for Lula/RMPFlow
├── lula_<robot_name>_gen.urdf # Generated URDF
└── rmpflow/                  # RMPFlow config
    ├── _rmpflow_config.yaml
    └── _robot_description.yaml
```

---

## Robot Registry

All robots are registered in two places:

### 1. Controller Registry

**File:** `controllers/robot_configs/registry.py`

```python
ROBOT_CONFIGS = {
    "franka": {
        "arm_dof": 7,
        "gripper_dof_indices": [7, 8],
        "gripper_type": "prismatic",
        "gripper_max_width": 0.08,
        "lula_description_path": "franka/rmpflow/robot_description.yaml",
        "lula_urdf_path": "franka/lula_franka_gen.urdf",
        "press_z_tcp_offset": 0.031,
    },
    # ... other robots
}
```

### 2. Robot Factory

**File:** `factories/robot_factory.py`

```python
_CLASS_NAME_MAP = {
    "franka": ("robots.franka.franka", "Franka"),
    "fr3": ("robots.fr3.fr3", "FR3"),
    # ... other robots
}
```

---

## Gripper Types

### Prismatic (Parallel Jaw)

- Used by: Franka, FR3, Piper
- Linear motion, symmetric fingers
- Configured with joint position limits
- Built-in gripper (no external attachment)

### Revolute (Robotiq 2F-85)

- Used by: UR5e, UR16e, Rizon4, Festo
- 1-DOF with 5 mimic joints for 4-bar linkage
- Uses use_mimic_joints=True in ParallelGripper
- Requires attach_robotiq_2f85() helper

---

## Utility Functions

### attach_robotiq_2f85()

Attaches a Robotiq 2F-85 gripper to a robot:

```python
from robots.base import attach_robotiq_2f85
def _attach_gripper(self, stage):
    attach_robotiq_2f85(
        stage,
        robot_prim_path=self.prim_path_str,
        mount_link_path=f"{self.prim_path_str}/flange",
    )
```

### local_asset_path()

Offline-first asset path resolution:

```python
from robots.base import local_asset_path
def _resolve_usd_path(self):
    return local_asset_path("robots/MyNewArm.usd")
    # Returns local path if exists, None otherwise (falls back to CDN)
```

---

## Per-Robot Configuration

### [Franka](../Robots/franka.md)

### [Fr3](../Robots/fr3.md)

### [Rizon4](../Robots/rizon4.md)

### [UR5e](../Robots/ur5e.md)

### [UR16e](../Robots/ur16e.md)

### [Piper](../Robots/piper.md)

### [Festo](../Robots/festo.md)

---

## Adding a New Robot

See [Adding a New Robot](../../Robots/adding-new-robot.md) for a detailed tutorial.

---

## Key Files

| Purpose | File |
| --- | --- |
| Base class | robots/base/generic_arm.py |
| Base utilities | robots/base/__init__.py |
| Robot registry | controllers/robot_configs/registry.py |
| Robot factory | factories/robot_factory.py |
| Franka impl | robots/franka/franka.py |
| FR3 impl | robots/fr3/fr3.py |
| UR5e impl | robots/ur5e/ur5e.py |
| UR16e impl | robots/ur16e/ur16e_arm.py |
| Rizon4 impl | robots/rizon4/rizon4_arm.py |
| Festo impl | robots/festo/festo_arm.py |
| Piper impl | robots/piper/piper.py |
