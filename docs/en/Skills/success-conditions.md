---
title: Success Conditions
---

# Success Conditions

## Overview

Success conditions determine whether a skill has completed its task successfully. Each atomic skill has a corresponding success checker that evaluates the current state against predefined criteria.

---

## Architecture

```
SuccessConditionManager
├── PickChecker
├── PlaceChecker
├── PourChecker
├── StirChecker
├── ShakeChecker
├── PressChecker
├── PressZChecker
├── OpenChecker
└── CloseChecker
```

---

## Base Checker

**File:** `controllers/workflow/success_conditions/base_checker.py`

```python
class BaseSuccessChecker:
    def __init__(self, task, controller):
        self.task = task
        self.controller = controller

    def check(self) -> bool:
        """Returns True if skill succeeded"""
        raise NotImplementedError

    def get_failure_reason(self) -> str:
        """Returns human-readable failure reason"""
        return "Unknown"
```

---

## PickChecker

**Condition:** Object Z position > initial Z + 0.1m

**Logic:**

```python
class PickChecker(BaseSuccessChecker):
    def check(self) -> bool:
        current_z = self.task.get_object_position("target_object")[2]
        initial_z = self.controller._initial_z
        return current_z > initial_z + 0.1  # Object lifted
```

---

## PlaceChecker

**Condition:** Object at target position (within threshold)

**Logic:**

```python
class PlaceChecker(BaseSuccessChecker):
    def check(self) -> bool:
        current_pos = self.task.get_object_position("target_object")
        target_pos = self.controller._target_position
        distance = np.linalg.norm(current_pos - target_pos)
        return distance < 0.05  # 5cm threshold
```

---

## PourChecker

**Condition:** Source beaker tilted AND target liquid level changed

**Logic:**

```python
class PourChecker(BaseSuccessChecker):
    def check(self) -> bool:
        # Check source tilted (wrist joint rotated)
        source_tilted = self.controller._wrist_joint > threshold
        # Check target has more liquid
        target_level_changed = (
            self.task.get_object_property("target", "liquid_level") >
            self.controller._initial_target_level
        )
        return source_tilted and target_level_changed
```

---

## StirChecker

**Condition:** Continuous stirring motion detected

**Logic:**

```python
class StirChecker(BaseSuccessChecker):
    def check(self) -> bool:
        # Check stir phase is active
        if self.controller._event != 3:  # Phase 3 is stirring
            return False
        # Check motion is continuous (not stuck)
        position_history = self.controller._position_history
        if len(position_history) < 10:
            return False
        # Compute velocity variance (should be non-zero for stirring)
        velocities = np.diff(position_history, axis=0)
        velocity_variance = np.var(velocities, axis=0)
        return np.sum(velocity_variance) > threshold
```

---

## ShakeChecker

**Condition:** Oscillation pattern detected

**Logic:**

```python
class ShakeChecker(BaseSuccessChecker):
    def check(self) -> bool:
        # Check oscillation frequency
        position_history = self.controller._position_history
        # FFT to detect oscillation
        freq = np.fft.fft(position_history)
        dominant_freq = np.argmax(np.abs(freq[1:])) + 1
        return dominant_freq >= 2  # At least 2 oscillation cycles
```

---

## PressChecker

**Condition:** Target position reached AND force applied

**Logic:**

```python
class PressChecker(BaseSuccessChecker):
    def check(self) -> bool:
        # Check position reached
        current_pos = self.task.get_robot_state()["end_effector"]
        target_pos = self.controller._target_position
        position_ok = np.linalg.norm(current_pos - target_pos) < 0.02
        # Check force applied (via joint torque)
        joint_torques = self.task.get_robot_state()["joint_torques"]
        force_applied = np.max(np.abs(joint_torques)) > force_threshold
        return position_ok and force_applied
```

---

## OpenChecker / CloseChecker

**Condition:** Door state matches target (open/closed)

**Logic:**

```python
class OpenChecker(BaseSuccessChecker):
    def check(self) -> bool:
        door_state = self.task.get_object_state("door")
        return door_state == "open"  # Door fully open

class CloseChecker(BaseSuccessChecker):
    def check(self) -> bool:
        door_state = self.task.get_object_state("door")
        return door_state == "closed"  # Door fully closed
```

---

## Multi-Frame Success

Some skills require consecutive success frames to confirm completion:

```python
REQUIRED_SUCCESS_STEPS = 5  # Success for 5 consecutive frames

class BaseSuccessChecker:
    def check(self) -> bool:
        current_success = self._evaluate_single_frame()
        if current_success:
            self._consecutive_success += 1
        else:
            self._consecutive_success = 0
        return self._consecutive_success >= REQUIRED_SUCCESS_STEPS
```

This prevents false positives from transient states.

---

## Success Condition Configuration

Success conditions are automatically associated with skill types via the skill registry:

```python
SKILL_SUCCESS_CHECKER_MAP = {
    "pick": "controllers.workflow.success_conditions.pick_checker.PickChecker",
    "place": "controllers.workflow.success_conditions.place_checker.PlaceChecker",
    "pour": "controllers.workflow.success_conditions.pour_checker.PourChecker",
    # ...
}
```

---

## Custom Success Conditions

To add a custom success condition:

1. Create checker class inheriting from BaseSuccessChecker
2. Implement check() method
3. Register in SKILL_SUCCESS_CHECKER_MAP

```python
from controllers.workflow.success_conditions.base_checker import BaseSuccessChecker

class CustomChecker(BaseSuccessChecker):
    def check(self) -> bool:
        # Your logic here
        return custom_condition_met

# Register
SKILL_SUCCESS_CHECKER_MAP["custom_skill"] = "path.to.CustomChecker"
```

---

## Key Files

<div style="text-align: center; margin: 1.5em 0;" markdown>

| Purpose | File |
| --- | --- |
| Base checker | controllers/workflow/success_conditions/base_checker.py |
| Pick checker | controllers/workflow/success_conditions/pick_checker.py |
| Place checker | controllers/workflow/success_conditions/place_checker.py |
| Pour checker | controllers/workflow/success_conditions/pour_checker.py |
| Stir checker | controllers/workflow/success_conditions/stir_checker.py |
| Shake checker | controllers/workflow/success_conditions/shake_checker.py |
| Press checker | controllers/workflow/success_conditions/press_checker.py |
| Open checker | controllers/workflow/success_conditions/open_checker.py |
| Close checker | controllers/workflow/success_conditions/close_checker.py |

</div>
