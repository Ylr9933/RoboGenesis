---
title: 推理
---

# 推理

## 概览

训练好策略模型后，可将其用于推理以评估任务成功率或部署到闭环控制中。

---

## 两种推理模式

### 本地推理

模型在本地 GPU 上运行，适合单实例评估。

```yaml
infer:
  type: "local"
  policy_model_path: "outputs/train/checkpoints/latest.ckpt"
  policy_config_path: "outputs/train/.hydra/config.yaml"
  normalizer_path: "outputs/train/checkpoints/normalize.ckpt"
```

### 远程推理

模型在远程 OpenPI 服务器上运行，适合分布式部署。

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

## 步骤 1: 准备模型

确保拥有训练好的模型文件：

```
outputs/train/
├── checkpoints/
│   ├── latest.ckpt
│   └── normalize.ckpt
└── .hydra/
    └── config.yaml
```

---

## 步骤 2: 配置推理

创建或修改配置：

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

## 步骤 3: 运行推理

### 本地推理

```bash
python main.py --config-name atomic_skills/pick_infer
```

### 远程推理

```bash
# 首先，启动 OpenPI 服务器
cd openpi && python server.py --port 8080

# 然后运行推理
python main.py --config-name atomic_skills/pick_infer infer.type=remote
```

---

## 预期输出

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

## 输出结构

```
outputs/infer/
└── 2026.04.24/
    └── 13.45.00_atomic_pick/
        ├── episode_000.h5    # 推理 episode 数据
        ├── episode_001.h5
        ├── success.csv       # 成功记录
        └── metrics.json      # 评估指标
```

---

## 推理与采集对比

| 方面 | 推理 | 采集 |
| --- | --- | --- |
| 动作来源 | 策略模型 | 脚本控制器 |
| 数据输出 | 评估指标 | HDF5 数据 |

---

## 交替进行采集和推理

可以在采集和推理模式之间交替：

```bash
# 使用当前策略采集更多数据
python main.py --config-name atomic_skills/pick mode=collect

# 评估当前策略
python main.py --config-name atomic_skills/pick mode=infer

# 使用扩展数据集重新训练
python train.py --config-name=train_diffusion_unet_image_workspace

# 重新评估
python main.py --config-name atomic_skills/pick mode=infer
```

---

## 多机器人推理

针对不同机器人：

```bash
# Franka
python main.py --config-name atomic_skills/franka/pick mode=infer infer.policy_model_path=...

# Rizon4
python main.py --config-name atomic_skills/rizon4/pick mode=infer infer.policy_model_path=...
```

---

## 性能提示

- **使用最新检查点：** 包含最近的训练结果
- **批量推理：** 用于多个 episodes
- **远程推理：** 用于分布式评估
- **GPU 利用率：** 确保 CUDA 配置正确

---

## 常见问题

### 模型未找到

```bash
# 验证模型存在
ls -la outputs/train/2026.04.24/12.43.59_diffusion_pick/checkpoints/
```

### 远程服务器无响应

```bash
# 检查 OpenPI 服务器
curl http://0.0.0.0:8080/health

# 验证端口
netstat -tulpn | grep 8080
```

---

## 下一步

| 目标 | 下一步 |
| --- | --- |
| 远程推理 | [OpenPI 集成](./openpi-integration.md) |
| 自定义工作流 | [自定义工作流](./custom-workflow.md) |
| 故障排除 | [故障排除](../Getting-Started../../Getting-Started/troubleshooting.md) |
