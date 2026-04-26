---
title: Controllers API
---

# Controllers API

## Overview

This section documents the Controller layer APIs. Controllers handle robot action computation and success checking.

---

## BaseController

**File:** `controllers/base_controller.py`

Base class for all controllers.

### Inheritance

```
BaseController
├── WorkflowController
├── AtomicActionController
│   ├── PickController
│   ├── PlaceController
│   └── ...
└── NavigationController
```

### Constructor

```python
def __init__(
    self,
    task: BaseTask,
    robot: Robot,
    cfg: DictConfig,
    name: str = "controller",
):
```

| Parameter | Description |
| --- | --- |
| task | Task instance for observation |
| robot | Robot instance |
| cfg | Hydra configuration |
| name | Controller name |

### Key Methods

#### forward()

```python
def forward(self) -> np.ndarray:
    """
    Compute action for current step.
    Returns: action array [DOF + gripper]
    """
    raise NotImplementedError
```

#### reset()

```python
def reset(self):
    """Reset controller state for new episode"""
    pass
```

#### is_done()

```python
def is_done(self) -> bool:
    """Check if task/skill is complete"""
    return False
```

#### close()

```python
def close(self):
    """Cleanup resources"""
    pass
```

### Properties

| Property | Description |
| --- | --- |
| robot | Robot instance |
| Gripper | Gripper controller |
| rmpflow_controller | Motion planner |
| skill_name | Current skill name |

---

## Atomic Action Controllers

### PickController

**File:** `controllers/atomic_actions/pick_controller.py`

```python
from controllers.atomic_actions.pick_controller import PickController
controller = PickController(task, robot, cfg)
```

Phases: 7 phases (0-6)

| Phase | Description |
| --- | --- |
| 0 | Approach object |
| 1 | Align gripper |
| 2 | Close gripper |
| 3 | Lift object |
| 4 | Move to place position |
| 5 | Lower object |
| 6 | Release and retract |

### PlaceController

**File:** `controllers/atomic_actions/place_controller.py`

Phases: 6 phases (0-5)

| Phase | Description |
| --- | --- |
| 0 | Approach place position |
| 1 | Lower object |
| 2 | Open gripper |
| 3 | Retract gripper |
| 4 | Release object |
| 5 | Return to home |

### PourController

**File:** `controllers/atomic_actions/pour_controller.py`

Phases: 6 phases (0-5)

| Phase | Description |
| --- | --- |
| 0-1 | Pre-position beaker |
| 2-3 | Tilt and pour |
| 4-5 | Return to neutral |

### StirController

**File:** `controllers/atomic_actions/stir_controller.py`

Phases: 5 phases (0-4)

| Phase | Description |
| --- | --- |
| 0 | Position glass |
| 1 | Lower stirrer |
| 2 | Begin stirring motion |
| 3 | Maintain stirring |
| 4 | Retract stirrer |

---

## WorkflowEngine

**File:** `controllers/workflow/workflow_engine.py`

```python
from controllers.workflow.workflow_engine import WorkflowEngine
engine = WorkflowEngine(task, robot, cfg)
```

### Methods

#### step()

```python
def step(self) -> Tuple[np.ndarray, bool]:
    """
    Execute one workflow step.
    Returns: (action, done)
    """
```

#### reset()

```python
def reset(self):
    """Reset workflow state"""
```

### Components

| Component | Description |
| --- | --- |
| SkillExecutor | Executes individual skills |
| TransitionManager | Manages skill transitions |
| SuccessConditionManager | Checks task completion |
| HeldObjectContext | Tracks held objects |

---

## Key Files

| File | Description |
| --- | --- |
| controllers/base_controller.py | Base controller class |
| controllers/atomic_actions/pick_controller.py | Pick action controller |
| controllers/atomic_actions/place_controller.py | Place action controller |
| controllers/atomic_actions/pour_controller.py | Pour action controller |
| controllers/atomic_actions/stir_controller.py | Stir action controller |
| controllers/atomic_actions/shake_controller.py | Shake action controller |
| controllers/atomic_actions/press_controller.py | Press action controller |
| controllers/atomic_actions/open_controller.py | Open action controller |
| controllers/atomic_actions/close_controller.py | Close action controller |
| controllers/workflow/workflow_engine.py | Workflow execution engine |
