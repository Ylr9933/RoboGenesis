---
title: 自定义工作流
---

# 自定义工作流

## 概览

RoboGenesis 允许将原子技能组合成自定义工作流。本教程展示如何创建新的工作流配置。

---

## 工作流结构

工作流由以下部分组成：

- 场景物体：场景中的物体（烧杯、瓶子等）
- 步骤：要执行的有序技能列表

---

## 步骤 1: 定义场景物体

```yaml
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
```

---

## 步骤 2: 添加技能步骤

```yaml
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

## 步骤 3: 完成配置

文件：config/workflows/my_custom_workflow.yaml

```yaml
name: my_custom_workflow
task_type: "workflow"
controller_type: "workflow"
mode: "collect"
usd_path: "assets/chemistry_lab/lab.usd"
workflow:
  table_prim_path: "/World/table"
  language_instruction: "Custom workflow description"
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
  cameras_names: ["camera_1"]
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

## 步骤 4: 运行工作流

```bash
python main.py --config-name workflows/my_custom_workflow
```

---

## 工作流模板

### 简单拾放

```yaml
steps:
  - skill: "pick"
    target_object: "source_object"
  - skill: "move"
    target_position: [x, y, z]
  - skill: "place"
    target_object: "target_object"
```

### 加热搅拌反应

```yaml
steps:
  - skill: "pick"
    target_object: "beaker"
  - skill: "move"
    target_position: [0.3, 0, 0.8]
  - skill: "press"
    target_object: "hotplate"
    params:
      press_force: 10.0
  - skill: "stir"
    target_object: "beaker"
    params:
      stir_duration: 5.0
```

### 双重冲洗流程

```yaml
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
```

---

## 技能参数

### 拾取参数

| 参数 | 值 |
| --- | --- |
| end_effector_euler | [0, 90, 30] |
| pre_offset_x | 0.05 |
| pre_offset_z | 0.05 |
| after_offset_z | 0.4 |
| events_dt | [0.002, 0.002, 0.005, 0.02, 0.08, 0.01, 0.02] |

### 放置参数

| 参数 | 值 |
| --- | --- |
| end_effector_euler | [0, 90, 30] |
| pre_offset_z | - |

### 倒液参数

| 参数 | 值 |
| --- | --- |
| events_dt | [0.006, 0.002, 0.009, 0.01, 0.009, 0.01] |
| pour_speed | -1 |

### 搅拌参数

| 参数 | 值 |
| --- | --- |
| events_dt | [0.005, ...] |
| stir_radius | - |
| stir_speed | - |

---

## 添加新的技能类型

### 1. 创建控制器

文件：controllers/atomic_actions/new_skill_controller.py

```python
class NewSkillController:
    def __init__(self, task, robot, cfg):
        self._event = 0
        self._t = 0.0

    def forward(self):
        if self._event == 0:
            return self._phase_0()
        # ...

    def is_done(self):
        return self._event >= self._num_phases
```

### 2. 注册技能

文件：controllers/workflow/skill_registry.py

```python
SKILL_CONTROLLER_MAP["new_skill"] = "controllers.atomic_actions.new_skill_controller.NewSkillController"
```

### 3. 添加默认值

文件：controllers/workflow/skill_defaults.py

```python
SKILL_DEFAULT_EE_EULER["new_skill"] = [0, 90, 0]
SKILL_DEFAULT_EVENTS_DT["new_skill"] = [0.1, 0.1]
```

### 4. 在工作流中使用

```yaml
steps:
  - skill: "new_skill"
    target_object: "object_name"
    params:
      custom_param: value
```

---

## 最佳实践

- 从简单开始：组合前先测试单个技能
- 使用模板：从现有工作流开始
- 验证物体：确保物体路径存在于场景中
- 调整参数：根据任务调整时间和偏移
- 顺序测试：首先单独运行每个步骤

---

## 关键文件

| 用途 | 文件 |
| --- | --- |
| 工作流配置 | config/workflows/ |
| 技能执行器 | controllers/workflow/skill_executor.py |
| 技能默认值 | controllers/workflow/skill_defaults.py |
| 技能注册表 | controllers/workflow/skill_registry.py |

---

## 下一步

| 目标 | 下一步 |
| --- | --- |
| 数据采集 | [数据采集](./data-collection.md) |
| 训练 | [训练](./training.md) |
| 添加新机器人 | [添加新机械臂](../Robots../../Robots/adding-new-robot.md) |
