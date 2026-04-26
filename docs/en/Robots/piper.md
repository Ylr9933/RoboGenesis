---
title: Piper
---

# Piper

## Overview

Piper is a 6-DOF perception-enabled manipulator from AgileX with built-in parallel jaw gripper. Uses local USD asset.

- **Robot:** Piper
- **Manufacturer:** AgileX
- **DOF:** 6
- **Gripper:** Prismatic (built-in)
- **Asset:** Local USD

---

## Specifications

| Property | Value |
| --- | --- |
| DOF | 6 |
| Payload | 3 kg |
| Gripper | Prismatic (built-in) |
| Asset | Local USD |

---

## Robot Class

**File:** `robots/piper/piper.py`

```python
from robots.piper.piper import Piper
robot = Piper(
    prim_path="/World/Piper",
    name="piper",
    physics_sim_view=physics_view,
)
```

---

## Configuration

```yaml
robot:
  type: "piper"
  position: [0, 0, 0.71]
  press_z_tcp_offset: 0.025
```

---

## Default Home Pose

```python
default_q = [0.0, -0.785, 0.0, -1.571, 0.0, 0.0]
```

---

## Gripper Configuration

```python
GRIPPER_TYPE = "prismatic"
GRIPPER_DOF_INDICES = [6]
GRIPPER_OPEN = [0.04]       # meters
GRIPPER_CLOSED = [0.0]
GRIPPER_MAX_WIDTH = 0.08
```

---

## Usage

```bash
python main.py --config-name atomic_skills/piper/pick
```

---

## Key Files

| Purpose | File |
| --- | --- |
| Robot class | robots/piper/piper.py |
| RMPFlow controller | robots/piper/rmpflow_controller.py |
| URDF | robots/piper/piper.urdf |
| Local USD | robots/piper/piper_v2_noscale.usd |
| Lula config | robots/piper/lula/ |
