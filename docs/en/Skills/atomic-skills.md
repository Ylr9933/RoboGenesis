# Atomic Skills

## Overview

RoboGenesis provides 10 atomic skills (pick, place, pour, stir, shake, press, pressZ, open, close, move) as building blocks for more complex workflows. Each skill is implemented as a state machine controller with phase-based progression.

All skill controllers follow a unified architecture pattern: `self._event` controls the current phase, `self._t` tracks phase progress, and `events_dt` controls the step increment per frame.

---

## Skill Overview

<div style="text-align: center; margin: 1.5em 0;" markdown>

| Skill | Phases | Description | Controller File |
| --- | --- | --- | --- |
| pick | 7 | Pick up object | pick_controller.py |
| place | 6 | Place object at target | place_controller.py |
| pour | 6 | Pour liquid between containers | pour_controller.py |
| stir | 5 | Stir contents in container | stir_controller.py |
| shake | 10 | Shake/mix contents | shake_controller.py |
| press | 3 | Press operation (X-axis) | press_controller.py |
| pressZ | 3/4 | Z-axis aligned press | pressZ_controller.py |
| open | 8 | Open door/container | open_controller.py |
| close | 3 | Close door/container | close_controller.py |
| move | single | Move to target position | move_controller.py |

</div>

---

## Skill Controller Architecture

All atomic skill controllers follow the same pattern:

```python
class SkillController(BaseController):
    def __init__(self, name, cspace_controller, events_dt=None, ...):
        self._event = 0      # Current phase
        self._t = 0.0        # Phase progress [0, 1]
        self._events_dt = events_dt or [dt1, dt2, ...]  # Step increment per phase

    def forward(self, ...):
        """Execute action for current phase"""
        if self._event == 0:
            return self._phase_0()
        elif self._event == 1:
            return self._phase_1()
        # ...

        # Phase advancement
        self._t += self._events_dt[self._event]
        if self._t >= 1.0:
            self._event += 1
            self._t = 0

        return action

    def is_done(self):
        """Check if all phases complete"""
        return self._event >= len(self._events_dt)

    def reset(self):
        """Reset to initial state"""
        self._event = 0
        self._t = 0
```

**Phase Advancement Mechanism**:

- `events_dt[i]` controls step increment per frame for phase i (phase transitions when accumulated reaches 1.0)
- Smaller value = longer wait = more precise; value = 1 = skip immediately
- Default `events_dt` for all skills are centrally managed in `controllers/workflow/skill_defaults.py`

**Gripper Adaptation**:

- `GripperAdapter` uniformly handles differences between robot grippers (prismatic vs revolute)
- `apply_to_action(joint_positions, gap_meters)` - close to specified gap
- `apply_open_to_action(joint_positions)` - open gripper

---

## Pick

### Controller

`controllers/atomic_actions/pick_controller.py`

### 7 Phases

```text
Phase 0: Move above object (offset calculated from approach direction)
Phase 1: Horizontal approach buffer (adjust pre_offset_x direction)
Phase 2: Lower to grasp position (add pickz_offset)
Phase 3: Wait for dynamics to settle
Phase 4: Close gripper to grasp (with virtual attach support)
Phase 5: Lift object to target position
Phase 6: Complete
```

### Key Parameters

```yaml
skill: "pick"
params:
  end_effector_euler: [0, 90, 30]   # TCP orientation [Roll, Pitch, Yaw] degrees
  events_dt: [0.002, 0.002, 0.005, 0.02, 0.08, 0.01, 0.02]  # 7 phases
  pre_offset_x: 0.05                # Pre-grasp X offset (m)
  pre_offset_z: 0.05                # Pre-grasp Z offset (m)
  after_offset_z: 0.3               # Post-grasp lift height (m)
  gripper_distances: null           # Gripper gap (null=from object_properties.yaml)
```

### Grasp Offset Calculation

```python
# Priority:
# 1. pickz_offset_override (forward param, for special cases like re-pick from heater)
# 2. config/object_properties.yaml per-object value
# 3. Dynamic fallback = object_size[2] * 2 / 5
```

### Virtual Attach

Supports virtual attachment for:

- Objects declared with `needs_virtual_attach` in object_properties.yaml (e.g., glass_rod)
- Robots that force virtual attach (e.g., piper when physical gripper unavailable)

---

## Place

### Controller

`controllers/atomic_actions/place_controller.py`

### 6 Phases

```
Phase 0: Pre-place (elevated approach, target_z += pre_place_z)
Phase 1: Lower to target (target_z += place_offset_z)
Phase 2: Wait for stability
Phase 3: Open gripper to release object (via GripperAdapter)
Phase 4: Retreat (X-0.15, Z+0.15)
Phase 5: Complete
```

### Key Parameters

```yaml
skill: "place"
params:
  end_effector_euler: [0, 90, 30]
  events_dt: [0.005, 0.01, 0.08, 0.05, 0.01, 0.1]  # 6 phases
  pre_place_z: 0.2            # Starting height for descent (m)
  place_offset_z: 0.05        # Hover height above target (m)
```

---

## Pour

### Controller

`controllers/atomic_actions/pour_controller.py`

### 6 Phases

```
Phase 0: Move above target (add random height from height_range_1)
Phase 1: Fine-tune position and height (add height_range_2 + object_size/2 + pickz_offset)
Phase 2: Switch wrist to velocity mode, start pouring (positive velocity)
Phase 3: Hold (pause pouring)
Phase 4: Reverse (negative velocity, return to upright)
Phase 5: Hold, complete
```

### Key Parameters

```yaml
skill: "pour"
params:
  end_effector_euler: [0, 90, 30]
  events_dt: [0.006, 0.002, 0.009, 0.01, 0.009, 0.01]  # 6 phases
  pour_speed: -1                    # Pour angular velocity (rad/s, default -120°/s)
  height_range_1: [0.3, 0.4]       # Phase 0 height range (m)
  height_range_2: [0.1, 0.2]       # Phase 1 height range (m)
```

### Wrist Joint Control

- 7-DOF robots: wrist_dof_index = 6
- 6-DOF robots: wrist_dof_index = 5
- Phases 2/4 switch to velocity mode, phases 3/5 switch back to position mode

---

## Stir

### Controller

`controllers/atomic_actions/stir_controller.py`

### 5 Phases

```text
Phase 0: Lift/hold current position (Z raised to safe height)
Phase 1: Move horizontally above beaker
Phase 2: Lower into beaker (safe depth)
Phase 3: Stirring motion (circular path, XY offset calculated in real-time)
Phase 4: Lift out of beaker
```

### Key Parameters

```yaml
skill: "stir"
params:
  end_effector_euler: [0, 90, -10]    # TCP orientation during stir
  events_dt: [0.004, 0.004, 0.005, 0.001, 0.004]  # 5 phases
  stir_radius: 0.009                  # Stirring circle radius (m)
  stir_speed: 3.0                     # Stirring angular velocity
  target_height: 0.12                 # Beaker height (for safe depth calculation)
```

### Safe Depth Calculation

```python
# Ensure glass rod tip stays at least 2cm above beaker bottom
half_h = target_height / 2
rod_extends = 0.12  # Glass rod extension length
safe_min = max(rod_extends - half_h + 0.02, 0.02)
```

---

## Shake

### Controller

`controllers/atomic_actions/shake_controller.py`

### 10 Phases

```
Phase 0: Record shake center (first frame gripper_position)
Phase 1: Hold position
Phase 2: Move to center - shake_distance (Y-axis)
Phase 3: Move to center + shake_distance (Y-axis)
Phase 4: Move to center - shake_distance (Y-axis)
Phase 5: Move to center + shake_distance (Y-axis)
Phase 6: Move to center - shake_distance (Y-axis)
Phase 7: Move to center + shake_distance (Y-axis)
Phase 8: Return to center
Phase 9: Complete
```

### Key Parameters

```yaml
skill: "shake"
params:
  end_effector_euler: [0, 90, 10]
  events_dt: [0.02, 0.018, 0.018, 0.018, 0.018, 0.018, 0.018, 0.018, 0.018, 0.015]  # 10 phases
  shake_distance: 0.1              # Shake amplitude (m)
```

### Adaptive Height

Shake center is automatically recorded from the first frame gripper_position, adapting to any table height.

---

## Press

### Controller

`controllers/atomic_actions/press_controller.py`

### 3 Phases

```
Phase 0: Move in front of target (X -= initial_offset)
Phase 1: Close gripper
Phase 2: Press forward (X += press_distance)
```

### Key Parameters

```yaml
skill: "press"
params:
  end_effector_euler: [0, 90, 10]
  events_dt: [0.005, 0.1, 0.005]   # 3 phases
  initial_offset: 0.2              # Initial distance in front of target (m)
  press_distance: 0.04             # Press depth (m)
```

---

## PressZ

### Controller

`controllers/atomic_actions/pressZ_controller.py`

### 3 or 4 Phases (Optional 4th)

```text
Phase 0: Approach above target (Z += initial_offset)
Phase 1: Close gripper
Phase 2: Z-axis press (Z += press_z_tcp_offset)
Phase 3 (optional): Retract and open gripper (for workflow composition, avoiding semi-closed gripper interfering with next skill)
```

### Key Parameters

```yaml
skill: "pressZ"
params:
  end_effector_euler: [0, 90, 10]
  events_dt: [0.005, 0.01, 0.01]   # 3 phases (configurable to 4)
  initial_offset: 0.2              # Approach height (m)
  press_z_tcp_offset: 0.031        # TCP fingertip compensation (m, Franka default)
```

### Use Cases

Suitable for press scenarios requiring Z-axis alignment, such as buttons and switches.

---

## Open

### Controller

`controllers/atomic_actions/open_controller.py`

### 8 Phases

```
Phase 0: APPROACH - Move to front of handle (X -= approach_offset_x)
Phase 1: FINE_ADJUST - Fine-tune to grip position (X -= fine_adjust_x)
Phase 2: GRIP - Close gripper to grasp handle
Phase 3: ARC_PULL - Arc pull door (rotation interpolation around Z, angle=angle)
Phase 4: IDLE - Wait for door to stabilize
Phase 5: RELEASE - Open gripper to release handle
Phase 6: RETREAT - Move away from door (X -= retreat_x, Y ± retreat_y)
Phase 7: DONE - Complete
```

### Key Parameters

```yaml
skill: "open"
params:
  end_effector_euler: [0, 110, 0]
  events_dt: [0.0025, 0.005, 0.0075, 0.002, 0.05, 0.05, 0.01, 0.004]  # 8 phases
  angle: 50.0                      # Door opening angle (degrees)
  furniture_type: "door"           # Furniture type
  approach_offset_x: 0.08         # Approach X offset (m)
  fine_adjust_x: 0.015             # Fine adjustment X offset (m)
  grip_offset_x: 0.0              # Grip X offset (m)
  grip_gap: 0.01                   # Gripper closing gap (m)
  pull_time_max: 1.0              # Max arc pull time (Festo uses 12.0)
  retreat_x: 0.06                  # Retreat X offset (m)
  retreat_y: 0.04                  # Retreat Y offset (m)
  retreat_z: 0.0                    # Retreat Z offset (m)
```

### Arc Interpolation

Uses SLERP (Spherical Linear Interpolation) for position and rotation arc interpolation, ensuring smooth end effector trajectory during rotation around door axis.

---

## Close

### Controller

`controllers/atomic_actions/close_controller.py`

### 3 Phases

```
Phase 0: APPROACH - Move to front of handle (X -= approach_offset_x, Z += approach_offset_z)
Phase 1: ARC_PUSH - Arc push door (reverse rotation around Z)
Phase 2: RETREAT - Wait for inertia to dissipate, then retreat (retreat_dwell_t)
```

### Key Parameters

```yaml
skill: "close"
params:
  end_effector_euler: [350, 90, 25]
  events_dt: [0.0025, 0.005, 0.005]  # 3 phases
  angle: 50.0                      # Door closing angle (degrees)
  furniture_type: "door"
  approach_offset_x: 0.05         # Approach X offset (m)
  approach_offset_y: 0.0           # Approach Y offset (m)
  approach_offset_z: 0.1          # Approach Z offset (m)
  retreat_offset_x: 0.2            # Retreat X offset (m)
  retreat_dwell_t: 0.0            # Wait time after push
  retreat_threshold: 0.03         # Retreat distance threshold (m)
  regrip_gap: null                 # Re-grip gap (optional, for openclose composition)
```

### regrip_gap Usage

When workflow has open followed by close, the open phase releases the gripper, and close needs to re-grasp the handle. The `regrip_gap` parameter controls:

- Phase 0: Open gripper to let handle enter
- Phase 1: Close to specified gap to grasp

---

## Move

### Controller

`controllers/atomic_actions/move_controller.py`

### Single Phase Control

Directly moves to target position via cspace_controller, using position threshold for completion detection.

### Supported Movement Modes

**Single-point movement**:

```yaml
skill: "move"
params:
  end_effector_euler: [0, 90, 30]
  position_threshold: 0.02         # Position threshold (m)
  orientation_threshold: 0.1       # Orientation threshold
```

**Multi-segment path movement**:

```python
move_controller.forward_multi_segment(
    waypoints=[p1, p2, p3],  # Path point list
    current_joint_positions=...,
    gripper_position=...,
    target_orientation=...
)
```

**Two-segment movement (vertical + horizontal)**:

```python
move_controller.forward_two_points(
    first_position=p1,       # Intermediate point
    final_position=p2,       # Final target
    ...
)
```

---

## Default Parameter Management

All skill default parameters are centrally managed in `controllers/workflow/skill_defaults.py`:

### End Effector Orientation

```python
SKILL_DEFAULT_EE_EULER = {
    "pick":   [0, 90, 30],
    "place":  [0, 90, 30],
    "pour":   [0, 90, 30],
    "shake":  [0, 90, 10],
    "stir":   [0, 90, -10],
    "open":   [0, 110, 0],
    "close":  [350, 90, 25],
    "press":  [0, 90, 10],
    "pressZ": [0, 90, 10],
}
```

### Phase Timing

```python
SKILL_DEFAULT_EVENTS_DT = {
    "pick":   [0.002, 0.002, 0.005, 0.02, 0.08, 0.01, 0.02],
    "place":  [0.005, 0.01, 0.08, 0.05, 0.01, 0.1],
    "pour":   [0.006, 0.002, 0.009, 0.01, 0.009, 0.01],
    "stir":   [0.004, 0.004, 0.005, 0.001, 0.004],
    "press":  [0.005, 0.1, 0.005],
    "pressZ": [0.004, 0.02, 0.01],
    "open":   [0.0025, 0.005, 0.0075, 0.002, 0.05, 0.05, 0.01, 0.004],
    "close":  None,   # Uses controller internal default [0.0025, 0.005, 0.005]
    "shake":  None,    # ShakeController manages internally
}
```

### Robot Overrides

Different robots have targeted override parameters:

```python
ROBOT_SKILL_OVERRIDES = {
    "piper": {  # Piper uses [90, 0, 0] orientation
        "pick": {"end_effector_euler": [90, 0, 0], ...},
        "place": {"end_effector_euler": [90, 0, 0]},
        ...
    },
    "fr3": {"pick": {"end_effector_euler": [0, 90, 30]}, ...},
    "ur5e": {...},
    "ur16e": {...},
    "festo": {...},
    "rizon4": {...},
}
```

### Parameter Merge Priority

```text
YAML explicit params > Robot overrides > Global defaults
```

---

## Skill Registry

Skills are registered in `controllers/workflow/skill_registry.py`:

```python
from controllers.workflow.skill_registry import create_skill_controller, SUPPORTED_SKILLS

# Create controller
controller = create_skill_controller(
    skill_type="pick",
    name="my_pick",
    rmp_controller=rmp_ctrl,
    robot=robot,
    events_dt=None,        # None=use default
    params={},            # YAML params
    robot_type="franka"
)

# Check support
if "pick" in SUPPORTED_SKILLS:
    ...
```

---

## Configuration Examples

### config/atomic_skills/pick.yaml

```yaml
skill: "pick"
params:
  end_effector_euler: [0, 90, 30]
  events_dt: [0.002, 0.002, 0.005, 0.02, 0.08, 0.01, 0.02]
  pre_offset_x: 0.05
  pre_offset_z: 0.05
  after_offset_z: 0.3
```

### config/atomic_skills/stir.yaml

```yaml
skill: "stir"
params:
  end_effector_euler: [0, 90, -10]
  events_dt: [0.004, 0.004, 0.005, 0.001, 0.004]
  stir_radius: 0.009
  stir_speed: 3.0
  target_height: 0.12
```

---

## Key Files

<div style="text-align: center; margin: 1.5em 0;" markdown>

| Purpose | File Path |
| --- | --- |
| Pick controller | controllers/atomic_actions/pick_controller.py |
| Place controller | controllers/atomic_actions/place_controller.py |
| Pour controller | controllers/atomic_actions/pour_controller.py |
| Stir controller | controllers/atomic_actions/stir_controller.py |
| Shake controller | controllers/atomic_actions/shake_controller.py |
| Press controller | controllers/atomic_actions/press_controller.py |
| PressZ controller | controllers/atomic_actions/pressZ_controller.py |
| Open controller | controllers/atomic_actions/open_controller.py |
| Close controller | controllers/atomic_actions/close_controller.py |
| Move controller | controllers/atomic_actions/move_controller.py |
| Skill defaults | controllers/workflow/skill_defaults.py |
| Skill registry | controllers/workflow/skill_registry.py |
| Gripper adapters | controllers/gripper_adapters/ |
| Plugin registry | controllers/atomic_actions/_plugin.py |

</div>
