---
title: Quick Start
---

# Quick Start

## Run in One Minute

```bash
# Data collection (default Franka)
python main.py --config-name atomic_skills/pick

# Specify robot
python main.py --config-name atomic_skills/rizon4/pick

# Multi-step workflow
python main.py --config-name workflows/workflow_pick_pour

# Model inference
python main.py --config-name atomic_skills/pick mode=infer
```

Expected output:

```text
[INFO] Loading scene from assets/chemistry_lab/...
[INFO] Robot initialized: franka
[INFO] Starting data collection...
[INFO] Episode 1/100 completed, success: True
[INFO] Episode 2/100 completed, success: True
...
```

For detailed steps, see [First Episode](../Getting-Started/first-episode.md).
