---
title: UR5e
---

# UR5e

## Overview

UR5e is a 6-DOF industrial collaborative robot from Universal Robots with a Robotiq 2F-85 adaptive gripper.

- **Robot:** UR5e
- **Manufacturer:** Universal Robots
- **DOF:** 6
- **Gripper:** Robotiq 2F-85

---

## Specifications

| Property | Value |
| --- | --- |
| DOF | 6 |
| Payload | 5 kg |
| Reach | 850 mm |
| Gripper | Robotiq 2F-85 |
| Repeatability | ±0.03 mm |

---

## Robot Class

**File:** `robots/ur5e/ur5e.py`

```python
from robots.ur5e.ur5e import UR5e
robot = UR5e(
    prim_path="/World/UR5e",
    name="ur5e",
    physics_sim_view=physics_view,
)
```

---

## Configuration

```yaml
robot:
  type: "ur5e"
  position: [-0.5, 0, 0.71]
  press_z_tcp_offset: 0.025
```

---

## Default Home Pose

```python
default_q = [0.0, -1.571, 0.0, -1.571, 0.0, 0.0]  # 6 joints
```

---

## Gripper Configuration

```python
GRIPPER_TYPE = "revolute"
GRIPPER_DOF_INDICES = [6]
GRIPPER_OPEN = [0.0]        # radians
GRIPPER_CLOSED = [0.8]      # radians
GRIPPER_MAX_WIDTH = 0.085   # meters
```

---

## Usage

```bash
python main.py --config-name atomic_skills/ur5e/pick
```

---

## Key Files

| Purpose | File |
| --- | --- |
| Robot class | robots/ur5e/ur5e.py |
| RMPFlow controller | robots/ur5e/rmpflow_controller.py |
| URDF | robots/ur5e/ur5e_robotiq85.urdf |
| Robotiq gripper | robots/ur5e/robotiq_2f85_adapter.py |
| Combined USD | robots/ur5e/ur5e_with_gripper.usd |
