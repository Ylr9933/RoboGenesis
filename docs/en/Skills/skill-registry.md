---
title: Skill Registry
---

# Skill Registry

## Overview

The Skill Registry maps skill names to controller classes and manages default parameters. It provides the single source of truth for skill-related configuration.

---

## Registry Architecture

```
SkillRegistry
├── SKILL_CONTROLLER_MAP    # Skill name -> Controller class path
├── SKILL_DEFAULT_EE_EULER  # Default end-effector orientations
├── SKILL_DEFAULT_EVENTS_DT # Default phase timings
├── ROBOT_SKILL_OVERRIDES   # Robot-specific parameter overrides
└── SKILL_SUCCESS_CHECKER_MAP # Skill -> Success checker class
```

---

## SKILL_CONTROLLER_MAP

**File:** `controllers/workflow/skill_registry.py`

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

Format: [roll, pitch, yaw] in degrees

---

## SKILL_DEFAULT_EVENTS_DT

```python
SKILL_DEFAULT_EVENTS_DT = {
    "pick": [0.002, 0.002, 0.005, 0.02, 0.08, 0.01, 0.02],
    "place": [0.005, 0.002, 0.02, 0.01, 0.02, 0.02],
    "pour": [0.006, 0.002, 0.009, 0.01, 0.009, 0.01],
    "stir": [0.005, 0.01, 0.02, 0.5, 0.02],
    "shake": [0.1],  # Single phase
    "press": [0.02, 0.05],
    "pressZ": [0.02, 0.02, 0.05],
    "open": [0.01, 0.01, 0.01, 0.05, 0.05, 0.05, 0.05, 0.01],
    "close": [0.01, 0.01, 0.05, 0.05, 0.05, 0.01],
    "move": [0.1],
}
```

Interpretation: Duration (in seconds) for each phase of the skill

---

## ROBOT_SKILL_OVERRIDES

Robot-specific parameter overrides:

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
    # ... other robots
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

## Parameter Merging

When executing a skill, parameters are merged from multiple sources:

```python
def get_merged_params(skill_name, robot_type, yaml_params):
    # 1. Start with global defaults
    params = SKILL_DEFAULTS[skill_name].copy()
    # 2. Apply robot-specific overrides
    if robot_type in ROBOT_SKILL_OVERRIDES:
        if skill_name in ROBOT_SKILL_OVERRIDES[robot_type]:
            params.update(ROBOT_SKILL_OVERRIDES[robot_type][skill_name])
    # 3. Apply YAML step params (highest priority)
    params.update(yaml_params)
    return params
```

**Priority (highest to lowest):**

1. YAML step params
2. Robot overrides
3. Global defaults

---

## create_skill_controller()

Factory function to create skill controllers:

```python
def create_skill_controller(skill_name, task, robot, cfg):
    controller_path = SKILL_CONTROLLER_MAP[skill_name]
    module_path, class_name = controller_path.rsplit(".", 1)
    module = importlib.import_module(module_path)
    controller_class = getattr(module, class_name)
    return controller_class(task, robot, cfg)
```

---

## Adding a New Skill

1. Create controller in `controllers/atomic_actions/new_skill_controller.py`

2. Register in SKILL_CONTROLLER_MAP:

```python
"new_skill": "controllers.atomic_actions.new_skill_controller.NewSkillController"
```

3. Add defaults:

```python
SKILL_DEFAULT_EE_EULER["new_skill"] = [0, 90, 0]
SKILL_DEFAULT_EVENTS_DT["new_skill"] = [0.1, 0.1, 0.1]
```

4. Create success checker in `controllers/workflow/success_conditions/`

5. Register checker:

```python
SKILL_SUCCESS_CHECKER_MAP["new_skill"] = "path.to.NewSkillChecker"
```

6. Update config in `config/atomic_skills/new_skill.yaml`

---

## Key Files

| Purpose | File |
| --- | --- |
| Skill registry | controllers/workflow/skill_registry.py |
| Skill defaults | controllers/workflow/skill_defaults.py |
| Success conditions | controllers/workflow/success_conditions/ |
| Atomic controllers | controllers/atomic_actions/ |
