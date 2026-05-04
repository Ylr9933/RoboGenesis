---
title: Extending RoboGenesis
---

# Extending RoboGenesis

## Overview

This guide explains how to extend RoboGenesis with new robots, skills, tasks, and controllers.

---

## Adding a New Robot

See [Adding a New Robot](../Robots/adding-new-robot.md) for detailed tutorial.

Steps to add a new robot:

1. Create `robots/new_arm/new_arm.py` inheriting from GenericArm
2. Register in `controllers/robot_configs/registry.py`
3. Register in `factories/robot_factory.py`
4. Create config in `config/atomic_skills/new_arm/`

---

## Adding a New Skill

### Step 1: Create Controller

File：controllers/atomic_actions/new_skill_controller.py

```python
import numpy as np
from controllers.base_controller import BaseController


class NewSkillController(BaseController):
    def __init__(self, task, robot, cfg):
        super().__init__(task, robot, cfg, name="new_skill")
        self._num_phases = 4
        self._event = 0
        self._t = 0.0

    def forward(self):
        if self._event == 0:
            return self._phase_0()
        elif self._event == 1:
            return self._phase_1()
        elif self._event == 2:
            return self._phase_2()
        elif self._event == 3:
            return self._phase_3()

    def reset(self):
        self._event = 0
        self._t = 0.0

    def is_done(self):
        return self._event >= self._num_phases
```

### Step 2: Register Skill

File：controllers/workflow/skill_registry.py

```python
SKILL_CONTROLLER_MAP["new_skill"] = "controllers.atomic_actions.new_skill_controller.NewSkillController"
```

### Step 3: Add Defaults

File：controllers/workflow/skill_defaults.py

```python
SKILL_DEFAULT_EE_EULER["new_skill"] = [0, 90, 0]
SKILL_DEFAULT_EVENTS_DT["new_skill"] = [0.1, 0.1, 0.1, 0.1]
```

### Step 4: Add Success Checker

File：controllers/workflow/success_conditions/new_skill_checker.py

```python
from controllers.workflow.success_conditions.base_checker import BaseSuccessChecker


class NewSkillChecker(BaseSuccessChecker):
    def check(self) -> bool:
        # Your success condition logic
        return success_condition_met
```

Register in SKILL_SUCCESS_CHECKER_MAP.

---

## Adding a New Task

### Step 1: Create Task Class

File：tasks/new_task.py

```python
from tasks.base_task import BaseTask


class NewTask(BaseTask):
    def __init__(self, cfg, sim_config):
        super().__init__(cfg, sim_config)

    def reset(self):
        # Reset scene for new episode
        pass

    def get_observation(self):
        # Return observation dict
        return {"images": {}, "robot_state": {}}
```

### Step 2: Register Task

File：factories/task_factory.py

```python
_TASK_CLASS_MAP["new_task"] = "tasks.new_task.NewTask"
```

### Step 3: Create Config

File：config/new_task.yaml

```yaml
name: new_task
task_type: "new_task"
controller_type: "workflow"
mode: "collect"
task:
  max_steps: 1000
```

---

## Adding a New Controller

### Step 1: Create Controller

File：controllers/new_controller.py

```python
from controllers.base_controller import BaseController


class NewController(BaseController):
    def __init__(self, task, robot, cfg):
        super().__init__(task, robot, cfg, name="new_controller")

    def forward(self):
        # Compute action
        return action

    def reset(self):
        pass

    def is_done(self):
        return False
```

### Step 2: Register Controller

File：factories/controller_factory.py

```python
_CONTROLLER_CLASS_MAP["new_controller"] = "controllers.new_controller.NewController"
```

---

## Extending Workflow Engine

### Custom Transition

```python
# In controllers/workflow/transition_manager.py

def custom_transition(self, from_skill, to_skill):
    # Custom transition logic
    pass
```

### Custom Success Condition

```python
# In controllers/workflow/success_conditions/

class CustomSuccessChecker(BaseSuccessChecker):
    def check(self) -> bool:
        # Custom logic
        return condition_met
```

---

## Extension Examples

### Custom Gripper

```python
def _attach_custom_gripper(self, stage):
    """Attach custom gripper to robot"""
    # Custom attachment logic
    pass
```

### Custom Camera

```python
def setup_custom_camera(self):
    """Setup custom camera configuration"""
    # Custom camera setup
    pass
```

---

## Best Practices

- Follow existing patterns: Study existing implementations
- Add tests: Write tests for new components
- Document: Add docstrings and examples
- Register: Ensure all new components are registered
- Verify: Run check_registrations.py to verify

---

## Key Files

<div style="text-align: center; margin: 1.5em 0;" markdown>

| Purpose | File |
| --- | --- |
| Base Class | robots/base/generic_arm.py |
| Atomic Action Controller | controllers/atomic_actions/ |
| Workflow Controller | controllers/workflow/ |
| Tasks | tasks/ |
| Factories | factories/ |
| Registration Check Script | scripts/check_registrations.py |

</div>
