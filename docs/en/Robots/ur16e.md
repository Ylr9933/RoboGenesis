---
title: UR16e
---

# UR16e

## Overview

UR16e is a 6-DOF industrial collaborative robot from Universal Robots with higher payload (16kg) and Robotiq 2F-85 gripper.

- **Robot:** UR16e
- **Manufacturer:** Universal Robots
- **DOF:** 6
- **Payload:** 16 kg
- **Gripper:** Robotiq 2F-85

---

## Specifications

| Property | Value |
| --- | --- |
| DOF | 6 |
| Payload | 16 kg |
| Reach | 900 mm |
| Gripper | Robotiq 2F-85 |

---

## Robot Class

**File:** `robots/ur16e/ur16e_arm.py`

```python
from robots.ur16e.ur16e_arm import UR16eArm
robot = UR16eArm(
    prim_path="/World/UR16e",
    name="ur16e",
    physics_sim_view=physics_view,
)
```

---

## Configuration

```yaml
robot:
  type: "ur16e"
  position: [-0.5, 0, 0.71]
  press_z_tcp_offset: 0.025
```

---

## Default Home Pose

```python
default_q = [0.0, -1.571, 0.0, -1.571, 0.0, 0.0]
```

---

## Gripper Configuration

Same as UR5e (Robotiq 2F-85):

```python
GRIPPER_TYPE = "revolute"
GRIPPER_DOF_INDICES = [6]
GRIPPER_OPEN = [0.0]
GRIPPER_CLOSED = [0.8]
GRIPPER_MAX_WIDTH = 0.085
```

---

## Usage

```bash
python main.py --config-name atomic_skills/ur16e/pick
```

---

## Key Files

| Purpose | File |
| --- | --- |
| Robot class | robots/ur16e/ur16e_arm.py |
| RMPFlow controller | robots/ur16e/rmpflow_controller.py |
| URDF | robots/ur16e/ur16e.urdf |
