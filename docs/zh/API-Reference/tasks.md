---
title: 任务 API
---

# 任务 API

## 概述

本节介绍任务层 API。任务负责场景状态管理和观测获取。

---

## BaseTask

文件: tasks/base_task.py

所有任务的基类。

```python
from tasks.base_task import BaseTask

class MyTask(BaseTask):
    pass
```

### 继承关系

```
BaseTask
├── SingleObjectTask
├── DualObjectTask
├── WorkflowTask
├── NavigationTask
└── MobilePickTask
```

### 关键方法

#### reset()

```python
def reset(self):
    """重置场景以开始新的 episode"""
    raise NotImplementedError
```

#### get_observation()

```python
def get_observation(self) -> Dict:
    """
    获取当前观测。
    返回: {
        'images': {...},
        'robot_state': {...},
    }
    """
```

#### get_camera_data()

```python
def get_camera_data(self, camera_name: str) -> Dict:
    """
    获取特定摄像头的图像数据。
    参数:
        camera_name: 摄像头名称
    返回: {'rgb': ..., 'depth': ...}
    """
```

#### get_object_position()

```python
def get_object_position(self, object_name: str) -> np.ndarray:
    """
    获取物体的世界坐标位置。
    返回: [x, y, z] 位置
    """
```

#### get_robot_state()

```python
def get_robot_state(self) -> Dict:
    """
    获取机器人状态。
    返回: {
        'joint_positions': [...],
        'joint_velocities': [...],
        'gripper_state': [...]
    }
    """
```

---

## WorkflowTask

文件: tasks/workflow_task.py

用于多步骤工作流的任务。

```python
from tasks.workflow_task import WorkflowTask

task = WorkflowTask(cfg, sim_config)
```

### 额外方法

#### get_geometry_center()

```python
def get_geometry_center(self, object_name: str) -> np.ndarray:
    """获取物体几何中心位置"""
```

#### get_object_xform_position()

```python
def get_object_xform_position(self, object_name: str) -> np.ndarray:
    """获取物体变换位置"""
```

#### get_scene_object()

```python
def get_scene_object(self, name: str) -> Dict:
    """根据名称获取场景物体"""
```

---

## 任务配置

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

## 关键文件

| 文件 | 描述 |
| --- | --- |
| tasks/base_task.py | 任务基类 |
| tasks/single_object_task.py | 单物体任务 |
| tasks/dual_object_task.py | 双物体任务 |
| tasks/workflow_task.py | 工作流任务 |
| tasks/navigation_task.py | 导航任务 |
| tasks/mobile_pick_task.py | 移动抓取任务 |
