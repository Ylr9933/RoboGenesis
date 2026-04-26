---
title: Workflow Engine
---

# Workflow Engine

## Overview

The Workflow Engine orchestrates multi-step task execution by coordinating atomic skills. It manages skill transitions, success checking, and held object tracking.

---

## Architecture

```
WorkflowEngine
├── SkillExecutor           # Dispatches skills to controllers
├── TransitionManager       # Handles skill transitions
├── SuccessConditionManager # Per-skill success checking
├── HeldObjectContext      # Tracks held objects
└── StepTracker            # Records execution history
```

---

## Execution Flow

```
1. Episode warmup (physics settling)
2. Transition settling (if switching skills)
3. Skill execution via SkillExecutor.dispatch()
   └── AtomicController.forward() for each step
4. Success condition checking
5. Transition to next skill or finish
```

---

## SkillExecutor

**File:** `controllers/workflow/skill_executor.py`

Dispatches skills to atomic controllers:

```python
class SkillExecutor:
    def dispatch(self, skill_name, target_object, params, held_ctx):
        if skill_name == "pick":
            return self._exec_pick(target_object, params, held_ctx)
        elif skill_name == "place":
            return self._exec_place(target_object, params, held_ctx)
        elif skill_name == "pour":
            return self._exec_pour(target_object, params, held_ctx)
        # ...
```

### Parameter Merging

Three-layer merge priority:

1. YAML step params (highest)
2. Robot overrides
3. Global defaults (lowest)

```python
# From skill_defaults.py
SKILL_DEFAULT_EE_EULER = {...}
SKILL_DEFAULT_EVENTS_DT = {...}
ROBOT_SKILL_OVERRIDES = {...}
```

---

## HeldObjectContext

Tracks objects held by the robot:

```python
@dataclass
class HeldObject:
    name: str           # Object name (e.g., "source_beaker")
    usd_path: str       # Object prim path
    attach_frame: str   # Attachment frame
    # ...

class HeldObjectContext:
    def require(self, skill_name):
        """Validate held object for skill"""
        if skill_name in ["place", "pour"]:
            assert self._held_object is not None, "No object held!"

    def set_held(self, obj: HeldObject):
        self._held_object = obj

    def clear_held(self):
        self._held_object = None
```

**Precondition enforcement:**

- place: Requires held object
- pour: Requires held object (source beaker)
- pick: Produces held object

---

## TransitionManager

Handles clean transitions between skills:

1. Reset RMPFlow — Clear velocity history
2. Restore DOF modes — Fix pour velocity mode
3. Update gripper object position — Sync held object
4. Reset next skill controller — Prepare for execution
5. Wait for physics settling — 30 frames default

```python
def transition_to(self, next_skill, scene_objects):
    self._reset_rmpflow()
    self._restore_dof_modes()
    self._update_gripper_object_pose(scene_objects)
    self._reset_next_controller(next_skill)
    self._settle_physics(frames=30)
```

---

## SuccessConditionManager

Per-skill success checkers:

| Skill | Checker | Success Condition |
| --- | --- | --- |
| pick | PickChecker | Object Z > initial Z + 0.1m |
| place | PlaceChecker | Object at target position |
| pour | PourChecker | Source tilted, target level changed |
| stir | StirChecker | Continuous stirring motion |
| shake | ShakeChecker | Oscillation pattern detected |

---

## Workflow Configuration

```yaml
workflow:
  table_prim_path: "/World/table"
  language_instruction: "Pick source and pour into target"
  scene_objects:
    - name: "source_beaker"
      path: "/World/beaker_2"
      position_range:
        x: [0.20, 0.28]
        y: [0.05, 0.12]
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
```

---

## StepTracker

Records execution history:

```python
class StepTracker:
    def __init__(self):
        self.history = []  # List of (step_index, skill_name, success)

    def record(self, step_index, skill_name, success):
        self.history.append({
            "step": step_index,
            "skill": skill_name,
            "success": success,
            "timestamp": time.time()
        })

    def get_summary(self):
        total = len(self.history)
        successful = sum(1 for h in self.history if h["success"])
        return {"total": total, "successful": successful, "rate": successful/total}
```

---

## Workflow State

```python
@dataclass
class WorkflowState:
    current_step: int = 0
    current_skill: str = None
    held_object: HeldObject = None
    step_results: List[StepResult] = field(default_factory=list)
    # ...
```

---

## Key Files

| Purpose | File |
| --- | --- |
| Workflow engine | controllers/workflow/workflow_engine.py |
| Skill executor | controllers/workflow/skill_executor.py |
| Transition manager | controllers/workflow/transition_manager.py |
| Held object context | controllers/workflow/held_object_context.py |
| State manager | controllers/workflow/state_manager.py |
| Success conditions | controllers/workflow/success_conditions.py |
| Skill defaults | controllers/workflow/skill_defaults.py |
| Skill registry | controllers/workflow/skill_registry.py |
