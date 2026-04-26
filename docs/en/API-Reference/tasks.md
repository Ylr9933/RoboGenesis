---
title: Tasks API
---

# Tasks API

## Overview

This section documents the Task layer APIs. Tasks handle scene state management and observation acquisition.

---

## BaseTask

**File:** `tasks/base_task.py`

Base class for all tasks.

```python
from tasks.base_task import BaseTask
class MyTask(BaseTask):
    pass
```

### Inheritance

```
BaseTask
├── SingleObjectTask
├── DualObjectTask
├── WorkflowTask
├── NavigationTask
└── MobilePickTask
```

### Key Methods

#### reset()

```python
def reset(self):
    """Reset scene for new episode"""
    raise NotImplementedError
```

#### get_observation()

```python
def get_observation(self) -> Dict:
    """
    Get current observation.
    Returns: {
        'images': {...},
        'robot_state': {...},
    }
    """
```

#### get_camera_data()

```python
def get_camera_data(self, camera_name: str) -> Dict:
    """
    Get image data from specific camera.
    Args:
        camera_name: Name of camera
    Returns: {'rgb': ..., 'depth': ...}
    """
```

#### get_object_position()

```python
def get_object_position(self, object_name: str) -> np.ndarray:
    """
    Get world position of object.
    Returns: [x, y, z] position
    """
```

#### get_robot_state()

```python
def get_robot_state(self) -> Dict:
    """
    Get robot state.
    Returns: {
        'joint_positions': [...],
        'joint_velocities': [...],
        'gripper_state': [...]
    }
    """
```

---

## WorkflowTask

**File:** `tasks/workflow_task.py`

Task for multi-step workflows.

```python
from tasks.workflow_task import WorkflowTask
task = WorkflowTask(cfg, sim_config)
```

### Additional Methods

#### get_geometry_center()

```python
def get_geometry_center(self, object_name: str) -> np.ndarray:
    """Get object geometry center position"""
```

#### get_object_xform_position()

```python
def get_object_xform_position(self, object_name: str) -> np.ndarray:
    """Get object transform position"""
```

#### get_scene_object()

```python
def get_scene_object(self, name: str) -> Dict:
    """Get scene object by name"""
```

---

## Task Configuration

```yaml
task:
  max_steps: 1000
  obj_paths:
    - path: "/World/object"
      position_range:
        x: [0.2, 0.3]
        y: [-0.1, 0.1]
        z: [0.8, 0.8]
      material: "plastic"
  cameras_names: ["camera_1"]
  cameras:
    - prim_path: "/World/Camera1"
      name: "camera_1"
      resolution: [256, 256]
      image_type: "rgb"
```

---

## Key Files

| File | Description |
| --- | --- |
| tasks/base_task.py | Base task class |
| tasks/single_object_task.py | Single object task |
| tasks/dual_object_task.py | Dual object task |
| tasks/workflow_task.py | Workflow task |
| tasks/navigation_task.py | Navigation task |
| tasks/mobile_pick_task.py | Mobile pick task |
