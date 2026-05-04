---
title: 数据采集
---

# 数据采集

## 概览

本教程介绍如何使用脚本控制器采集演示数据。数据以 HDF5 格式存储，用于策略学习。

---

## 前置要求

- 已安装 RoboGenesis（参见[安装教程](../Getting-Started../../Getting-Started/installation.md)）
- 环境已激活（conda activate RoboGenesis）
- 可访问 Isaac Sim 5.1

---

## 步骤 1: 选择配置

### 原子技能

单技能数据采集：

```bash
# Franka（默认）
python main.py --config-name atomic_skills/pick

# Rizon4
python main.py --config-name atomic_skills/rizon4/pick

# UR5e
python main.py --config-name atomic_skills/ur5e/pick

# FR3
python main.py --config-name atomic_skills/fr3/pick
```

### 工作流

多步骤数据采集：

```bash
# 拾取 + 倒液
python main.py --config-name workflows/workflow_pick_pour

# 加热 + 搅拌反应
python main.py --config-name workflows/workflow_heat_stir_reaction

# 清洗烧杯
python main.py --config-name workflows/workflow_clean_beaker
```

---

## 步骤 2: 配置数据采集

### 基础配置

```yaml
# config/atomic_skills/pick.yaml

mode: "collect"                    # 数据采集模式
max_episodes: 100                  # Episode 数量

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

### 相机配置

```yaml
cameras_names: ["camera_1", "camera_2"]
cameras:
  - prim_path: "/World/Camera1"
    name: "camera_1"
    translation: [2, 0, 2]
    resolution: [256, 256]
    focal_length: 6
    orientation: [0.61237, 0.35355, 0.35355, 0.61237]
    image_type: "rgb"
  - prim_path: "/World/Camera2"
    name: "camera_2"
    translation: [0, -2, 1.5]
    resolution: [256, 256]
    focal_length: 6
    orientation: [0.5, 0.5, 0.5, 0.5]
    image_type: "depth"
```

### 采集器配置

```yaml
collector:
  type: "default"
  compression: null    # 或 "gzip"
  chunk_size: 100
```

---

## 步骤 3: 运行数据采集

```bash
python main.py --config-name atomic_skills/pick
```

预期输出：

```
[INFO] Loading scene from assets/chemistry_lab/...
[INFO] Robot initialized: franka
[INFO] DataCollector: Starting episode 1/100
[INFO] Skill execution: pick (phase 0/7)
[INFO] Episode 1 completed, success: True
[INFO] Data saved to: outputs/collect/2026.04.24/12.34.56_atomic_pick/
[INFO] Episode 2/100 completed, success: True
...
[INFO] Collection complete: 95/100 episodes successful (95%)
```

---

## 输出结构

```
outputs/collect/
└── 2026.04.24/
    └── 12.34.56_atomic_pick/
        ├── dataset/
        │   ├── episode_000.h5
        │   ├── episode_001.h5
        │   └── ...
        ├── success.csv            # Episode 成功记录
        └── config.yaml            # 保存的配置
```

---

## HDF5 Episode 数据结构

```python
import h5py

with h5py.File("episode_000.h5", "r") as f:
    # 观测图像
    print(f["observation/images/camera_1_rgb"].shape)   # (H, W, 3)
    print(f["observation/images/camera_2_rgb"].shape)   # (H, W, 3)

    # 机器人状态
    print(f["observation/robot_state/joint_positions"].shape)  # (7,)
    print(f["observation/robot_state/gripper_state"].shape)     # (2,)

    # 动作
    print(f["action"].shape)  # (9,) - 7 个关节 + 2 个夹爪

    # 元数据
    print(f["timestamp"][()])  # float64
    print(f["success"][()])     # bool
```

---

## 可恢复的数据采集

使用 ResumableDataCollector 可恢复中断的数据采集：

```python
collector = DataCollector(cfg)
collector.resume(output_dir)  # 从上一个 episode 继续
```

---

## 多机器人数据采集

为每种机器人类型创建单独的配置：

```bash
# 使用 Franka 采集
python main.py --config-name atomic_skills/franka/pick

# 使用 Rizon4 采集
python main.py --config-name atomic_skills/rizon4/pick
```

输出目录按机器人类型分开：

```
outputs/collect/2026.04.24/
├── 12.34.56_atomic_pick/        # Franka
└── 12.45.00_atomic_pick_rizon4/  # Rizon4
```

---

## 数据格式转换

转换为 LeRobot 格式用于训练：

```bash
python scripts/convert_labsim_data_to_lerobot.py \
    --data_dir outputs/collect/2026.04.24/12.34.56_atomic_pick/dataset \
    --num_processes 8 \
    --fps 60 \
    --repo_name RoboGenesis/level1-pick
```

### 参数说明

<div style="text-align: center; margin: 1.5em 0;" markdown>

| 参数 | 描述 |
| --- | --- |
| --data_dir | HDF5 数据集路径 |
| --num_processes | 并行工作进程数 |
| --fps | 时间戳帧率 |
| --repo_name | HuggingFace 数据集名称 |

</div>

---

## 最佳实践

- **采集多样性数据：** 在不同 episode 中改变物体位置
- **检查成功率：** 训练前目标成功率 > 90%
- **多相机：** 使用 2 个以上相机以获得更好的观测
- **平衡数据集：** 为每个技能采集相似的 episode
- **验证记录：** 采集后检查 HDF5 文件

---

## 下一步

<div style="text-align: center; margin: 1.5em 0;" markdown>

| 目标 | 下一步 |
| --- | --- |
| 训练策略 | [训练](./training.md) |
| 运行推理 | [推理](./inference.md) |
| 自定义工作流 | [自定义工作流](./custom-workflow.md) |

</div>
