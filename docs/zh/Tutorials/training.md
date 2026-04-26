---
title: 训练
---

# 训练

## 概览

RoboGenesis 支持使用采集的 HDF5 数据训练机器人策略。支持两种模型架构：ACT（动作分块 Transformer）和 Diffusion UNet。

---

## 前置要求

- 已采集的数据集位于 outputs/collect/
- 支持 CUDA 的 GPU
- PyTorch 2.9.0+

---

## 步骤 1: 准备数据集

确保数据集包含 episodes：

```
outputs/collect/2026.04.24/12.34.56_atomic_pick/
└── dataset/
    ├── episode_000.h5
    ├── episode_001.h5
    └── ...
```

---

## 步骤 2: 选择训练配置

### Diffusion 模型（推荐）

```bash
python train.py --config-name=train_diffusion_unet_image_workspace
```

### ACT 模型

```bash
python train.py --config-name=train_act_image_workspace
```

---

## 步骤 3: 配置训练

### Diffusion 配置

文件：policy/config/train_diffusion_unet_image_workspace.yaml

```yaml
# 模型配置
policy:
  _target_: policy.policy.diffusion_unet_image_policy.DiffusionUnetImagePolicy
  shape_meta: ${shape_meta}

# 噪声调度器
noise_scheduler:
  num_train_timesteps: 100
  beta_start: 0.0001
  beta_end: 0.02
  beta_schedule: squaredcos_cap_v2

# 观测编码器
obs_encoder:
  _target_: policy.model.vision.multi_image_obs_encoder.MultiImageObsEncoder
  rgb_model:
    _target_: policy.model.vision.model_getter.get_resnet
    name: resnet18
    resize_shape: [256, 256]
    random_crop: False

# 训练参数
training:
  device: "cuda:0"
  seed: 42
  num_epochs: 8000
  lr: 1.0e-4
  batch_size: 64
  gradient_accumulate_every: 1
  checkpoint_every: 30
  val_every: 10

# 优化器
optimizer:
  _target_: torch.optim.AdamW
  lr: 1.0e-4
  betas: [0.95, 0.999]
  weight_decay: 1.0e-6

# 数据加载器
dataloader:
  batch_size: 64
  num_workers: 4
  shuffle: True
```

### ACT 配置

文件：policy/config/train_act_image_workspace.yaml

```yaml
# 模型配置
policy:
  _target_: policy.policy.act_image_policy.ActImagePolicy
  shape_meta: ${shape_meta}
  chunk_size: 100
  hidden_dim: 512
  encoder_dim: 128

# 训练参数
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

## 步骤 4: 指定数据集路径

修改任务配置以指向数据集：

文件：policy/config/task/dp.yaml

```yaml
dataset_path: "outputs/collect/2026.04.24/12.34.56_atomic_pick/dataset"
```

---

## 步骤 5: 开始训练

```bash
# Diffusion 模型
python train.py --config-name=train_diffusion_unet_image_workspace

# ACT 模型
python train.py --config-name=train_act_image_workspace
```

预期输出：

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

## 输出结构

```
outputs/train/
└── 2026.04.24/
    └── 12.43.59_diffusion_pick/
        ├── checkpoints/
        │   ├── epoch_0000.ckpt
        │   ├── epoch_0030.ckpt
        │   └── latest.ckpt
        ├── normalize.ckpt         # 状态归一化器
        └── .hydra/
            └── config.yaml        # 保存的配置
```

---

## 训练技巧

### 数据质量

- **高成功率：** 优先选择成功率 > 90% 的 episodes
- **多样化演示：** 改变物体位置和方向
- **足够 episodes：** 每个技能至少 50-100 个 episodes

### 模型选择

| 模型 | 特点 |
| --- | --- |
| Diffusion | 质量高、多样性好 |
| ACT | 实时能力强 |

### 超参数

| 参数 | 推荐值 |
| --- | --- |
| batch_size | 64 |
| learning_rate | 1e-4 |
| num_epochs | 8000 |
| encoder | resnet18 |

---

## 监控训练

### TensorBoard

```bash
# 启动 TensorBoard
tensorboard --logdir outputs/train/

# 打开浏览器
# http://localhost:6006
```

### 检查点选择

- latest.ckpt：最新的检查点
- val_loss 最低：最佳验证性能
- 训练中期：损失和泛化能力的平衡

---

## 常见问题

### GPU 内存

```yaml
# 如果内存不足，减少 batch size
training:
  batch_size: 32  # 或 16
```

### 训练缓慢

```yaml
# 使用更小的编码器
obs_encoder:
  rgb_model:
    name: resnet18  # 替代 resnet50
```

---

## 下一步

| 目标 | 下一步 |
| --- | --- |
| 运行推理 | [推理](./inference.md) |
| OpenPI 集成 | [OpenPI 集成](./openpi-integration.md) |
| 自定义工作流 | [自定义工作流](./custom-workflow.md) |
