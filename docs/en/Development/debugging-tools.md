---
title: Debugging Tools
---

# Debugging Tools

## Overview

RoboGenesis provides debugging tools for replaying episodes and diagnosing issues.

---

## Registration Checker

Verifies all robots and skills are properly registered.

### Usage

```bash
python scripts/check_registrations.py
```

### Expected Output

```
OK: 8 robots in _CLASS_NAME_MAP, 8 in ROBOT_CONFIGS — all mappings resolve
```

### What it Checks

- All robots in _CLASS_NAME_MAP exist in ROBOT_CONFIGS
- All robots in ROBOT_CONFIGS exist in _CLASS_NAME_MAP
- Config files can be loaded
- Import paths are valid

---

## Replay Tool

Replay collected episodes to visualize and debug.

### Usage

```bash
python scripts/labgen_replay.py --episode outputs/collect/xxx/episode_000.h5
```

### Options

```bash
# Specify episode file
python scripts/labgen_replay.py --episode /path/to/episode.h5

# Specify camera
python scripts/labgen_replay.py --episode /path/to/episode.h5 --camera camera_1

# Loop playback
python scripts/labgen_replay.py --episode /path/to/episode.h5 --loop
```

---

## Debug Mode

Enable verbose logging for detailed debugging.

### Usage

```bash
# Run with debug logging
python main.py --config-name atomic_skills/pick log_level=DEBUG

# Or in config
python main.py --config-name atomic_skills/pick --override log_level=DEBUG
```

### Log Levels

| Level | Description |
| --- | --- |
| DEBUG | Detailed debugging information |
| INFO | General information |
| WARNING | Warning messages |
| ERROR | Error messages |

---

## Physics Debug

### Check Collision

```python
# In controller

if self._check_collision():
    print("Collision detected!")
    self._handle_collision()
```

### Visualize Collision Spheres

```yaml
# In config

physics:
  visualize_collision_spheres: true
  collision_sphere_radius: 0.02
```

---

## RMPFlow Debug

### Check Trajectory

```python
# In controller

trajectory = self.rmpflow_controller.get_trajectory()
print("Trajectory points:", len(trajectory))

# Check for NaN
if np.any(np.isnan(trajectory)):
    print("Warning: NaN in trajectory!")
```

---

## Camera Debug

### Verify Camera Data

```python
# In task

camera_data = self.get_camera_data("camera_1")
print("RGB shape:", camera_data["rgb"].shape)
print("Depth shape:", camera_data["depth"].shape)

# Check for empty data
if camera_data["rgb"] is None:
    print("Warning: No RGB data!")
```

---

## Common Debug Scenarios

### Robot Not Moving

Check RMPFlow is initialized. Verify joint limits. Check for NaN in action.

```python
print("Action:", action)
print("NaN in action:", np.any(np.isnan(action)))
```

### Skill Not Completing

Check success condition threshold. Verify phase progression. Check transition manager.

```python
print("Current phase:", controller._event)
print("Phase progress:", controller._t)
```

### Object Not Found

Verify object path in scene. Check position range. Validate USD file exists.

```bash
ls -la assets/chemistry_lab/
```

---

## Performance Profiling

### Timing

```python
import time

start = time.time()
action = controller.forward()
elapsed = time.time() - start
print(f"Controller forward took {elapsed*1000:.2f}ms")
```

### Memory

```python
import tracemalloc

tracemalloc.start()
# Run code
current, peak = tracemalloc.get_traced_memory()
print(f"Peak memory: {peak / 1024 / 1024:.2f} MB")
tracemalloc.stop()
```

---

## Key Files

| 用途 | 文件 |
| --- | --- |
| 注册检查脚本 | scripts/check_registrations.py |
| 回放脚本 | scripts/labgen_replay.py |
| 工作流引擎 | controllers/workflow/workflow_engine.py |
| 工具 | lab_utils/ |
