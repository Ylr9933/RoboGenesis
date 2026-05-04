---
title: First Episode
---

# First Episode

## Running Your First Simulation

This guide walks you through running your first data collection episode.

---

## Prerequisites

- [ ] RoboGenesis installed (see [Installation](./installation.md))
- [ ] Environment activated (conda activate RoboGenesis)
- [ ] Git LFS assets pulled (git lfs pull)

---

## Step 1: Verify Setup

Check that all components are properly registered:

```bash
python scripts/check_registrations.py
```

**Expected output:**

```
OK: 8 robots in _CLASS_NAME_MAP, 8 in ROBOT_CONFIGS — all mappings resolve
```

---

## Step 2: Run Atomic Skill

Run a simple pick skill with the default Franka robot:

```bash
python main.py --config-name atomic_skills/pick
```

**What happens:**

1. Isaac Sim launches with the chemistry lab scene
2. Franka robot is loaded and initialized
3. An object (conical bottle) is placed in the scene
4. Scripted pick controller executes 7-phase pick skill
5. Data is collected (images, joint states, actions)
6. Episode ends after success or max_steps

---

## Step 3: Understand the Output

Successful collection creates:

```text
outputs/collect/
└── 2026.04.24/
    └── 12.34.56_atomic_pick/
        ├── dataset/
        │   ├── meta/
        │   │   └── episode.jsonl  # Records the number of successful actions
        │   ├── episode_000.h5     # HDF5 file containing episode data
        │   ├── episode_001.h5
        │   └── ...
        ├── results/
        │   ├── episode_0_success.json   # Saves execution steps of the robotic arm
        │   ├── episode_1_success.json
        │   └── ...
        ├── video/                       # Stores success/failure videos
        │   ├── episode_0_success.mp4
        │   ├── episode_1_success.mp4
        │   └── ...
        └── config.yaml  # Saved configuration
```

### HDF5 Episode Structure

Each episode contains:

| Field | Description |
| --- | --- |
| observation.images.camera_1_rgb | RGB image from camera 1 |
| observation.images.camera_2_rgb | RGB image from camera 2 |
| observation.robot_state.joint_positions | Joint positions [7] |
| observation.robot_state.gripper_state | Gripper state [2] |
| action | Policy action [9] |
| timestamp | Episode timestamp |

---

## Step 4: Run a Different Robot

```bash
# Run with Rizon4
python main.py --config-name atomic_skills/rizon4/pick

# Run with UR5e
python main.py --config-name atomic_skills/ur5e/pick

# Run with FR3
python main.py --config-name atomic_skills/fr3/pick
```

---

## Step 5: Run a Workflow

Run a multi-step workflow combining multiple skills:

```bash
# Pick + Pour workflow
python main.py --config-name workflows/workflow_pick_pour

# Heat + Stir reaction
python main.py --config-name workflows/workflow_heat_stir_reaction

# Clean beaker protocol
python main.py --config-name workflows/workflow_clean_beaker
```

---

## Step 6: Run Inference

First, ensure you have a trained model. Then modify the config:

```yaml
# In your config file
mode: "infer"
infer:
  type: "local"
  policy_model_path: "outputs/train/checkpoints/latest.ckpt"
  policy_config_path: "outputs/train/.hydra/config.yaml"
  normalizer_path: "outputs/train/checkpoints/normalize.ckpt"
```

Run inference:

```bash
python main.py --config-name atomic_skills/pick mode=infer
```

---

## Command Reference

| Command | Description |
| --- | --- |
| `python main.py --config-name atomic_skills/pick` | Run pick with Franka |
| `python main.py --config-name atomic_skills/rizon4/pick` | Run pick with Rizon4 |
| `python main.py --config-name workflows/workflow_pick_pour` | Run pick+pour workflow |
| `python main.py --config-name workflows/workflow_heat_stir_reaction_franka` | Run heat+stir with Franka |
| `python main.py --config-name atomic_skills/pick mode=infer` | Run inference |
| `python main.py --config-name atomic_skills/pick headless=True` | Run headless |

---

## Common Output Paths

| Mode | Output Directory |
| --- | --- |
| collect | outputs/collect/ |
| infer | outputs/infer/ |
| train | outputs/train/ |

---

## Next Steps

| Goal | Next Step |
| --- | --- |
| Collect more data | [Data Collection](../../Tutorials/data-collection.md) |
| Train a policy | [Training](../../Tutorials/training.md) |
| Run inference | [Inference](../../Tutorials/inference.md) |
| Understand skill system | [Skills](../../Skills/atomic-skills.md) |
| Troubleshoot issues | [Troubleshooting](./troubleshooting.md) |
