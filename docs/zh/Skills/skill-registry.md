---
title: 技能注册表
---

# 技能注册表

## 概览

技能注册表将技能名称映射到控制器类并管理默认参数。它提供了技能相关配置的单一事实来源。

---

## 注册表架构

```
SkillRegistry
├── SKILL_CONTROLLER_MAP    # 技能名称 -> 控制器类路径
├── SKILL_DEFAULT_EE_EULER  # 默认末端执行器方向
├── SKILL_DEFAULT_EVENTS_DT # 默认阶段时序
├── ROBOT_SKILL_OVERRIDES   # 机器人特定参数覆盖
└── SKILL_SUCCESS_CHECKER_MAP # 技能 -> 成功检查器类
```

---

## SKILL_CONTROLLER_MAP

文件：controllers/workflow/skill_registry.py

```python
SKILL_CONTROLLER_MAP = {
    "pick": "controllers.atomic_actions.pick_controller.PickController",
    "place": "controllers.atomic_actions.place_controller.PlaceController",
    "pour": "controllers.atomic_actions.pour_controller.PourController",
    "stir": "controllers.atomic_actions.stir_controller.StirController",
    "shake": "controllers.atomic_actions.shake_controller.ShakeController",
    "press": "controllers.atomic_actions.press_controller.PressController",
    "pressZ": "controllers.atomic_actions.pressZ_controller.PressZController",
    "open": "controllers.atomic_actions.open_controller.OpenController",
    "close": "controllers.atomic_actions.close_controller.CloseController",
    "move": "controllers.atomic_actions.move_controller.MoveController",
}
```

---

## SKILL_DEFAULT_EE_EULER

```python
SKILL_DEFAULT_EE_EULER = {
    "pick": [0, 90, 30],
    "place": [0, 90, 30],
    "pour": [-90, 0, 0],
    "stir": [0, 90, 90],
    "shake": [0, 90, 0],
    "press": [0, 90, 0],
    "pressZ": [0, 0, 0],
    "open": [0, 90, 0],
    "close": [0, 90, 0],
    "move": [0, 90, 0],
}
```

格式：[roll, pitch, yaw] 以度为单位

---

## SKILL_DEFAULT_EVENTS_DT

```python
SKILL_DEFAULT_EVENTS_DT = {
    "pick": [0.002, 0.002, 0.005, 0.02, 0.08, 0.01, 0.02],
    "place": [0.005, 0.002, 0.02, 0.01, 0.02, 0.02],
    "pour": [0.006, 0.002, 0.009, 0.01, 0.009, 0.01],
    "stir": [0.005, 0.01, 0.02, 0.5, 0.02],
    "shake": [0.1],  # 单阶段
    "press": [0.02, 0.05],
    "pressZ": [0.02, 0.02, 0.05],
    "open": [0.01, 0.01, 0.01, 0.05, 0.05, 0.05, 0.05, 0.01],
    "close": [0.01, 0.01, 0.05, 0.05, 0.05, 0.01],
    "move": [0.1],
}
```

含义：技能每个阶段的持续时间（秒）

---

## ROBOT_SKILL_OVERRIDES

机器人特定参数覆盖：

```python
ROBOT_SKILL_OVERRIDES = {
    "piper": {
        "pick": {"end_effector_euler": [0, 0, 0]},
        "place": {"end_effector_euler": [0, 0, 0]},
    },
    "fr3": {
        "pick": {"end_effector_euler": [0, 45, 15]},
    },
    "ur5e": {
        "pick": {"end_effector_euler": [0, 90, 45]},
    },
    # ... 其他机器人
}
```

---

## SKILL_SUCCESS_CHECKER_MAP

```python
SKILL_SUCCESS_CHECKER_MAP = {
    "pick": "controllers.workflow.success_conditions.pick_checker.PickChecker",
    "place": "controllers.workflow.success_conditions.place_checker.PlaceChecker",
    "pour": "controllers.workflow.success_conditions.pour_checker.PourChecker",
    "stir": "controllers.workflow.success_conditions.stir_checker.StirChecker",
    "shake": "controllers.workflow.success_conditions.shake_checker.ShakeChecker",
    "press": "controllers.workflow.success_conditions.press_checker.PressChecker",
    "pressZ": "controllers.workflow.success_conditions.pressZ_checker.PressZChecker",
    "open": "controllers.workflow.success_conditions.open_checker.OpenChecker",
    "close": "controllers.workflow.success_conditions.close_checker.CloseChecker",
}
```

---

## 参数合并

执行技能时，参数从多个来源合并：

```python
def get_merged_params(skill_name, robot_type, yaml_params):
    # 1. 从全局默认值开始
    params = SKILL_DEFAULTS[skill_name].copy()

    # 2. 应用机器人特定覆盖
    if robot_type in ROBOT_SKILL_OVERRIDES:
        if skill_name in ROBOT_SKILL_OVERRIDES[robot_type]:
            params.update(ROBOT_SKILL_OVERRIDES[robot_type][skill_name])

    # 3. 应用 YAML 步骤参数（最高优先级）
    params.update(yaml_params)
    return params
```

优先级（从高到低）：

1. YAML 步骤参数
2. 机器人覆盖参数
3. 全局默认值

---

## create_skill_controller()

用于创建技能控制器的工厂函数：

```python
def create_skill_controller(skill_name, task, robot, cfg):
    controller_path = SKILL_CONTROLLER_MAP[skill_name]
    module_path, class_name = controller_path.rsplit(".", 1)
    module = importlib.import_module(module_path)
    controller_class = getattr(module, class_name)
    return controller_class(task, robot, cfg)
```

---

## 添加新技能

1. 创建控制器在 `controllers/atomic_actions/new_skill_controller.py`
2. 在 `SKILL_CONTROLLER_MAP` 中注册：

```python
"new_skill": "controllers.atomic_actions.new_skill_controller.NewSkillController"
```

3. 添加默认值：

```python
SKILL_DEFAULT_EE_EULER["new_skill"] = [0, 90, 0]
SKILL_DEFAULT_EVENTS_DT["new_skill"] = [0.1, 0.1, 0.1]
```

4. 在 `controllers/workflow/success_conditions/` 中创建成功检查器
5. 注册检查器：

```python
SKILL_SUCCESS_CHECKER_MAP["new_skill"] = "path.to.NewSkillChecker"
```

6. 在 `config/atomic_skills/new_skill.yaml` 中更新配置

---

## 关键文件

<div style="text-align: center; margin: 1.5em 0;" markdown>

| 用途 | 文件 |
| --- | --- |
| 技能注册表 | controllers/workflow/skill_registry.py |
| 技能默认值 | controllers/workflow/skill_defaults.py |
| 成功条件 | controllers/workflow/success_conditions/ |
| 原子控制器 | controllers/atomic_actions/ |

</div>
