---
title: Controllers
---

# Controllers

## Overview

Controllers handle how the robot acts (action computation) and whether the task succeeded (success checking). The controller layer is organized into:

- Atomic Action Controllers: Individual skill controllers (pick, place, pour, ...)
- Workflow Engine: Multi-step task orchestration
- Inference Engines: Policy model inference (local/remote)
- Robot Controllers: Robot-specific wrappers (RMPFlow, mobile base)

---

## BaseController

All controllers inherit from `controllers/base_controller.py`:

### Key Attributes

| Attribute | Description |
| --- | --- |
| robot | Robot instance |
| gripper | Gripper controller |
| rmpflow_controller | RMPFlow motion planner |
| mode | Execution mode (collect/infer) |
| skill_name | Current skill name |

### Key Methods

| Method | Description |
| --- | --- |
| forward() | Compute action for current step |
| reset() | Reset controller state |
| is_done() | Check if task is complete |
| close() | Cleanup resources |

---

## Two Execution Modes

### Collect Mode

Scripted skill execution via state machines. Used for data collection.

```yaml
mode: "collect"
```

**Flow:**

1. Execute predefined skill phases
2. Record observations (images, joint states)
3. Record actions
4. Check success conditions
5. Reset for next episode

### Infer Mode

Policy model inference. Used for evaluation.

```yaml
mode: "infer"
infer:
  type: "local"  # or "remote"
  policy_model_path: "path/to/model.ckpt"
```

**Flow:**

1. Get observation from task
2. Send to inference engine
3. Get action from policy model
4. Execute action via RMPFlow
5. Check success conditions

---

## RMPFlow Controller

RMPFlow (Riemannian Motion Policy Flow) provides smooth motion planning.

```python
# Initialize RMPFlow
self.rmpflow_controller = RMPFlowController(
    robot_prim_path=self.robot.prim_path_str,
    robot_description_path=rmpflow_yaml_path,
    rmpflow_config_path=rmpflow_config_yaml,
)
```

**Usage:**

```python
# Move to target pose
target_pose = [x, y, z, rx, ry, rz, rw]  # quaternion
self.rmpflow_controller.execute(target_pose)

# Get current end-effector pose
current_pose = self.robot.get_end_effector_pose()
```

---

## Atomic Action Controllers

Located in `controllers/atomic_actions/`:

| Skill | Phases | File |
| --- | --- | --- |
| pick | 7 | pick_controller.py |
| place | 6 | place_controller.py |
| pour | 6 | pour_controller.py |
| stir | 5 | stir_controller.py |
| shake | 10 | shake_controller.py |
| press | 3 | press_controller.py |
| pressZ | 3 | pressZ_controller.py |
| open | 8 | open_controller.py |
| close | 3 | close_controller.py |
| move | 1 | move_controller.py |

### State Machine Pattern

All atomic controllers follow a phase-based state machine:

```python
class PickController:
    def __init__(self, ...):
        self._event = 0      # Current phase (0-6)
        self._t = 0.0        # Phase progress (0-1)

    def forward(self):
        if self._event == 0:
            # Phase 0: Move above object
            return self._phase_0()
        elif self._event == 1:
            # Phase 1: Horizontal approach
            return self._phase_1()
        # ...

    def is_done(self):
        return self._event >= 7  # All phases complete
```

### Pick Controller (7 phases)

| Phase | Description |
| --- | --- |
| 0 | Move end effector above the object (approach direction) |
| 1 | Lower end effector closer to the object (horizontal buffer) |
| 2 | Position end effector for grasping |
| 3 | Wait for robot dynamics to settle |
| 4 | Close gripper to grasp the object (supports virtual attach) |
| 5 | Lift the object |
| 6 | Complete the sequence |

### Place Controller (6 phases)

| Phase | Description |
| --- | --- |
| 0 | Pre-place: elevated approach (move above target first) |
| 1 | Lower to target position |
| 2 | Wait for dynamics to settle |
| 3 | Open gripper to release the object |
| 4 | Retreat from placed object |
| 5 | Complete |

**events_dt:** `[0.005, 0.01, 0.08, 0.05, 0.01, 0.1]`

### Pour Controller (6 phases)

| Phase | Description |
| --- | --- |
| 0 | Move above target with random height offset |
| 1 | Adjust height and lateral position to target |
| 2 | Switch joint 7 to velocity mode, apply positive pour velocity |
| 3 | Hold joint 7 velocity at 0 (pause pouring) |
| 4 | Apply reverse (negative) velocity to pour back |
| 5 | Hold and finish pouring |

The pour action uses velocity mode on the wrist DOF (joint 7) to control tilt angle. Positive velocity pours liquid out; reverse velocity retrieves it.

### Stir Controller (5 phases)

| Phase | Description |
| --- | --- |
| 0 | Lift the glass rod |
| 1 | Move above the beaker |
| 2 | Lower into the beaker |
| 3 | Perform stirring motion |
| 4 | Lift out of the beaker |

### Shake Controller (10 phases)

A multi-phase shaking/dynamism motion sequence.

**events_dt:** `[0.02, 0.018, 0.018, 0.018, 0.018, 0.018, 0.018, 0.018, 0.018, 0.015]`

| Phase | Description |
| --- | --- |
| 0–9 | Sequential phases of shaking motion with decreasing time intervals |

### Press Controller (3 phases)

| Phase | Description |
| --- | --- |
| 0 | Move end effector in front of target |
| 1 | Close gripper |
| 2 | Press forward to target position |

### PressZ Controller (3 phases)

Vertical (Z-axis) press motion.

**events_dt:** `[0.005, 0.01, 0.01]`

| Phase | Description |
| --- | --- |
| 0 | Move above target |
| 1 | Lower to press position |
| 2 | Apply downward press force |

### Open Controller (8 phases)

Used for cabinet doors and drawers.

**State flow:** `APPROACH → FINE_ADJUST → GRIP → ARC_PULL → IDLE → RELEASE → RETREAT → DONE`

**events_dt:** `[0.0025, 0.005, 0.0075, 0.002, 0.05, 0.05, 0.01, 0.008]`

| Phase | Description |
| --- | --- |
| 0 | Approach: move to handle front pre-position |
| 1 | Fine adjustment: precise alignment with handle |
| 2 | Grip: close gripper on handle |
| 3 | Arc pull: arc-shaped pull trajectory |
| 4 | Idle: dwell for inertia to settle |
| 5 | Release: open gripper to release handle |
| 6 | Retreat: move back from door |
| 7 | Done: complete |

### Close Controller (3 phases)

Used to close cabinet doors and drawers.

**events_dt:** `[0.0025, 0.005, 0.005]`

| Phase | Description |
| --- | --- |
| 0 | APPROACH: move to handle front pre-position (fingers stay open to leave room for handle entry) |
| 1 | ARC_PUSH: arc-shaped push trajectory, grip to regrip_gap when handle enters between fingers |
| 2 | RETREAT: dwell if configured, then retreat using last rotation orientation |

Supports `regrip_gap` for workflows where the gripper must actively re-grip before pushing.

### Move Controller (1 phase)

A simple Cartesian-space point-to-point controller.

| Phase | Description |
| --- | --- |
| 0 | Move end effector to target position and orientation via cspace controller |

**Multi-segment mode:** `forward_multi_segment()` traverses a list of waypoints sequentially. `forward_two_points()` is a convenient vertical-then-horizontal two-waypoint variant.

---

## Inference Engines

### Local Inference

```python
from controllers.inference_engines.local_model_inference_engine import LocalModelInferenceEngine
engine = LocalModelInferenceEngine(
    policy_model_path="path/to/model.ckpt",
    normalizer_path="path/to/normalize.ckpt",
)
action = engine.infer(observation)
```

### Remote Inference

```python
from controllers.inference_engines.remote_inference_engine import RemoteInferenceEngine
engine = RemoteInferenceEngine(
    host="0.0.0.0",
    port=8080,
    n_obs_steps=3,
)
action = engine.infer(observation)
```

---

## Key Files

| Purpose | File |
| --- | --- |
| Base controller | controllers/base_controller.py |
| Atomic actions | controllers/atomic_actions/ |
| Workflow engine | controllers/workflow/workflow_engine.py |
| Skill executor | controllers/workflow/skill_executor.py |
| Held object context | controllers/workflow/held_object_context.py |
| Local inference | controllers/inference_engines/local_model_inference_engine.py |
| Remote inference | controllers/inference_engines/remote_inference_engine.py |
| Success conditions | controllers/workflow/success_conditions.py |
