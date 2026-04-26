---
title: Festo
---

# Festo

## Overview

Festo is a 6-DOF collaborative robot from Festo, equipped with a Robotiq 2F-85 gripper.

- **Robot:** Festo
- **Manufacturer:** Festo
- **DOF:** 6
- **Gripper:** Robotiq 2F-85

---

## Specifications

| Property | Value |
| --- | --- |
| DOF | 6 |
| Payload | 5 kg |
| Gripper | Robotiq 2F-85 |

---

## Robot Class

**File:** `robots/festo/festo_arm.py`

```python
from robots.festo.festo_arm import FestoArm
robot = FestoArm(
    prim_path="/World/Festo",
    name="festo",
    physics_sim_view=physics_view,
)
```

---

## Configuration

```yaml
robot:
  type: "festo"
  position: [0, 0, 0.71]
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
python main.py --config-name atomic_skills/festo/pick
```

---

## Key Files

| Purpose | File |
| --- | --- |
| Robot class | robots/festo/festo_arm.py |
| RMPFlow controller | robots/festo/rmpflow_controller.py |
| URDF | robots/festo/festo.urdf |
