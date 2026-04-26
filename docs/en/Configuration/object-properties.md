---
title: Object Property Configuration
---

# Object Property Configuration

## Overview

This page documents the `object_properties.yaml` configuration that defines per-object geometry and gripper parameters.

---

## Config File

**File:** `config/object_properties.yaml`

```yaml
object_name:
  geometry_type: "cylinder"    # cylinder, box, sphere
  dimensions: [0.03, 0.10]     # Depends on geometry_type
  gripper_offset: 0.025         # Offset for grasping
  mass: 0.5                     # Mass in kg
  friction: 0.8                 # Friction coefficient
```

---

## Geometry Types

### Cylinder

```yaml
conical_bottle02:
  geometry_type: "cylinder"
  dimensions: [radius, height]
  # Example: radius=0.03, height=0.10
```

### Box

```yaml
box_object:
  geometry_type: "box"
  dimensions: [width, height, depth]
```

### Sphere

```yaml
sphere_object:
  geometry_type: "sphere"
  dimensions: [radius]
```

---

## Object Examples

### Conical Bottle

```yaml
conical_bottle02:
  geometry_type: "cylinder"
  dimensions: [0.03, 0.10]  # radius=3cm, height=10cm
  gripper_offset: 0.025      # 2.5cm offset for grasp
  mass: 0.5                  # 500g
  friction: 0.8
```

### Beaker

```yaml
beaker_2:
  geometry_type: "cylinder"
  dimensions: [0.04, 0.10]  # radius=4cm, height=10cm
  gripper_offset: 0.02
  mass: 0.3
  friction: 0.6
```

### Pipette

```yaml
pipette:
  geometry_type: "cylinder"
  dimensions: [0.01, 0.15]  # radius=1cm, height=15cm
  gripper_offset: 0.01
  mass: 0.1
  friction: 0.5
```

---

## Gripper Offset

The gripper_offset parameter specifies how far the gripper should approach from the object center for stable grasping.

```yaml
# Example: grasping a beaker
beaker:
  gripper_offset: 0.02  # Approach 2cm from center
  # This affects pick skill approach

skill: "pick"
target_object: "beaker"
params:
  pre_offset_z: 0.05  # Additional approach offset
```

---

## Physics Properties

### Mass

```yaml
object:
  mass: 0.5  # kg
```

### Friction

```yaml
object:
  friction: 0.8  # Coefficient of friction
```

---

## Complete Example

**File:** `config/object_properties.yaml`

```yaml
# Lab equipment
conical_bottle02:
  geometry_type: "cylinder"
  dimensions: [0.03, 0.10]
  gripper_offset: 0.025
  mass: 0.5
  friction: 0.8

beaker_2:
  geometry_type: "cylinder"
  dimensions: [0.04, 0.10]
  gripper_offset: 0.02
  mass: 0.3
  friction: 0.6

beaker_small:
  geometry_type: "cylinder"
  dimensions: [0.025, 0.08]
  gripper_offset: 0.015
  mass: 0.2
  friction: 0.6

test_tube:
  geometry_type: "cylinder"
  dimensions: [0.015, 0.12]
  gripper_offset: 0.01
  mass: 0.1
  friction: 0.5

pipette:
  geometry_type: "cylinder"
  dimensions: [0.01, 0.15]
  gripper_offset: 0.01
  mass: 0.05
  friction: 0.4

# Boxes and containers
storage_box:
  geometry_type: "box"
  dimensions: [0.10, 0.05, 0.08]
  gripper_offset: 0.03
  mass: 0.2
  friction: 0.7

lid:
  geometry_type: "box"
  dimensions: [0.08, 0.01, 0.08]
  gripper_offset: 0.005
  mass: 0.1
  friction: 0.5
```

---

## Key Files

| File | Description |
| --- | --- |
| config/object_properties.yaml | Object properties configuration |
| controllers/atomic_actions/pick_controller.py | Pick controller |
| tasks/workflow_task.py | Workflow task |
