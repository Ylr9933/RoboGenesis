---
title: Custom Workflow
---

# Custom Workflow

## Overview

RoboGenesis allows composing custom workflows from atomic skills. This tutorial shows how to create new workflow configurations.

---

## Workflow Structure

A workflow consists of:

- **Scene objects:** Objects in the scene (beakers, bottles, etc.)
- **Steps:** Ordered list of skills to execute

---

## Step 1: Define Scene Objects

```yaml
workflow:
  table_prim_path: "/World/table"
  language_instruction: "Pick source beaker and pour into target"
  scene_objects:
    - name: "source_beaker"
      path: "/World/beaker_2"
      position_range:
        x: [0.20, 0.28]
        y: [0.05, 0.12]
        z: [0.06, 0.065]
    - name: "target_beaker"
      path: "/World/target_beaker"
      position_range:
        x: [0.35, 0.45]
        y: [-0.10, 0.05]
        z: [0.06, 0.065]
```

---

## Step 2: Add Skills Steps

```yaml
steps:
  - skill: "pick"
    target_object: "source_beaker"
    params:
      end_effector_euler: [0, 90, 30]
      events_dt: [0.002, 0.002, 0.005, 0.02, 0.08, 0.01, 0.02]
      pre_offset_x: 0.05
      pre_offset_z: 0.05
      after_offset_z: 0.4
  - skill: "pour"
    target_object: "target_beaker"
    params:
      events_dt: [0.006, 0.002, 0.009, 0.01, 0.009, 0.01]
      pour_speed: -1
```

---

## Step 3: Complete Config

**File:** `config/workflows/my_custom_workflow.yaml`

```yaml
name: my_custom_workflow
task_type: "workflow"
controller_type: "workflow"
mode: "collect"
usd_path: "assets/chemistry_lab/lab.usd"

workflow:
  table_prim_path: "/World/table"
  language_instruction: "Custom workflow description"
  scene_objects:
    - name: "source_beaker"
      path: "/World/beaker_2"
      position_range:
        x: [0.20, 0.28]
        y: [0.05, 0.12]
        z: [0.06, 0.065]
    - name: "target_beaker"
      path: "/World/target_beaker"
      position_range:
        x: [0.35, 0.45]
        y: [-0.10, 0.05]
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

task:
  max_steps: 2000
  max_episodes: 100
  cameras_names: ["camera_1"]
  cameras:
    - prim_path: "/World/Camera1"
      name: "camera_1"
      translation: [2, 0, 2]
      resolution: [256, 256]
      focal_length: 6
      orientation: [0.61237, 0.35355, 0.35355, 0.61237]
      image_type: "rgb"
robot:
  type: "franka"
  position: [-0.4, -0, 0.71]
collector:
  type: "default"
  compression: null
```

---

## Step 4: Run Workflow

```bash
python main.py --config-name workflows/my_custom_workflow
```

---

## Workflow Templates

### Simple Pick + Pour

```yaml
steps:
  - skill: "pick"
    target_object: "source_object"
  - skill: "move"
    target_position: [x, y, z]
  - skill: "place"
    target_object: "target_object"
```

### Heat + Stir Reaction

```yaml
steps:
  - skill: "pick"
    target_object: "beaker"
  - skill: "move"
    target_position: [0.3, 0, 0.8]
  - skill: "press"
    target_object: "hotplate"
    params:
      press_force: 10.0
  - skill: "stir"
    target_object: "beaker"
    params:
      stir_duration: 5.0
```

### Double Rinse Protocol

```yaml
steps:
  - skill: "pick"
    target_object: "beaker"
  - skill: "move"
    target_position: [sink_x, sink_y, sink_z]
  - skill: "shake"
    params:
      amplitude: 0.1
      duration: 2.0
  - skill: "move"
    target_position: [rinse_x, rinse_y, rinse_z]
  - skill: "shake"
    params:
      amplitude: 0.1
      duration: 2.0
```

---

## Skill Parameters

### Pick Parameters

| Parameter | Default | Description |
| --- | --- | --- |
| end_effector_euler | [0, 90, 30] | TCP orientation |
| events_dt | [0.002, ...] | Phase durations |
| pre_offset_x | 0.05 | Pre-grasp X offset |
| pre_offset_z | 0.05 | Pre-grasp Z offset |
| after_offset_z | 0.4 | Post-grasp lift height |

### Place Parameters

| Parameter | Default | Description |
| --- | --- | --- |
| end_effector_euler | [0, 90, 30] | TCP orientation |
| events_dt | [0.005, ...] | Phase durations |
| pre_offset_z | 0.3 | Approach height |

### Pour Parameters

| Parameter | Default | Description |
| --- | --- | --- |
| events_dt | [0.006, ...] | Phase durations |
| pour_speed | -1 | Pour velocity |

### Stir Parameters

| Parameter | Default | Description |
| --- | --- | --- |
| events_dt | [0.005, ...] | Phase durations |
| stir_radius | 0.02 | Stirring circle radius |
| stir_speed | 1.0 | Stirring speed |

---

## Adding New Skill Types

### 1. Create Controller

**File:** `controllers/atomic_actions/new_skill_controller.py`

```python
class NewSkillController:
    def __init__(self, task, robot, cfg):
        self._event = 0
        self._t = 0.0

    def forward(self):
        if self._event == 0:
            return self._phase_0()
        # ...

    def is_done(self):
        return self._event >= self._num_phases
```

### 2. Register Skill

**File:** `controllers/workflow/skill_registry.py`

```python
SKILL_CONTROLLER_MAP["new_skill"] = "controllers.atomic_actions.new_skill_controller.NewSkillController"
```

### 3. Add Defaults

**File:** `controllers/workflow/skill_defaults.py`

```python
SKILL_DEFAULT_EE_EULER["new_skill"] = [0, 90, 0]
SKILL_DEFAULT_EVENTS_DT["new_skill"] = [0.1, 0.1]
```

### 4. Use in Workflow

```yaml
steps:
  - skill: "new_skill"
    target_object: "object_name"
    params:
      custom_param: value
```

---

## Best Practices

- **Start simple:** Test individual skills before composing
- **Use templates:** Start from existing workflows
- **Validate objects:** Ensure object paths exist in scene
- **Tune parameters:** Adjust timing and offsets per task
- **Test sequentially:** Run each step individually first

---

## Key Files

| Purpose | File |
| --- | --- |
| Workflow configs | config/workflows/ |
| Skill executor | controllers/workflow/skill_executor.py |
| Skill defaults | controllers/workflow/skill_defaults.py |
| Skill registry | controllers/workflow/skill_registry.py |

---

## Next Steps

| Goal | Next Tutorial |
| --- | --- |
| Data collection | [Data Collection](./data-collection.md) |
| Training | [Training](./training.md) |
| Add new robot | [Adding a New Robot](../../Robots/adding-new-robot.md) |
