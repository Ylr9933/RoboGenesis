---
title: Robots
---

# Robots

## Overview

RoboGenesis supports 7 robot platforms across different manufacturers. Each robot is implemented as a Python class with RMPFlow motion planning support.

---

## Supported Platforms

| Robot | Gripper | Asset Source | DOF | Manufacturer |
| --- | --- | --- | --- | --- |
| Franka | Prismatic | Isaac Sim CDN | 7 | Franka Robotics |
| FR3 | Prismatic | Isaac Sim CDN | 7 | Franka Robotics |
| UR5e | Robotiq 2F-85 | Isaac Sim CDN | 6 | Universal Robots |
| UR16e | Robotiq 2F-85 | Isaac Sim CDN | 6 | Universal Robots |
| Festo | Robotiq 2F-85 | Isaac Sim CDN | 6 | Festo |
| Piper | Prismatic | Isaac Sim CDN | 6 | AgileX |
| Rizon4 | Robotiq 2F-85 | Isaac Sim CDN | 7 | Flexiv |

---

## Gripper Types

### Prismatic

- **Robots:** Franka, FR3, Piper
- **Description:** Linear motion, parallel jaw gripper built into robot
- **Configuration:** Joint position limits for open/close

### Revolute (Robotiq 2F-85)

- **Robots:** UR5e, UR16e, Rizon4, Festo
- **Description:** 1-DOF with 5 mimic joints for 4-bar linkage
- **Configuration:** use_mimic_joints=True in ParallelGripper

---

## Quick Reference

### Robot Type Strings

```yaml
robot:
  type: "franka"   # or "fr3", "ur5e", "ur16e", "festo", "piper", "rizon4"
```

### Per-Robot Configs

| Robot | Config File |
| --- | --- |
| Franka | robots/franka/franka.py |
| FR3 | robots/fr3/fr3.py |
| UR5e | robots/ur5e/ur5e.py |
| UR16e | robots/ur16e/ur16e_arm.py |
| Festo | robots/festo/festo_arm.py |
| Piper | robots/piper/piper.py |
| Rizon4 | robots/rizon4/rizon4_arm.py |

### Default Positions

```yaml
# Franka
robot.position: [-0.4, -0, 0.71]

# Rizon4 / UR5e
robot.position: [0, 0, 0.71]

# UR16e
robot.position: [-0.5, 0, 0.71]
```

---

## Adding a New Robot

See [Adding a New Robot](./adding-new-robot.md) for a detailed tutorial.

---

## Key Files

| Purpose | File |
| --- | --- |
| Base class | robots/base/generic_arm.py |
| Base utilities | robots/base/__init__.py |
| Robot registry | controllers/robot_configs/registry.py |
| Robot factory | factories/robot_factory.py |
| Franka | robots/franka/franka.py |
| FR3 | robots/fr3/fr3.py |
| UR5e | robots/ur5e/ur5e.py |
| UR16e | robots/ur16e/ur16e_arm.py |
| Festo | robots/festo/festo_arm.py |
| Piper | robots/piper/piper.py |
| Rizon4 | robots/rizon4/rizon4_arm.py |
