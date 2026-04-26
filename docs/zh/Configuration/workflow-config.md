---
title: 工作流配置
---

# 工作流配置

## 概览

本文档介绍工作流配置的 YAML 格式。

---

## 基本结构

```yaml
# config/workflows/workflow_pick_pour.yaml

name: workflow_pick_pour
task_type: "workflow"
controller_type: "workflow"
mode: "collect"
usd_path: "assets/chemistry_lab/lab.usd"

workflow:
  table_prim_path: "/World/table"
  language_instruction: "Pick source beaker and pour into target"
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

task:
  max_steps: 2000
  max_episodes: 100

robot:
  type: "franka"
  position: [-0.4, -0, 0.71]

collector:
  type: "default"
```

---

## 工作流部分

### 场景物体

```yaml
scene_objects:
  - name: "object_name"           # 唯一标识符
    path: "/World/object_prim"    # USD 路径
    position_range:               # 随机位置范围
      x: [0.20, 0.32]
      y: [-0.07, 0.03]
      z: [0.80, 0.80]
    relative_to: "table"          # 参考坐标系（可选）
    parent_object: null           # 父物体（可选）
```

### 步骤

```yaml
steps:
  - skill: "pick"                 # 技能名称
    target_object: "source_beaker" # 目标物体名称
    params:                        # 技能特定参数
      end_effector_euler: [0, 90, 30]
      events_dt: [0.002, 0.002, 0.005, 0.02, 0.08, 0.01, 0.02]
```

---

## 示例工作流

### 拾取 + 倒液

文件：config/workflows/workflow_pick_pour.yaml

```yaml
name: workflow_pick_pour
workflow:
  language_instruction: "Pick source beaker and pour into target"
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
    - skill: "pour"
      target_object: "target_beaker"
```

### 加热 + 搅拌反应

文件：config/workflows/workflow_heat_stir_reaction.yaml

```yaml
name: workflow_heat_stir_reaction
workflow:
  language_instruction: "Heat and stir the reaction"
  scene_objects:
    - name: "beaker"
      path: "/World/beaker_1"
      position_range:
        x: [0.30, 0.40]
        y: [0.0, 0.10]
        z: [0.06, 0.065]
    - name: "hotplate"
      path: "/World/hotplate"
      position_range:
        x: [0.30, 0.40]
        y: [0.0, 0.10]
        z: [0.76, 0.76]
  steps:
    - skill: "pick"
      target_object: "beaker"
    - skill: "place"
      target_object: "hotplate"
    - skill: "press"
      target_object: "hotplate"
      params:
        press_force: 10.0
    - skill: "stir"
      target_object: "beaker"
      params:
        stir_duration: 5.0
```

### 清洁烧杯

文件：config/workflows/workflow_clean_beaker.yaml

```yaml
name: workflow_clean_beaker
workflow:
  language_instruction: "Clean the beaker using double rinse protocol"
  steps:
    - skill: "pick"
      target_object: "beaker"
    - skill: "move"
      target_position: [sink_x, sink_y, sink_z]
    - skill: "shake"
      params:
        amplitude: 0.1
        duration: 2.0
    - skill: "move"
      target_position: [rinse_x, rinse_y, rinse_z]
    - skill: "shake"
      params:
        amplitude: 0.1
        duration: 2.0
    - skill: "place"
      target_object: "rack"
```

---

## 机器人特定工作流

```
config/workflows/
├── workflow_pick_pour.yaml          # 默认配置 (Franka)
├── workflow_pick_pour_rizon4.yaml    # Rizon4 变体
├── workflow_pick_pour_ur5e.yaml      # UR5e 变体
├── workflow_heat_stir_reaction.yaml
├── workflow_heat_stir_reaction_franka.yaml
├── workflow_heat_stir_reaction_ur5e.yaml
├── workflow_clean_beaker.yaml
├── workflow_double_rinse_protocol.yaml
├── workflow_reagent_prep.yaml
├── workflow_sample_preparation.yaml
└── workflow_full_lab_protocol.yaml
```

---

## 可用技能

| 技能 | 描述 |
| --- | --- |
| pick | 抓取物体 |
| place | 放置物体 |
| pour | 倾倒液体 |
| stir | 搅拌 |
| shake | 摇动 |
| press | 按压 |
| pressZ | Z轴按压 |
| open | 打开 |
| close | 关闭 |
| move | 移动 |

---

## 关键文件

| 文件 | 描述 |
| --- | --- |
| config/workflows/workflow_pick_pour.yaml | 拾取+倒液工作流 |
| config/workflows/workflow_heat_stir_reaction.yaml | 加热+搅拌工作流 |
| config/workflows/workflow_clean_beaker.yaml | 清洁烧杯工作流 |
| config/workflows/workflow_double_rinse_protocol.yaml | 双冲洗协议 |
