---
title: Franka Panda
---

# Franka Panda

## Overview

Franka Panda is the default research robot in RoboGenesis. It is a 7-DOF collaborative arm with a built-in parallel jaw gripper.

- **Robot:** Franka Panda
- **RoboGenesis Support:** Default research platform
- **DOF:** 7

---

## Specifications

| Property | Value |
| --- | --- |
| DOF | 7 |
| Payload | 3 kg |
| Reach | 855 mm |
| Gripper Type | Prismatic (built-in) |
| Gripper Stroke | 0-0.08 m |
| Position Repeatability | ±0.05 mm |

---

## Robot Class

**File:** `robots/franka/franka.py`

```python
from robots.franka.franka import Franka
robot = Franka(
    prim_path="/World/Franka",
    name="franka",
    physics_sim_view=physics_view,
)
```

---

## Configuration

```yaml
robot:
  type: "franka"
  position: [-0.4, -0, 0.71]
  press_z_tcp_offset: 0.031
```

---

## RMPFlow Configuration

**Files:**

- `robots/franka/rmpflow/franka_rmpflow_config.yaml`
- `robots/franka/rmpflow/robot_description.yaml`

**Joint Limits:**

```yaml
joint_limits:
  position_lower: [-2.8973, -2.6180, -2.8973, -2.8973, -2.8973, -3.8223, -2.8973]
  position_upper: [2.8973, 2.6180, 2.8973, 2.8973, 2.8973, 0.0873, 2.8973]
```

---

## Default Home Pose

```python
default_q = [0.0, -0.785, 0.0, -2.356, 0.0, 1.571, 0.785]  # 7 joints
```

---

## Gripper Configuration

```python
GRIPPER_DOF_INDICES = [7, 8]      # Gripper joints
GRIPPER_OPEN = [0.04, 0.04]       # Open positions (meters)
GRIPPER_CLOSED = [0.0, 0.0]       # Closed positions
GRIPPER_MAX_WIDTH = 0.08           # Maximum opening
```

---

## Usage

### Run with Default Config

```bash
python main.py --config-name atomic_skills/pick
```

### Run with Franka-specific Config

```bash
python main.py --config-name atomic_skills/franka/pick
```

---

## Key Files

| Purpose | File |
| --- | --- |
| Robot class | robots/franka/franka.py |
| RMPFlow controller | robots/franka/rmpflow_controller.py |
| URDF | robots/franka/lula_franka_gen.urdf |
| RMPFlow config | robots/franka/rmpflow/franka_rmpflow_config.yaml |
| Robot description | robots/franka/rmpflow/robot_description.yaml |
