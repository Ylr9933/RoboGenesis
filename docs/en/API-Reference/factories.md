---
title: Factories API
---

# Factories API

## Overview

Factory classes create robots, tasks, controllers, and data collectors using a registry pattern.

---

## RobotFactory

**File:** `factories/robot_factory.py`

```python
from factories.robot_factory import RobotFactory
factory = RobotFactory()
robot = factory.create(cfg)
```

### create()

```python
def create(self, cfg: DictConfig) -> Robot:
    """
    Create robot instance from config.
    Args:
        cfg: Robot configuration with 'type' field
    Returns: Robot instance
    """
```

### Registration Map

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

**File:** `factories/task_factory.py`

```python
from factories.task_factory import TaskFactory
factory = TaskFactory()
task = factory.create(task_type, cfg)
```

### create()

```python
def create(self, task_type: str, cfg: DictConfig) -> BaseTask:
    """
    Create task instance.
    Args:
        task_type: Type string ('workflow', 'single_object', etc.)
        cfg: Task configuration
    Returns: Task instance
    """
```

### Task Types

| Type | Description |
| --- | --- |
| single_object | Single object manipulation |
| dual_object | Dual object manipulation |
| workflow | Multi-step workflow |
| navigation | Navigation task |
| mobile_pick | Mobile pick task |

---

## ControllerFactory

**File:** `factories/controller_factory.py`

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
    Create controller instance.
    Args:
        controller_type: Type string ('workflow', 'navigation', etc.)
        task: Task instance
        robot: Robot instance
        cfg: Controller configuration
    Returns: Controller instance
    """
```

---

## CollectorFactory

**File:** `factories/collector_factory.py`

```python
from factories.collector_factory import CollectorFactory
factory = CollectorFactory()
collector = factory.create(collector_type, cfg)
```

### create()

```python
def create(self, collector_type: str, cfg: DictConfig) -> DataCollectorBase:
    """
    Create data collector instance.
    Args:
        collector_type: Type string ('default', 'mock')
        cfg: Collector configuration
    Returns: DataCollector instance
    """
```

### Collector Types

| Type | Description |
| --- | --- |
| default | Standard data collection |
| mock | Mock collector for testing |

---

## Key Files

| File | Description |
| --- | --- |
| factories/robot_factory.py | Robot factory |
| factories/task_factory.py | Task factory |
| factories/controller_factory.py | Controller factory |
| factories/collector_factory.py | Collector factory |
