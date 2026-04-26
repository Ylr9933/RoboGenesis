---
title: Robot Configs Reference
---

# Robot Configs Reference

## Overview

This page documents the ROBOT_CONFIGS registry that stores per-robot configuration parameters.

---

## ROBOT_CONFIGS

**File:** `controllers/robot_configs/registry.py`

```python
ROBOT_CONFIGS = {
    "franka": {...},
    "fr3": {...},
    "ur5e": {...},
    "ur16e": {...},
    "festo": {...},
    "piper": {...},
    "rizon4": {...},
}
```

---

## Per-Robot Parameters

### franka

```python
"franka": {
    "arm_dof": 7,
    "gripper_dof_indices": [7, 8],
    "gripper_type": "prismatic",
    "gripper_max_width": 0.08,
    "gripper_open_positions": [0.04, 0.04],
    "gripper_closed_positions": [0.0, 0.0],
    "lula_description_path": "franka/rmpflow/robot_description.yaml",
    "lula_urdf_path": "franka/lula_franka_gen.urdf",
    "press_z_tcp_offset": 0.031,
    "default_q": [0.0, -0.785, 0.0, -2.356, 0.0, 1.571, 0.785],
},
```

### fr3

```python
"fr3": {
    "arm_dof": 7,
    "gripper_dof_indices": [7, 8],
    "gripper_type": "prismatic",
    "gripper_max_width": 0.08,
    "gripper_open_positions": [0.04, 0.04],
    "gripper_closed_positions": [0.0, 0.0],
    "lula_description_path": "fr3/robot_description.yaml",
    "lula_urdf_path": "fr3/fr3.urdf",
    "press_z_tcp_offset": 0.031,
    "default_q": [0.0, -0.785, 0.0, -2.356, 0.0, 1.571, 0.785],
},
```

### ur5e

```python
"ur5e": {
    "arm_dof": 6,
    "gripper_dof_indices": [6],
    "gripper_type": "revolute",
    "gripper_max_width": 0.085,
    "gripper_open_positions": [0.0],
    "gripper_closed_positions": [0.8],
    "lula_description_path": "ur5e/robot_description.yaml",
    "lula_urdf_path": "ur5e/ur5e_robotiq85.urdf",
    "press_z_tcp_offset": 0.025,
    "default_q": [0.0, -1.571, 0.0, -1.571, 0.0, 0.0],
    "use_mimic_joints": True,
},
```

### ur16e

```python
"ur16e": {
    "arm_dof": 6,
    "gripper_dof_indices": [6],
    "gripper_type": "revolute",
    "gripper_max_width": 0.085,
    "gripper_open_positions": [0.0],
    "gripper_closed_positions": [0.8],
    "lula_description_path": "ur16e/robot_description.yaml",
    "lula_urdf_path": "ur16e/ur16e.urdf",
    "press_z_tcp_offset": 0.025,
    "default_q": [0.0, -1.571, 0.0, -1.571, 0.0, 0.0],
    "use_mimic_joints": True,
},
```

### festo

```python
"festo": {
    "arm_dof": 6,
    "gripper_dof_indices": [6],
    "gripper_type": "revolute",
    "gripper_max_width": 0.085,
    "gripper_open_positions": [0.0],
    "gripper_closed_positions": [0.8],
    "lula_description_path": "festo/robot_description.yaml",
    "lula_urdf_path": "festo/festo.urdf",
    "press_z_tcp_offset": 0.025,
    "default_q": [0.0, -1.571, 0.0, -1.571, 0.0, 0.0],
    "use_mimic_joints": True,
},
```

### piper

```python
"piper": {
    "arm_dof": 6,
    "gripper_dof_indices": [6],
    "gripper_type": "prismatic",
    "gripper_max_width": 0.08,
    "gripper_open_positions": [0.04],
    "gripper_closed_positions": [0.0],
    "lula_description_path": "piper/robot_description.yaml",
    "lula_urdf_path": "piper/piper.urdf",
    "press_z_tcp_offset": 0.025,
    "default_q": [0.0, -0.785, 0.0, -1.571, 0.0, 0.0],
    "usd_path": "robots/piper/piper_v2_noscale.usd",
},
```

### rizon4

```python
"rizon4": {
    "arm_dof": 7,
    "gripper_dof_indices": [7],
    "gripper_type": "revolute",
    "gripper_max_width": 0.085,
    "gripper_open_positions": [0.0],
    "gripper_closed_positions": [0.8],
    "lula_description_path": "rizon4/robot_description.yaml",
    "lula_urdf_path": "rizon4/rizon4.urdf",
    "press_z_tcp_offset": 0.025,
    "default_q": [0.0, -0.785, 0.0, -2.356, 0.0, 1.571, 0.785],
    "use_mimic_joints": True,
    "bent_elbow_q": [0.0, -0.5, 1.57, -2.0, 0.0, 1.0, 0.785],
},
```

---

## Parameter Reference

| Parameter | Description | Type |
| --- | --- | --- |
| arm_dof | Number of arm joints | int |
| gripper_type | "prismatic" or "revolute" | str |
| gripper_open_positions | Open joint positions | List[float] |
| lula_description_path | Path to robot description YAML | str |
| press_z_tcp_offset | TCP offset for press-Z skill | float |
| use_mimic_joints | Use mimic joints for Robotiq gripper | bool |
| default_q | Default joint configuration | List[float] |

---

## Adding a New Robot

Add entry to ROBOT_CONFIGS:

```python
"my_robot": {
    "arm_dof": 6,
    "gripper_type": "revolute",
    # ...
},
```

Register in factories/robot_factory.py:

```python
"my_robot": ("robots.my_robot.my_robot", "MyRobot"),
```

---

## Key Files

| File | Description |
| --- | --- |
| controllers/robot_configs/registry.py | Robot configuration registry |
| factories/robot_factory.py | Robot factory |
| robots/base/generic_arm.py | GenericArm base class |
