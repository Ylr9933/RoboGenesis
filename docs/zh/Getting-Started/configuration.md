---
title: 配置指南
---

# 配置指南

## Hydra 配置系统

RoboGenesis 使用 Hydra 进行分层配置管理。所有配置都基于 YAML，可通过命令行或配置文件进行覆盖。

---

## 配置结构

```
config/
├── atomic_skills/           # 原子技能配置
│   ├── pick.yaml            # 默认（Franka）
│   ├── place.yaml
│   ├── pour.yaml
│   ├── press.yaml
│   ├── shake.yaml
│   ├── stir.yaml
│   ├── open_door.yaml
│   ├── close_door.yaml
│   ├── openclose.yaml
│   └── heat_liquid.yaml
│   ├── franka/              # 机器人特定覆盖
│   ├── fr3/
│   ├── ur5e/
│   ├── ur16e/
│   ├── festo/
│   ├── piper/
│   └── rizon4/
│       └── pick.yaml       # 例如 Rizon4 pick 配置
├── workflows/               # 多步骤工作流配置
│   ├── workflow_pick_pour.yaml
│   ├── workflow_clean_beaker.yaml
│   ├── workflow_heat_stir_reaction.yaml
│   ├── workflow_double_rinse_protocol.yaml
│   ├── workflow_reagent_prep.yaml
│   ├── workflow_sample_preparation.yaml
│   └── workflow_full_lab_protocol.yaml
├── object_properties.yaml   # 逐物体几何参数
├── simulation.yaml          # 物理参数
└── composite_skills.yaml    # 技能组合
```

---

## 配置文件结构

典型的原子技能配置如下：

```yaml
# config/atomic_skills/pick.yaml

# 基本配置
name: atomic_pick
task_type: "workflow"
controller_type: "workflow"
mode: "collect"                    # "collect" 或 "infer"

# 场景配置
usd_path: "assets/chemistry_lab/pick_task/scene.usd"

# 任务参数
task:
  max_steps: 1000
  obj_paths:
    - path: "/World/conical_bottle02"
      position_range:
        x: [0.22, 0.32]
        y: [-0.07, 0.03]
        z: [0.80, 0.80]

# 数据采集
max_episodes: 100

# 相机配置
cameras_names: ["camera_1", "camera_2"]
cameras:
  - prim_path: "/World/Camera1"
    name: "camera_1"
    translation: [2, 0, 2]
    resolution: [256, 256]
    focal_length: 6
    orientation: [0.61237, 0.35355, 0.35355, 0.61237]
    image_type: "rgb"

# 机器人配置
robot:
  type: "franka"
  position: [-0.4, -0, 0.71]

# 数据采集器
collector:
  type: "default"
  compression: null
```

---

## 配置覆盖

### 命令行覆盖

```bash
# 覆盖机器人类型
python main.py --config-name atomic_skills/pick --override robot.type=rizon4

# 覆盖多个参数
python main.py --config-name atomic_skills/pick --override robot.type=fr3 robot.position=[0,0,0.8]

# 覆盖任务参数
python main.py --config-name workflows/workflow_pick_pour --override task.max_steps=2000
```

### 配置文件覆盖

在 config/atomic_skills/rizon4/pick.yaml 创建机器人特定配置：

```yaml
# config/atomic_skills/rizon4/pick.yaml

defaults:
  - /atomic_skills/pick  # 继承默认配置

robot:
  type: "rizon4"
  position: [0, 0, 0.71]  # 覆盖
```

---

## 工作流配置结构

```yaml
# config/workflows/workflow_pick_pour.yaml

name: workflow_pick_pour
task_type: "workflow"
controller_type: "workflow"
mode: "collect"

workflow:
  table_prim_path: "/World/table"
  language_instruction: "Pick up source beaker and pour into target"
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
        pre_offset_x: 0.05
        pre_offset_z: 0.05
        after_offset_z: 0.4
    - skill: "pour"
      target_object: "target_beaker"
      params:
        events_dt: [0.006, 0.002, 0.009, 0.01, 0.009, 0.01]
        pour_speed: -1
```

---

## 物体属性配置

```yaml
# config/object_properties.yaml

conical_bottle02:
  geometry_type: "cylinder"
  dimensions: [0.03, 0.10]  # 半径, 高度
  gripper_offset: 0.025
  mass: 0.5

beaker_2:
  geometry_type: "cylinder"
  dimensions: [0.04, 0.10]
  gripper_offset: 0.02
  mass: 0.3
```

---

## 仿真配置

```yaml
# config/simulation.yaml

physics:
  dt: 0.005                  # 仿真时间步长
  substeps: 10               # 物理子步数
  gravity: [0, 0, -9.81]     # 重力向量

rendering:
  width: 1920
  height: 1080
  fps: 60
```

---

## 关键配置参数

| 参数 | 描述 |
| --- | --- |
| mode | "collect" 或 "infer" |
| robot.type | 机器人类型 (franka, ur5e, etc.) |
| robot.position | 机器人基座位置 |
| task.max_steps | 每回合最大步数 |
| max_episodes | 采集回合数 |
| usd_path | 场景 USD 文件路径 |
| cameras | 相机配置 |
| infer.policy_model_path | 训练模型路径 |

---

## 配置最佳实践

- **从默认配置开始** — 使用内置的 Franka 配置作为模板
- **机器人特定覆盖** — 为不同平台创建逐机器人配置
- **分层继承** — 使用 Hydra 的 defaults 列表实现配置复用
- **命令行覆盖** — 对于快速实验优先使用 CLI 覆盖
- **运行前验证** — 使用 `python main.py --config-name config --help` 验证配置

---

## 下一步

| 主题 | 下一步 |
| --- | --- |
| 运行第一个 episode | [首次运行](./first-episode.md) |
| 了解机器人 | [机械臂](../../Core-Concepts/robots.md) |
| 学习技能 | [技能](../../Skills/atomic-skills.md) |
| 构建工作流 | [工作流配置](../../Configuration/workflow-config.md) |
