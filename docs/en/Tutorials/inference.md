---
title: Inference
---

# Inference

## Overview

After training a policy model, you can use it for inference to evaluate task success rate or deploy in closed-loop control.

---

## Two Inference Modes

### Local Inference

Model runs on local GPU. Best for single-instance evaluation.

**Configuration:**

```yaml
infer:
  type: "local"
  policy_model_path: "outputs/train/checkpoints/latest.ckpt"
  policy_config_path: "outputs/train/.hydra/config.yaml"
  normalizer_path: "outputs/train/checkpoints/normalize.ckpt"
```

### Remote Inference

Model runs on remote OpenPI server. Best for distributed deployment.

**Configuration:**

```yaml
infer:
  type: "remote"
  host: "0.0.0.0"
  port: 8080
  n_obs_steps: 3
  timeout: 30
  max_retries: 3
```

---

## Step 1: Prepare Model

Ensure you have trained model files:

```
outputs/train/
├── checkpoints/
│   ├── latest.ckpt
│   └── normalize.ckpt
└── .hydra/
    └── config.yaml
```

---

## Step 2: Configure Inference

Create or modify config:

```yaml
# config/atomic_skills/pick_infer.yaml

mode: "infer"
infer:
  type: "local"
  policy_model_path: "outputs/train/2026.04.24/12.43.59_diffusion_pick/checkpoints/latest.ckpt"
  policy_config_path: "outputs/train/2026.04.24/12.43.59_diffusion_pick/.hydra/config.yaml"
  normalizer_path: "outputs/train/2026.04.24/12.43.59_diffusion_pick/checkpoints/normalize.ckpt"

max_episodes: 50

robot:
  type: "franka"
  position: [-0.4, -0, 0.71]

task:
  max_steps: 1000
  obj_paths:
    - path: "/World/conical_bottle02"
      position_range:
        x: [0.22, 0.32]
        y: [-0.07, 0.03]
        z: [0.80, 0.80]
```

---

## Step 3: Run Inference

### Local Inference

```bash
python main.py --config-name atomic_skills/pick_infer
```

### Remote Inference

```bash
# First, start OpenPI server
cd openpi && python server.py --port 8080

# Then run inference
python main.py --config-name atomic_skills/pick_infer infer.type=remote
```

---

## Expected Output

```
[INFO] Loading model from: outputs/train/2026.04.24/12.43.59_diffusion_pick/checkpoints/latest.ckpt
[INFO] Initializing inference engine: local
[INFO] Starting inference evaluation...
[INFO] Episode 1/50: success=True, steps=156
[INFO] Episode 2/50: success=True, steps=142
[INFO] Episode 3/50: success=False, steps=1000 (max_steps)
...
[INFO] Inference complete: 42/50 successful (84%)
[INFO] Results saved to: outputs/infer/2026.04.24/13.45.00_atomic_pick/
```

---

## Output Structure

```
outputs/infer/
└── 2026.04.24/
    └── 13.45.00_atomic_pick/
        ├── episode_000.h5    # Inference episode data
        ├── episode_001.h5
        ├── success.csv       # Success log
        └── metrics.json      # Evaluation metrics
```

---

## Inference vs Collect

| Aspect | Inference | Collect |
| --- | --- | --- |
| Action source | Policy model | Scripted controller |
| Data output | Evaluation metrics | HDF5 episodes |

---

## Interleaving Collect and Infer

You can alternate between collect and infer modes:

```bash
# Collect more data with current policy
python main.py --config-name atomic_skills/pick mode=collect

# Evaluate current policy
python main.py --config-name atomic_skills/pick mode=infer

# Retrain with expanded dataset
python train.py --config-name=train_diffusion_unet_image_workspace

# Re-evaluate
python main.py --config-name atomic_skills/pick mode=infer
```

---

## Multi-Robot Inference

For different robots:

```bash
# Franka
python main.py --config-name atomic_skills/franka/pick mode=infer infer.policy_model_path=...

# Rizon4
python main.py --config-name atomic_skills/rizon4/pick mode=infer infer.policy_model_path=...
```

---

## Performance Tips

- **Use latest checkpoint:** Contains most recent training
- **Batch inference:** For multiple episodes
- **Remote inference:** For distributed evaluation
- **GPU utilization:** Ensure CUDA is properly configured

---

## Common Issues

### Model not found

```bash
# Verify model exists
ls -la outputs/train/2026.04.24/12.43.59_diffusion_pick/checkpoints/
```

### Remote server not responding

```bash
# Check OpenPI server
curl http://0.0.0.0:8080/health

# Verify port
netstat -tulpn | grep 8080
```

---

## Next Steps

| Goal | Next Tutorial |
| --- | --- |
| Remote inference | [OpenPI Integration](./openpi-integration.md) |
| Custom workflow | [Custom Workflow](./custom-workflow.md) |
| Troubleshoot | [Troubleshooting](../../Getting-Started/troubleshooting.md) |
