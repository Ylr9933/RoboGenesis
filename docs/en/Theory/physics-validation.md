---
title: Physics Validation
---

# Physics Validation

## Overview

RoboGenesis uses NVIDIA Isaac Sim with PhysX for high-fidelity physics simulation. This page documents the physics validation methodology.

---

## Physics Engine

| Component | Description |
| --- | --- |
| Simulation | NVIDIA Isaac Sim |
| Physics | PhysX |
| Scene Format | USD |
| Timestep | 5ms |

---

## Physics Parameters

### Default Configuration

```yaml
physics:
  dt: 0.005              # Simulation timestep
  substeps: 10           # Physics substeps per frame
  gravity: [0, 0, -9.81] # Gravity vector
  solver_type: "TGS"     # Temporal Gauss-Seidel
  contact_offset: 0.01   # Contact distance threshold
  rest_offset: 0.0       # Rest distance
```

---

## Validation Metrics

### Position Accuracy

```python
position_error = np.linalg.norm(simulated_position - expected_position)
```

Target: 1mm error for static objects

### Velocity Accuracy

```python
velocity_error = np.linalg.norm(simulated_velocity - expected_velocity)
```

Target: 5mm/s error for moving objects

### Contact Forces

```python
contact_force = physics_sim.get_contact_force(body_a, body_b)
```

Target: Physically plausible force magnitudes

---

## Gripper Validation

### Grasp Stability

```python
def test_grasp_stability(gripper, object):
    # Apply grasp
    gripper.close()
    object.apply_random_disturbance()
    # Check object remains grasped
    return object in gripper.get_grasped_objects()
```

### Force Closure

```python
def compute_force_closure(object, gripper_contacts):
    # Compute grasp quality metric
    # > 1.0 indicates stable grasp
    return grasp_quality
```

---

## Object Physics

### Mass Properties

```yaml
object:
  mass: 0.5              # kg
  COM: [0, 0, 0.05]     # Center of mass
  inertia: [0.001, 0.001, 0.001]  # Principal moments
```

### Friction Model

```yaml
friction:
  static: 0.8           # Static friction
  dynamic: 0.6          # Dynamic friction
  restitution: 0.2      # Bounce factor
```

---

## Liquid Simulation

### Pour Validation

```python
def validate_pour(source, target, expected_volume):
    initial_target = target.get_liquid_level()
    pour_action()
    final_target = target.get_liquid_level()
    transferred = final_target - initial_target
    error = abs(transferred - expected_volume) / expected_volume
    return error < 0.1  # 10% tolerance
```

### Stir Validation

```python
def validate_stir(beaker, rod, duration):
    # Track liquid rotation
    angular_velocity = compute_liquid_angular_velocity(beaker)
    # Verify mixing occurred
    return angular_velocity > threshold
```

---

## Validation Tests

### Drop Test

```python
def drop_test(object, height):
    # Drop from height
    drop_object(object, height)
    # Measure bounce
    bounce_heights = []
    for _ in range(5):
        bounce_heights.append(measure_bounce(object))
    # Verify energy dissipation
    return all(bounce_heights[i] < bounce_heights[i-1] for i in range(1, len(bounce_heights)))
```

### Slide Test

```python
def slide_test(object, angle, expected_velocity):
    incline_surface(object, angle)
    release_object(object)
    measured_velocity = measure_sliding_velocity(object)
    return abs(measured_velocity - expected_velocity) / expected_velocity < 0.15
```

---

## Performance Metrics

### Simulation Speed

Target: Real-time or faster (1.0x)

```python
sim_time = physics_sim.get_time()
wall_time = time.time() - start
speed = sim_time / wall_time
```

### Physics Stability

```python
def check_stability():
    for body in get_all_bodies():
        velocity = body.get_velocity()
        if np.any(np.abs(velocity) > 100):  # Unrealistic velocity
            return False
    return True
```

---

## Key Files

| 用途 | 文件 |
| --- | --- |
| 仿真配置 | config/simulation.yaml |
| 原子动作控制器 | controllers/atomic_actions/ |
| 场景管理器 | scene_manager/ |
