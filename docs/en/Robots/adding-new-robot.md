---
title: Adding a New Robot
---

# Adding a New Robot

## Overview

This guide walks through adding a new robot platform to RoboGenesis. The minimum implementation requires ~30 lines of code and YAML configuration.

---

## Step-by-Step Guide

### Step 1: Create Robot Class

Create `robots/new_robot/new_robot.py`:

```python
import numpy as np
from robots.base import GenericArm, attach_robotiq_2f85, local_asset_path

class MyNewArm(GenericArm):
    ARM_DOF = 6
    GRIPPER_TYPE = "revolute"
    GRIPPER_DOF_INDICES = [6]
    GRIPPER_OPEN = [0.0]
    GRIPPER_CLOSED = [0.8]
    GRIPPER_MAX_WIDTH = 0.085
    TCP_OFFSET_LOCAL = np.array([0.0, 0.0, 0.15])

    def _resolve_usd_path(self):
        # Offline-first: use local if exists, else None (CDN fallback)
        return local_asset_path("robots/MyNewArm.usd")

    def _attach_gripper(self, stage):
        attach_robotiq_2f85(
            stage,
            robot_prim_path=self.prim_path_str,
            mount_link_path=f"{self.prim_path_str}/flange",
        )
```

### Step 2: Create init.py

Create `robots/new_robot/__init__.py`:

```python
from .my_new_arm import MyNewArm
```

### Step 3: Register in Robot Registry

Edit `controllers/robot_configs/registry.py`:

```python
ROBOT_CONFIGS = {
    # ... existing robots ...

    "my_new_arm": {
        "arm_dof": 6,
        "gripper_type": "revolute",
        "gripper_dof_indices": [6],
        "gripper_open_positions": [0.0],
        "gripper_max_width": 0.085,
        "gripper_frame_suffix": "/flange",
        "lula_description_path": "my_new_arm/lula_description.yaml",
        "lula_urdf_path": "my_new_arm/my_new_arm.urdf",
        "rmpflow_controller_class": "robots.my_new_arm.rmpflow_controller.RMPFlowController",
    },
}
```

### Step 4: Register in Robot Factory

Edit `factories/robot_factory.py`:

```python
_CLASS_NAME_MAP = {
    # ... existing robots ...

    "my_new_arm": ("robots.my_new_arm.my_new_arm", "MyNewArm"),
}
```

### Step 5: Create RMPFlow Configuration

Create `robots/new_robot/rmpflow/` directory with:

- `new_robot_rmpflow_config.yaml`
- `new_robot_robot_description.yaml`

### Step 6: Create Config File

Create `config/atomic_skills/my_new_arm/pick.yaml`:

```yaml
defaults:
  - /atomic_skills/pick  # Inherit from default

robot:
  type: "my_new_arm"
  position: [0, 0, 0.71]
```

### Step 7: Verify Registration

```bash
python scripts/check_registrations.py
```

**Expected output:**

```
OK: 8 robots in _CLASS_NAME_MAP, 8 in ROBOT_CONFIGS — all mappings resolve
```

---

## Gripper Types

### Prismatic (Built-in)

For robots with built-in parallel jaw gripper:

```python
GRIPPER_TYPE = "prismatic"
GRIPPER_DOF_INDICES = [7, 8]  # Two finger joints
GRIPPER_OPEN = [0.04, 0.04]    # Meters
GRIPPER_CLOSED = [0.0, 0.0]
```

### Revolute (Robotiq 2F-85)

For robots using Robotiq 2F-85:

```python
GRIPPER_TYPE = "revolute"
GRIPPER_DOF_INDICES = [6]     # Single DOF (mimic joints)
GRIPPER_OPEN = [0.0]          # Radians
GRIPPER_CLOSED = [0.8]
```

---

## Class Constants Reference

| Constant | Example Value |
| --- | --- |
| ARM_DOF | 7 |
| GRIPPER_TYPE | "revolute" or "prismatic" |
| GRIPPER_DOF_INDICES | [7, 8] or [6] |
| GRIPPER_OPEN | [0.04, 0.04] or [0.0] |
| GRIPPER_CLOSED | [0.0, 0.0] or [0.8] |
| GRIPPER_MAX_WIDTH | 0.085 |
| TCP_OFFSET_LOCAL | np.array([0.0, 0.0, 0.15]) |

---

## Offline Asset Resolution

Use local_asset_path() for offline-first asset loading:

```python
def _resolve_usd_path(self):
    return local_asset_path("robots/MyNewArm.usd")
    # Returns:
    # - /data/xuezirui/RoboGenesis/RoboGenesis_xzr_v3/assets/robots/MyNewArm.usd if exists
    # - None otherwise (falls back to Isaac Sim CDN)
```

---

## Migration Guide

To migrate existing robots to use GenericArm:

1. Make existing class inherit from GenericArm
2. Implement _resolve_usd_path() (offline-first)
3. Replace inline _attach_robotiq_2f85 with call to attach_robotiq_2f85()
4. Run `python scripts/check_registrations.py` to verify

**Benefits:**

- Before: 5-7 files, 100+ lines of boilerplate
- After: 2 files, ~30 lines + config

---

## Key Files

| Purpose | File |
| --- | --- |
| Base class | robots/base/generic_arm.py |
| Base utilities | robots/base/__init__.py |
| Extension guide | docs/en/Robots/adding-new-robot.md |
| Robot registry | controllers/robot_configs/registry.py |
| Robot factory | factories/robot_factory.py |
| Registration checker | scripts/check_registrations.py |
