---
title: 工厂
---

# 工厂

## 概览

RoboGenesis 使用工厂模式来创建机械臂、任务、控制器和数据采集器。这将对象创建与使用解耦，允许轻松扩展新的机械臂类型或任务类型。

---

## 工厂架构

```text
Factory
├── RobotFactory        # 创建机械臂实例
├── TaskFactory         # 创建任务实例
├── ControllerFactory   # 创建控制器实例
└── CollectorFactory    # 创建数据采集器实例
```

---

## RobotFactory

文件：factories/robot_factory.py

### 注册

```python
_CLASS_NAME_MAP = {
    "franka": ("robots.franka.franka", "Franka"),
    "fr3": ("robots.fr3.fr3", "FR3"),
    "ur5e": ("robots.ur5e.ur5e", "UR5e"),
    "ur16e": ("robots.ur16e.ur16e_arm", "UR16eArm"),
    "festo": ("robots.festo.festo_arm", "FestoArm"),
    "piper": ("robots.piper.piper", "Piper"),
    "rizon4": ("robots.rizon4.rizon4_arm", "Rizon4Arm"),
}
```

### 用法

```python
from factories.robot_factory import RobotFactory

factory = RobotFactory()
robot = factory.create(cfg)
```

### 创建方法

```python
def create(self, cfg):
    robot_type = cfg.robot.type
    class_path = self._CLASS_NAME_MAP[robot_type]
    module_name, class_name = class_path
    module = importlib.import_module(module_name)
    robot_class = getattr(module, class_name)
    return robot_class(...)
```

---

## TaskFactory

文件：factories/task_factory.py

### 注册

```python
_TASK_CLASS_MAP = {
    "single_object": "tasks.single_object_task.SingleObjectTask",
    "dual_object": "tasks.dual_object_task.DualObjectTask",
    "workflow": "tasks.workflow_task.WorkflowTask",
    "navigation": "tasks.navigation_task.NavigationTask",
    "mobile_pick": "tasks.mobile_pick_task.MobilePickTask",
}
```

### 用法

```python
from factories.task_factory import TaskFactory

factory = TaskFactory()
task = factory.create(task_type, cfg)
```

---

## ControllerFactory

文件：factories/controller_factory.py

### 注册

```python
_CONTROLLER_CLASS_MAP = {
    "workflow": "controllers.workflow.workflow_engine.WorkflowEngine",
    "navigation": "controllers.navigation_controller.NavigationController",
    "mobile_pick": "controllers.mobile_pick_controller.MobilePickController",
}
```

### 用法

```python
from factories.controller_factory import ControllerFactory

factory = ControllerFactory()
controller = factory.create(controller_type, task, cfg)
```

---

## CollectorFactory

文件：factories/collector_factory.py

### 注册

```python
_COLLECTOR_CLASS_MAP = {
    "default": "data_collectors.data_collector.DataCollector",
    "mock": "data_collectors.mock_collector.MockCollector",
}
```

### 用法

```python
from factories.collector_factory import CollectorFactory

factory = CollectorFactory()
collector = factory.create(collector_type, cfg)
```

---

## 添加新类型

### 添加新机械臂

1. 在 `robots/new_arm/new_arm.py` 中创建机械臂类
2. 在 `factories/robot_factory.py` 的 `_CLASS_NAME_MAP` 中注册
3. 在 `controllers/robot_configs/registry.py` 的 `ROBOT_CONFIGS` 中注册
4. 在 `config/atomic_skills/new_arm/` 中创建配置

### 添加新任务

1. 在 `tasks/new_task.py` 中创建任务类
2. 在 `factories/task_factory.py` 的 `_TASK_CLASS_MAP` 中注册
3. 在 `config/` 中创建配置

### 添加新控制器

1. 在 `controllers/new_controller.py` 中创建控制器类
2. 在 `factories/controller_factory.py` 的 `_CONTROLLER_CLASS_MAP` 中注册
3. 在 `config/` 中创建配置

---

## 关键文件

<div style="text-align: center; margin: 1.5em 0;" markdown>

| 用途 | 文件 |
| --- | --- |
| 机械臂工厂 | factories/robot_factory.py |
| 任务工厂 | factories/task_factory.py |
| 控制器工厂 | factories/controller_factory.py |
| 采集器工厂 | factories/collector_factory.py |

</div>
