---
title: 任务
---

# 任务

## 概览

任务负责机械臂感知什么（观测获取）和场景中存在哪些物体（场景状态管理）。任务提供了模拟场景与控制器层之间的接口。

---

## 任务层次结构

```text
BaseTask (tasks/base_task.py)
├── SingleObjectTask    # 单物体操作（拾取、打开、关闭）
├── DualObjectTask      # 双物体操作（倾倒、放置）
├── WorkflowTask        # 多步骤工作流
├── NavigationTask      # 移动机械臂导航
└── MobilePickTask      # 移动机械臂拾取
```

---

## BaseTask

### 主要职责

<div style="text-align: center; margin: 1.5em 0;" markdown>

| 职责 | 描述 |
| --- | --- |
| 相机设置 | 配置 RGB、深度、点云、分割相机 |
| 物体管理 | 位置初始化、随机化 |
| 材质系统 | 材质循环用于分布外泛化 |
| 状态收集 | 关节位置、相机数据、物体位置 |

</div>

### 主要方法

<div style="text-align: center; margin: 1.5em 0;" markdown>

| 方法 | 描述 |
| --- | --- |
| reset() | 重置场景 |
| get_observation() | 获取当前观测 |
| get_camera_data(camera_name) | 获取指定相机数据 |
| get_object_position(object_name) | 获取物体位置 |
| setup_cameras() | 设置相机 |

</div>

---

## WorkflowTask

扩展 BaseTask 以支持多步骤工作流：

### 主要特性

<div style="text-align: center; margin: 1.5em 0;" markdown>

| 特性 | 描述 |
| --- | --- |
| 场景物体解析 | 解析工作流配置中的物体 |
| 安全放置 | 检查放置位置是否有效 |
| 双重位置查询 | 支持多种位置查询方式 |
| 角色别名 | 支持物体角色别名 |

</div>

---

## 任务配置

```yaml
task:
  max_steps: 1000
  obj_paths:
    - path: "/World/conical_bottle02"
      position_range:
        x: [0.22, 0.32]
        y: [-0.07, 0.03]
        z: [0.80, 0.80]
      material: "plastic"
```

---

## 场景物体

### 物体定义

```python
scene_objects = [
    {
        "name": "source_beaker",
        "path": "/World/beaker_2",
        "position_range": {
            "x": [0.20, 0.28],
            "y": [0.05, 0.12],
            "z": [0.06, 0.065]
        },
        "relative_to": "table",
        "parent_object": None
    },
    {
        "name": "target_beaker",
        "path": "/World/target_beaker",
        "position_range": {...}
    }
]
```

### 位置解析

- position_range：边界内的随机位置
- relative_to：位置参考坐标系（例如 "table"）
- parent_object：附加到另一个物体

---

## 观测获取

### 相机设置

```yaml
cameras_names: ["camera_1", "camera_2"]
cameras:
  - prim_path: "/World/Camera1"
    name: "camera_1"
    translation: [2, 0, 2]
    resolution: [256, 256]
    focal_length: 6
    orientation: [0.61237, 0.35355, 0.35355, 0.61237]
    image_type: "rgb"  # rgb, depth, pointcloud, segmentation
```

### 获取相机数据

```python
# 获取 RGB 图像
rgb_image = task.get_camera_data("camera_1")["rgb"]

# 获取深度图像
depth_image = task.get_camera_data("camera_1")["depth"]
```

### 获取机械臂状态

```python
joint_positions = task.get_robot_state()["joint_positions"]
gripper_state = task.get_robot_state()["gripper_state"]
```

---

## 任务与控制器分离

```text
任务层                      控制器层
（感知什么）                （如何行动）
─────────────────────────────────────────────
相机设置 ──────────────► 控制器获取观测
物体位置 ──────────────► 控制器计算动作
场景状态查询 ──────────► 成功检查
回合重置 ─────────────► 控制器重置
```

---

## 关键文件

<div style="text-align: center; margin: 1.5em 0;" markdown>

| 用途 | 文件 |
| --- | --- |
| 基础任务 | tasks/base_task.py |
| 单物体任务 | tasks/single_object_task.py |
| 双物体任务 | tasks/dual_object_task.py |
| 工作流任务 | tasks/workflow_task.py |
| 导航任务 | tasks/navigation_task.py |
| 移动拾取任务 | tasks/mobile_pick_task.py |

</div>
