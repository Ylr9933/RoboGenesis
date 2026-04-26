---
title: Factories
---

# Factories

## Overview

RoboGenesis uses the Factory Pattern to create robots, tasks, controllers, and data collectors. This decouples object creation from usage and allows easy extension with new robot types or task types.

---

## Factory Architecture

```
Factory
├── RobotFactory        # Creates robot instances
├── TaskFactory         # Creates task instances
├── ControllerFactory   # Creates controller instances
└── CollectorFactory    # Creates data collector instances
```

---

## RobotFactory

**File:** `factories/robot_factory.py`

**Registration:**

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

**Usage:**

```python
from factories.robot_factory import RobotFactory
factory = RobotFactory()
robot = factory.create(cfg)
```

**Create method:**

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

**File:** `factories/task_factory.py`

**Registration:**

```python
_TASK_CLASS_MAP = {
    "single_object": "tasks.single_object_task.SingleObjectTask",
    "dual_object": "tasks.dual_object_task.DualObjectTask",
    "workflow": "tasks.workflow_task.WorkflowTask",
    "navigation": "tasks.navigation_task.NavigationTask",
    "mobile_pick": "tasks.mobile_pick_task.MobilePickTask",
}
```

**Usage:**

```python
from factories.task_factory import TaskFactory
factory = TaskFactory()
task = factory.create(task_type, cfg)
```

---

## ControllerFactory

**File:** `factories/controller_factory.py`

**Registration:**

```python
_CONTROLLER_CLASS_MAP = {
    "workflow": "controllers.workflow.workflow_engine.WorkflowEngine",
    "navigation": "controllers.navigation_controller.NavigationController",
    "mobile_pick": "controllers.mobile_pick_controller.MobilePickController",
}
```

**Usage:**

```python
from factories.controller_factory import ControllerFactory
factory = ControllerFactory()
controller = factory.create(controller_type, task, cfg)
```

---

## CollectorFactory

**File:** `factories/collector_factory.py`

**Registration:**

```python
_COLLECTOR_CLASS_MAP = {
    "default": "data_collectors.data_collector.DataCollector",
    "mock": "data_collectors.mock_collector.MockCollector",
}
```

**Usage:**

```python
from factories.collector_factory import CollectorFactory
factory = CollectorFactory()
collector = factory.create(collector_type, cfg)
```

---

## Adding New Types

### Adding a new robot

1. Create robot class in `robots/new_robot/new_robot.py`
2. Register in `factories/robot_factory.py` _CLASS_NAME_MAP
3. Register in `controllers/robot_configs/registry.py` ROBOT_CONFIGS
4. Create config in `config/atomic_skills/new_robot/`

### Adding a new task

1. Create task class in `tasks/new_task.py`
2. Register in `factories/task_factory.py` _TASK_CLASS_MAP
3. Create config in `config/`

### Adding a new controller

1. Create controller class in `controllers/new_controller.py`
2. Register in `factories/controller_factory.py` _CONTROLLER_CLASS_MAP
3. Create config in `config/`

---

## Key Files

| Purpose | File |
| --- | --- |
| Robot factory | factories/robot_factory.py |
| Task factory | factories/task_factory.py |
| Controller factory | factories/controller_factory.py |
| Collector factory | factories/collector_factory.py |
