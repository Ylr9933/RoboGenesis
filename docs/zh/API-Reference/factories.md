---
title: 工厂 API
---

# 工厂 API

## 概述

工厂类使用注册表模式创建机器人、任务、控制器和数据收集器。

---

## RobotFactory

文件: factories/robot_factory.py

```python
from factories.robot_factory import RobotFactory

factory = RobotFactory()
robot = factory.create(cfg)
```

### create()

```python
def create(self, cfg: DictConfig) -> Robot:
    """
    从配置创建机器人实例。
    参数:
        cfg: 包含 'type' 字段的机器人配置
    返回:
        机器人实例
    """
```

### 注册映射表

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

---

## TaskFactory

文件: factories/task_factory.py

```python
from factories.task_factory import TaskFactory

factory = TaskFactory()
task = factory.create(task_type, cfg)
```

### create()

```python
def create(self, task_type: str, cfg: DictConfig) -> BaseTask:
    """
    创建任务实例。
    参数:
        task_type: 类型字符串 ('workflow', 'single_object', 等)
        cfg: 任务配置
    返回:
        任务实例
    """
```

### 任务类型

| 类型 | 描述 |
| --- | --- |
| single_object | 单物体任务 |
| dual_object | 双物体任务 |
| workflow | 工作流任务 |
| navigation | 导航任务 |
| mobile_pick | 移动抓取任务 |

---

## ControllerFactory

文件: factories/controller_factory.py

```python
from factories.controller_factory import ControllerFactory

factory = ControllerFactory()
controller = factory.create(controller_type, task, robot, cfg)
```

### create()

```python
def create(
    self,
    controller_type: str,
    task: BaseTask,
    robot: Robot,
    cfg: DictConfig,
) -> BaseController:
    """
    创建控制器实例。
    参数:
        controller_type: 类型字符串 ('workflow', 'navigation', 等)
        task: 任务实例
        robot: 机器人实例
        cfg: 控制器配置
    返回:
        控制器实例
    """
```

---

## CollectorFactory

文件: factories/collector_factory.py

```python
from factories.collector_factory import CollectorFactory

factory = CollectorFactory()
collector = factory.create(collector_type, cfg)
```

### create()

```python
def create(self, collector_type: str, cfg: DictConfig) -> DataCollectorBase:
    """
    创建数据收集器实例。
    参数:
        collector_type: 类型字符串 ('default', 'mock')
        cfg: 收集器配置
    返回:
        DataCollector 实例
    """
```

### 收集器类型

| 类型 | 描述 |
| --- | --- |
| default | 默认数据收集器 |
| mock | Mock 数据收集器（用于测试） |

---

## 关键文件

| 文件 | 描述 |
| --- | --- |
| factories/robot_factory.py | 机器人工厂 |
| factories/task_factory.py | 任务工厂 |
| factories/controller_factory.py | 控制器工厂 |
| factories/collector_factory.py | 收集器工厂 |
