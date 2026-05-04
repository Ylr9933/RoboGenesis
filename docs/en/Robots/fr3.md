---
title: FR3
---

# FR3

## Overview

FR3 (Franka Research 3) is a 7-DOF research-grade collaborative robot with built-in parallel jaw gripper. Similar to Panda but with updated hardware.

- **Robot:** FR3 (Franka Research 3)
- **DOF:** 7
- **Similar to:** Panda

---

## Specifications

| Property | Value |
| --- | --- |
| DOF | 7 |
| Payload | 3 kg |
| Reach | 855 mm |
| Gripper Type | Prismatic (built-in) |
| Interface | Franka Interface 2.0 |

---

## Robot Class

**File:** `robots/fr3/fr3.py`

```python
from robots.fr3.fr3 import FR3
robot = FR3(
    prim_path="/World/FR3",
    name="fr3",
    physics_sim_view=physics_view,
)
```

---

## Configuration

```yaml
robot:
  type: "fr3"
  position: [0, 0, 0.71]
  press_z_tcp_offset: 0.031
```

---

## Default Home Pose

```python
default_q = [0.0, -0.785, 0.0, -2.356, 0.0, 1.571, 0.785]
```

---

## Gripper Configuration

```python
GRIPPER_DOF_INDICES = [7, 8]
GRIPPER_OPEN = [0.04, 0.04]
GRIPPER_CLOSED = [0.0, 0.0]
GRIPPER_MAX_WIDTH = 0.08
```

---

## Usage

```bash
python main.py --config-name atomic_skills/fr3/pick
```

---

## Key Files

| Purpose | File |
| --- | --- |
| Robot class | robots/fr3/fr3.py |
| RMPFlow controller | robots/fr3/rmpflow_controller.py |
| URDF | robots/fr3/fr3.urdf |
| RMPFlow config | robots/fr3/rmpflow/ |
