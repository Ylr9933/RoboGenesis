---
title: Rizon4
---

# Rizon4

## Overview

Rizon4 is a 7-DOF collaborative robot from Flexiv with Robotiq 2F-85 gripper. Known for precision and smoothness.

- **Robot:** Rizon4
- **Manufacturer:** Flexiv
- **DOF:** 7
- **Gripper:** Robotiq 2F-85

---

## Specifications

| Property | Value |
| --- | --- |
| DOF | 7 |
| Payload | 4 kg |
| Reach | 900 mm |
| Gripper | Robotiq 2F-85 |

---

## Robot Class

**File:** `robots/rizon4/rizon4_arm.py`

```python
from robots.rizon4.rizon4_arm import Rizon4Arm
robot = Rizon4Arm(
    prim_path="/World/Rizon4",
    name="rizon4",
    physics_sim_view=physics_view,
)
```

---

## Configuration

```yaml
robot:
  type: "rizon4"
  position: [0, 0, 0.71]
  press_z_tcp_offset: 0.025
```

---

## Default Home Pose

```python
default_q = [0.0, -0.785, 0.0, -2.356, 0.0, 1.571, 0.785]
```

---

## Gripper Configuration

```python
GRIPPER_TYPE = "revolute"
GRIPPER_DOF_INDICES = [7]
GRIPPER_OPEN = [0.0]        # radians
GRIPPER_CLOSED = [0.8]      # radians
GRIPPER_MAX_WIDTH = 0.085   # meters
```

---

## Bent-Elbow Home Pose

For improved step-0 stability:

```python
# Alternative home pose for Rizon4
bent_elbow_q = [0.0, -0.5, 1.57, -2.0, 0.0, 1.0, 0.785]
```

---

## Usage

```bash
# Run pick with Rizon4
python main.py --config-name atomic_skills/rizon4/pick

# Run pick+pour workflow with Rizon4
python main.py --config-name workflows/workflow_pick_pour_rizon4
```

---

## Key Files

| Purpose | File |
| --- | --- |
| Robot class | robots/rizon4/rizon4_arm.py |
| RMPFlow controller | robots/rizon4/rmpflow_controller.py |
| URDF | robots/rizon4/rizon4.urdf |
| RMPFlow config | robots/rizon4/rmpflow/ |
