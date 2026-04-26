---
title: Quick Start
---

# Quick Start

## One-Minute Start

Follow these steps to run your first simulation episode.

---

## Prerequisites

- NVIDIA GPU (RTX series, not A100/A800)
- Ubuntu 24.04
- conda installed
- Isaac Sim 5.1 installed

---

## Step 1: Environment Setup

```bash
# Create and activate environment
conda create -n RoboGenesis python=3.11 -y
conda activate RoboGenesis

# Install PyTorch
pip install torch==2.9.0 torchvision==0.24.0 torchaudio==2.9.0 --index-url https://download.pytorch.org/whl/cu126

# Install Isaac Sim
pip install isaacsim[all,extscache]==5.1.0 --extra-index-url https://pypi.nvidia.com

# Install other dependencies
pip install -r requirements.txt

# Setup VSCode settings
python -m isaacsim --generate-vscode-settings
```

---

## Step 2: Clone and Setup

```bash
git clone https://github.com/your-repo/RoboGenesis.git
cd RoboGenesis
git lfs pull
```

---

## Step 3: Run Data Collection

```bash
# Run pick skill data collection (Franka default)
python main.py --config-name atomic_skills/pick

# Or run pour workflow
python main.py --config-name workflows/workflow_pick_pour
```

Expected output:

```
[INFO] Loading scene from assets/chemistry_lab/...
[INFO] Robot initialized: franka
[INFO] Starting data collection...
[INFO] Episode 1/100 completed, success: True
[INFO] Episode 2/100 completed, success: True
...
```

---

## Step 4: Run Inference

First, modify your config to switch from collect to infer mode:

```yaml
mode: "infer"
infer:
  policy_model_path: "outputs/train/xxx/checkpoints/latest.ckpt"
  policy_config_path: "outputs/train/xxx/.hydra/config.yaml"
  normalizer_path: "outputs/train/xxx/checkpoints/normalize.ckpt"
```

Then run:

```bash
python main.py --config-name atomic_skills/pick mode=infer
```

---

## What's Next?

| Goal | Next Step |
| --- | --- |
| Understand the system | [Architecture](./architecture.md) |
| Install properly | [Installation](../Getting-Started/installation.md) |
| Learn configuration | [Configuration](../Getting-Started/configuration.md) |
| Collect more data | [Data Collection](../Tutorials/data-collection.md) |
| Train a policy | [Training](../Tutorials/training.md) |
| Add a new robot | [Add New Robot](../Robots/adding-new-robot.md) |

---

## Common Commands

| Command | Description |
| --- | --- |
| `python main.py --config-name atomic_skills/pick` | Run pick skill with Franka |
| `python main.py --config-name atomic_skills/rizon4/pick` | Run pick skill with Rizon4 |
| `python main.py --config-name workflows/workflow_pick_pour` | Run pick+pour workflow |
| `python main.py --config-name atomic_skills/pick mode=infer` | Run inference |
| `python scripts/check_registrations.py` | Verify registrations |

---

## Troubleshooting

If you encounter issues, see [Troubleshooting](../Getting-Started/troubleshooting.md) for common solutions.
