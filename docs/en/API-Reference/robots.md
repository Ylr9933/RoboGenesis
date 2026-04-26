---
title: Robots API
---

# Robots API

## Overview

This section documents the Robot layer APIs. Robots provide the physical abstraction for robotic arms with RMPFlow motion planning.

---

## GenericArm

**File:** `robots/base/generic_arm.py`

Base class for new robot implementations.

```python
from robots.base import GenericArm
class MyRobot(GenericArm):
    pass
```

### Class Constants

| Constant | Description | Type |
| --- | --- | --- |
| ARM_DOF | Number of arm joints | int |
| GRIPPER_DOF_INDICES | Gripper joint indices | List[int] |
| GRIPPER_CLOSED | Closed positions | float |
| TCP_OFFSET_LOCAL | TCP offset in local frame | np.ndarray |

### Methods

#### _resolve_usd_path()

```python
def _resolve_usd_path(self) -> Optional[str]:
    """
    Return USD path for robot asset.
    Returns None for CDN fallback.
    """
    return local_asset_path("robots/MyRobot.usd")
```

#### _attach_gripper()

```python
def _attach_gripper(self, stage):
    """Attach gripper to robot"""
    attach_robotiq_2f85(
        stage,
        robot_prim_path=self.prim_path_str,
        mount_link_path=f"{self.prim_path_str}/flange",
    )
```

#### initialize()

```python
def initialize(self, physics_sim_view=None):
    """Initialize robot joints and controllers"""
    pass
```

#### post_reset()

```python
def post_reset(self):
    """Reset robot to initial state"""
    pass
```

#### get_gripper_position()

```python
def get_gripper_position(self) -> np.ndarray:
    """
    Get TCP world position.
    Returns: [x, y, z] position
    """
```

---

## Robot Implementations

### Franka

**File:** `robots/franka/franka.py`

```python
from robots.franka.franka import Franka
robot = Franka(
    prim_path="/World/Franka",
    name="franka",
    physics_sim_view=physics_view,
)
```

| Property | Value |
| --- | --- |
| DOF | 7 |
| Gripper | Prismatic (built-in) |

### FR3

**File:** `robots/fr3/fr3.py`

```python
from robots.fr3.fr3 import FR3
robot = FR3(
    prim_path="/World/FR3",
    name="fr3",
    physics_sim_view=physics_view,
)
```

| Property | Value |
| --- | --- |
| DOF | 7 |
| Gripper | Prismatic (built-in) |

### UR5e

**File:** `robots/ur5e/ur5e.py`

```python
from robots.ur5e.ur5e import UR5e
robot = UR5e(
    prim_path="/World/UR5e",
    name="ur5e",
    physics_sim_view=physics_view,
)
```

| Property | Value |
| --- | --- |
| DOF | 6 |
| Gripper | Robotiq 2F-85 (revolute) |

### UR16e

**File:** `robots/ur16e/ur16e_arm.py`

```python
from robots.ur16e.ur16e_arm import UR16eArm
robot = UR16eArm(
    prim_path="/World/UR16e",
    name="ur16e",
    physics_sim_view=physics_view,
)
```

| Property | Value |
| --- | --- |
| DOF | 6 |
| Gripper | Robotiq 2F-85 (revolute) |

### Festo

**File:** `robots/festo/festo_arm.py`

```python
from robots.festo.festo_arm import FestoArm
robot = FestoArm(
    prim_path="/World/Festo",
    name="festo",
    physics_sim_view=physics_view,
)
```

| Property | Value |
| --- | --- |
| DOF | 6 |
| Gripper | Robotiq 2F-85 (revolute) |

### Piper

**File:** `robots/piper/piper.py`

```python
from robots.piper.piper import Piper
robot = Piper(
    prim_path="/World/Piper",
    name="piper",
    physics_sim_view=physics_view,
)
```

| Property | Value |
| --- | --- |
| DOF | 6 |
| Gripper | Prismatic (built-in) |

### Rizon4

**File:** `robots/rizon4/rizon4_arm.py`

```python
from robots.rizon4.rizon4_arm import Rizon4Arm
robot = Rizon4Arm(
    prim_path="/World/Rizon4",
    name="rizon4",
    physics_sim_view=physics_view,
)
```

| Property | Value |
| --- | --- |
| DOF | 7 |
| Gripper | Robotiq 2F-85 (revolute) |

---

## Utility Functions

### attach_robotiq_2f85()

**File:** `robots/base/init.py`

```python
from robots.base import attach_robotiq_2f85
def attach_robotiq_2f85(
    stage,
    robot_prim_path: str,
    mount_link_path: str,
):
    """Attach Robotiq 2F-85 gripper to robot"""
```

### local_asset_path()

```python
from robots.base import local_asset_path
def local_asset_path(relative_path: str) -> Optional[str]:
    """
    Resolve asset path with offline-first logic.
    Returns local path if exists, None otherwise.
    """
```

---

## Key Files

| File | Description |
| --- | --- |
| robots/base/generic_arm.py | GenericArm base class |
| robots/base/init.py | Utility functions |
| robots/franka/franka.py | Franka robot |
| robots/fr3/fr3.py | FR3 robot |
| robots/ur5e/ur5e.py | UR5e robot |
| robots/ur16e/ur16e_arm.py | UR16e robot |
| robots/festo/festo_arm.py | Festo robot |
| robots/piper/piper.py | Piper robot |
| robots/rizon4/rizon4_arm.py | Rizon4 robot |
| controllers/robot_configs/registry.py | Robot configuration registry |
