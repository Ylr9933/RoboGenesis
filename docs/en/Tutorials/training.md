---
title: Training
---

# Training

## Overview

RoboGenesis supports training robot policies using collected HDF5 data. Two model architectures are supported: ACT (Action Chunking Transformer) and Diffusion UNet.

---

## Prerequisites

- Collected dataset in `outputs/collect/`
- GPU with CUDA support
- PyTorch 2.9.0+

---

## Step 1: Prepare Dataset

Ensure your dataset has episodes:

```
outputs/collect/2026.04.24/12.34.56_atomic_pick/
└── dataset/
    ├── episode_000.h5
    ├── episode_001.h5
    └── ...
```

---

## Step 2: Select Training Config

### Diffusion Model (Recommended)

```bash
python train.py --config-name=train_diffusion_unet_image_workspace
```

### ACT Model

```bash
python train.py --config-name=train_act_image_workspace
```

---

## Step 3: Configure Training

### Diffusion Config

**File:** `policy/config/train_diffusion_unet_image_workspace.yaml`

```yaml
# Model configuration
policy:
  _target_: policy.policy.diffusion_unet_image_policy.DiffusionUnetImagePolicy
  shape_meta: ${shape_meta}

# Noise scheduler
noise_scheduler:
  num_train_timesteps: 100
  beta_start: 0.0001
  beta_end: 0.02
  beta_schedule: squaredcos_cap_v2

# Observation encoder
obs_encoder:
  _target_: policy.model.vision.multi_image_obs_encoder.MultiImageObsEncoder
  rgb_model:
    _target_: policy.model.vision.model_getter.get_resnet
    name: resnet18
    resize_shape: [256, 256]
    random_crop: False

# Training parameters
training:
  device: "cuda:0"
  seed: 42
  num_epochs: 8000
  lr: 1.0e-4
  batch_size: 64
  gradient_accumulate_every: 1
  checkpoint_every: 30
  val_every: 10

# Optimizer
optimizer:
  _target_: torch.optim.AdamW
  lr: 1.0e-4
  betas: [0.95, 0.999]
  weight_decay: 1.0e-6

# Data loader
dataloader:
  batch_size: 64
  num_workers: 4
  shuffle: True
```

### ACT Config

**File:** `policy/config/train_act_image_workspace.yaml`

```yaml
# Model configuration
policy:
  _target_: policy.policy.act_image_policy.ActImagePolicy
  shape_meta: ${shape_meta}
  chunk_size: 100
  hidden_dim: 512
  encoder_dim: 128

# Training parameters
training:
  device: "cuda:0"
  seed: 42
  num_epochs: 8000
  lr: 1.0e-4
  batch_size: 64
  checkpoint_every: 30
  val_every: 10
```

---

## Step 4: Specify Dataset Path

Edit task config to point to your dataset:

**File:** `policy/config/task/dp.yaml`

```yaml
dataset_path: "outputs/collect/2026.04.24/12.34.56_atomic_pick/dataset"
```

---

## Step 5: Run Training

```bash
# Diffusion model
python train.py --config-name=train_diffusion_unet_image_workspace

# ACT model
python train.py --config-name=train_act_image_workspace
```

**Expected output:**

```
[INFO] Loading dataset from: outputs/collect/2026.04.24/12.34.56_atomic_pick/dataset
[INFO] Dataset size: 100 episodes
[INFO] Training on device: cuda:0
[INFO] Starting training...
Epoch 0/8000: loss=2.345, val_loss=2.123
Epoch 100/8000: loss=0.876, val_loss=0.789
Epoch 500/8000: loss=0.234, val_loss=0.298
...
[INFO] Checkpoint saved: outputs/train/2026.04.24/12.43.59_diffusion_pick/checkpoints/epoch_8000.ckpt
```

---

## Output Structure

```
outputs/train/
└── 2026.04.24/
    └── 12.43.59_diffusion_pick/
        ├── checkpoints/
        │   ├── epoch_0000.ckpt
        │   ├── epoch_0030.ckpt
        │   └── latest.ckpt
        ├── normalize.ckpt         # State normalizer
        └── .hydra/
            └── config.yaml        # Saved config
```

---

## Training Tips

### Data Quality

- **High success rate:** >90% episode success preferred
- **Diverse demonstrations:** Vary object positions, orientations
- **Sufficient episodes:** At least 50-100 episodes per skill

### Model Selection

<div style="text-align: center; margin: 1.5em 0;" markdown>

| Model | Best For |
| --- | --- |
| Diffusion | High quality, diverse |
| ACT | Real-time capable |

</div>

### Hyperparameters

<div style="text-align: center; margin: 1.5em 0;" markdown>

| Parameter | Recommended |
| --- | --- |
| batch_size | 32-64 |
| learning_rate | 1.0e-4 |
| num_epochs | 5000-10000 |
| encoder | resnet18 or resnet34 |

</div>

---

## Monitoring Training

### TensorBoard

```bash
# Start TensorBoard
tensorboard --logdir outputs/train/

# Open browser
# http://localhost:6006
```

### Checkpoint Selection

- **latest.ckpt:** Most recent checkpoint
- **val_loss lowest:** Best validation performance
- **mid-training:** Balance between loss and generalization

---

## Common Issues

### GPU Memory

```yaml
# Reduce batch size if OOM
training:
  batch_size: 32  # or 16
```

### Slow Training

```yaml
# Use smaller encoder
obs_encoder:
  rgb_model:
    name: resnet18  # Instead of resnet50
```

---

## Next Steps

<div style="text-align: center; margin: 1.5em 0;" markdown>

| Goal | Next Tutorial |
| --- | --- |
| Run inference | [Inference](./inference.md) |
| OpenPI integration | [OpenPI Integration](./openpi-integration.md) |
| Custom workflow | [Custom Workflow](./custom-workflow.md) |

</div>
