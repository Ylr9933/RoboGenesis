---
title: 原子技能配置
---

# 原子技能配置

## 概览

本文档介绍原子技能配置的 YAML 格式。

---

## 配置结构

```yaml
# config/atomic_skills/pick.yaml

name: atomic_pick
task_type: "workflow"
controller_type: "workflow"
mode: "collect"
usd_path: "assets/chemistry_lab/pick_task/scene.usd"

task:
  max_steps: 1000
  obj_paths:
    - path: "/World/conical_bottle02"
      position_range:
        x: [0.22, 0.32]
        y: [-0.07, 0.03]
        z: [0.80, 0.80]
      material: "plastic"

max_episodes: 100

cameras_names: ["camera_1", "camera_2"]
cameras:
  - prim_path: "/World/Camera1"
    name: "camera_1"
    translation: [2, 0, 2]
    resolution: [256, 256]
    focal_length: 6
    orientation: [0.61237, 0.35355, 0.35355, 0.61237]
    image_type: "rgb"

robot:
  type: "franka"
  position: [-0.4, -0, 0.71]

collector:
  type: "default"
  compression: null
```

---

## 拾取配置

文件：config/atomic_skills/pick.yaml

```yaml
name: atomic_pick
task:
  max_steps: 1000
  obj_paths:
    - path: "/World/conical_bottle02"
      position_range:
        x: [0.22, 0.32]
        y: [-0.07, 0.03]
        z: [0.80, 0.80]
robot:
  type: "franka"
  position: [-0.4, -0, 0.71]
```

### 关键参数

| 参数 | 值 | 描述 |
| --- | --- | --- |
| name | atomic_pick | 任务名称 |
| task_type | workflow | 任务类型 |
| controller_type | workflow | 控制器类型 |
| mode | "collect" 或 "infer" | 运行模式 |
| usd_path | assets/.../scene.usd | 场景资源路径 |
| max_steps | 1000 | 每回合最大步数 |
| robot.type | franka | 机器人类型 |
| robot.position | [-0.4, -0, 0.71] | 机器人基座位置 |

---

## 放置配置

文件：config/atomic_skills/place.yaml

```yaml
name: atomic_place
task:
  max_steps: 1000
  obj_paths:
    - path: "/World/conical_bottle02"
      position_range:
        x: [0.35, 0.45]
        y: [-0.10, 0.05]
        z: [0.80, 0.80]
```

---

## 倒液配置

文件：config/atomic_skills/pour.yaml

```yaml
name: atomic_pour
workflow:
  scene_objects:
    - name: "source_beaker"
      path: "/World/beaker_2"
      position_range:
        x: [0.20, 0.28]
        y: [0.05, 0.12]
        z: [0.06, 0.065]
    - name: "target_beaker"
      path: "/World/target_beaker"
      position_range:
        x: [0.35, 0.45]
        y: [-0.10, 0.05]
        z: [0.06, 0.065]
  steps:
    - skill: "pick"
      target_object: "source_beaker"
      params:
        end_effector_euler: [0, 90, 30]
        events_dt: [0.002, 0.002, 0.005, 0.02, 0.08, 0.01, 0.02]
    - skill: "pour"
      target_object: "target_beaker"
      params:
        events_dt: [0.006, 0.002, 0.009, 0.01, 0.009, 0.01]
        pour_speed: -1
```

---

## 机器人特定配置

```
config/atomic_skills/
├── pick.yaml              # 默认配置 (Franka)
├── place.yaml
├── pour.yaml
├── press.yaml
├── shake.yaml
├── stir.yaml
├── open_door.yaml
├── close_door.yaml
├── openclose.yaml
├── heat_liquid.yaml
├── franka/               # Franka 专用配置
│   ├── pick.yaml
│   └── place.yaml
├── fr3/                  # FR3 专用配置
│   └── pick.yaml
├── ur5e/                 # UR5e 专用配置
│   └── pick.yaml
├── ur16e/                # UR16e 专用配置
│   └── pick.yaml
├── festo/                # Festo 专用配置
│   └── pick.yaml
├── piper/                # Piper 专用配置
│   └── pick.yaml
└── rizon4/               # Rizon4 专用配置
    └── pick.yaml
```

### 示例：Rizon4 拾取配置

文件：config/atomic_skills/rizon4/pick.yaml

```yaml
defaults:
  - /atomic_skills/pick  # 继承默认配置

robot:
  type: "rizon4"
  position: [0, 0, 0.71]
```

---

## 相机配置

```yaml
cameras_names: ["camera_1", "camera_2"]
cameras:
  - prim_path: "/World/Camera1"
    name: "camera_1"
    translation: [2, 0, 2]
    resolution: [256, 256]
    focal_length: 6
    orientation: [0.61237, 0.35355, 0.35355, 0.61237]
    image_type: "rgb"          # rgb, depth, pointcloud, segmentation
```

---

## 物体位置范围

```yaml
obj_paths:
  - path: "/World/object"
    position_range:
      x: [0.20, 0.32]    # X 最小值和最大值
      y: [-0.07, 0.03]   # Y 最小值和最大值
      z: [0.80, 0.80]     # Z 最小值和最大值
```

---

## 关键文件

| 文件 | 描述 |
| --- | --- |
| config/atomic_skills/pick.yaml | 拾取配置 |
| config/atomic_skills/place.yaml | 放置配置 |
| config/atomic_skills/pour.yaml | 倒液配置 |
| config/atomic_skills/stir.yaml | 搅拌配置 |
| config/atomic_skills/shake.yaml | 摇动配置 |
| config/atomic_skills/press.yaml | 按压配置 |
