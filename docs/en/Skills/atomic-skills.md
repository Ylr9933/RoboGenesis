---
title: Atomic Skills
---

# Atomic Skills

## Overview

RoboGenesis provides 9 atomic skills that are the building blocks for more complex workflows. Each skill is implemented as a state machine controller with phase-based progression.

---

## Skill Overview

| Skill | Phases | Description |
| --- | --- | --- |
| pick | 7 | Pick up object |
| place | 6 | Place object at target |
| pour | 6 | Pour liquid between containers |
| stir | 5 | Stir contents in container |
| shake | 5 | Shake/mix contents |
| press | 6 | Press button/switch |
| pressZ | 6 | Press with Z-axis alignment |
| open | 8 | Open door/container |
| close | 6 | Close door/container |
| move | - | Move to position |

---

## Skill Controller Architecture

All atomic skill controllers follow the same pattern:

```python
class SkillController:
    def __init__(self, ...):
        self._event = 0      # Current phase
        self._t = 0.0        # Phase progress [0, 1]

    def forward(self):
        """Compute action for current phase"""
        if self._event == 0:
            return self._phase_0()
        elif self._event == 1:
            return self._phase_1()
        # ...

    def is_done(self):
        """Check if all phases complete"""
        return self._event >= self._num_phases

    def reset(self):
        """Reset to initial state"""
        self._event = 0
        self._t = 0.0
```

---

## Pick

### Phases

```
Phase 0: Move above object (approach direction)
Phase 1: Horizontal approach buffer
Phase 2: Lower for grasp
Phase 3: Wait for dynamics
Phase 4: Close gripper (with virtual attach support)
Phase 5: Lift object
Phase 6: Complete
```

### Key Parameters

```yaml
skill: "pick"
params:
  end_effector_euler: [0, 90, 30]   # TCP orientation
  events_dt: [0.002, 0.002, 0.005, 0.02, 0.08, 0.01, 0.02]
  pre_offset_x: 0.05                # Pre-grasp X offset
  pre_offset_z: 0.05                # Pre-grasp Z offset
  after_offset_z: 0.4               # Post-grasp lift height
```

### Success Condition

Object Z position > initial Z + 0.1m (object lifted)

---

## Place

### Phases

```
Phase 0: Pre-place (elevated approach)
Phase 1: Lower to target
Phase 2: Wait
Phase 3: Open gripper (release object)
Phase 4: Retreat
Phase 5: Complete
```

### Key Parameters

```yaml
skill: "place"
params:
  end_effector_euler: [0, 90, 30]
  events_dt: [0.005, 0.002, 0.02, 0.01, 0.02, 0.02]
  pre_offset_z: 0.3                  # Approach height
```

### Success Condition

Object at target position (within threshold)

---

## Pour

### Phases

```
Phase 0-1: Approach target beaker
Phase 2-3: Tilt and pour (velocity mode on wrist DOF)
Phase 4-5: Return to upright
```

### Key Parameters

```yaml
skill: "pour"
params:
  events_dt: [0.006, 0.002, 0.009, 0.01, 0.009, 0.01]
  pour_speed: -1                     # Pour velocity
```

### Success Condition

Source beaker tilted, target liquid level changed

---

## Stir

### Phases

```
Phase 0: Lift/halt current position
Phase 1: Move above beaker
Phase 2: Lower into beaker
Phase 3: Stirring motion (circular path)
Phase 4: Lift out
```

### Key Parameters

```yaml
skill: "stir"
params:
  events_dt: [0.005, 0.01, 0.02, 0.5, 0.02]
  stir_radius: 0.02                  # Stirring circle radius
  stir_speed: 1.0                    # Stirring speed
```

### Success Condition

Continuous stirring motion detected

---

## Shake

Shake controller performs oscillating motion for mixing.

```yaml
skill: "shake"
params:
  amplitude: 0.1                     # Shake amplitude
  frequency: 2.0                     # Shake frequency
  duration: 1.0                      # Total duration
```

---

## Press

Press controller moves to a target and applies force.

```yaml
skill: "press"
params:
  target_position: [x, y, z]
  press_force: 10.0                  # Press force
  approach_height: 0.1               # Approach clearance
```

---

## Open / Close

### Open (8 phases)

```
Phase 0: Move to handle
Phase 1: Align with handle
Phase 2: Grasp handle
Phase 3-6: Rotate/translate to open
Phase 7: Release handle
```

### Close (similar reverse)

---

## Default Parameters

Default parameters are managed in `controllers/workflow/skill_defaults.py`:

```python
SKILL_DEFAULT_EE_EULER = {
    "pick": [0, 90, 30],
    "place": [0, 90, 30],
    "pour": [-90, 0, 0],
    "stir": [0, 90, 90],
    # ...
}

SKILL_DEFAULT_EVENTS_DT = {
    "pick": [0.002, 0.002, 0.005, 0.02, 0.08, 0.01, 0.02],
    "place": [0.005, 0.002, 0.02, 0.01, 0.02, 0.02],
    # ...
}
```

Robot-specific overrides are also supported.

---

## Skill Registry

Skills are registered in `controllers/workflow/skill_registry.py`:

```python
SKILL_CONTROLLER_MAP = {
    "pick": "controllers.atomic_actions.pick_controller.PickController",
    "place": "controllers.atomic_actions.place_controller.PlaceController",
    "pour": "controllers.atomic_actions.pour_controller.PourController",
    # ...
}
```

---

## Key Files

| Purpose | File |
| --- | --- |
| Pick controller | controllers/atomic_actions/pick_controller.py |
| Place controller | controllers/atomic_actions/place_controller.py |
| Pour controller | controllers/atomic_actions/pour_controller.py |
| Stir controller | controllers/atomic_actions/stir_controller.py |
| Shake controller | controllers/atomic_actions/shake_controller.py |
| Press controller | controllers/atomic_actions/press_controller.py |
| Open controller | controllers/atomic_actions/open_controller.py |
| Close controller | controllers/atomic_actions/close_controller.py |
| Skill defaults | controllers/workflow/skill_defaults.py |
| Skill registry | controllers/workflow/skill_registry.py |
