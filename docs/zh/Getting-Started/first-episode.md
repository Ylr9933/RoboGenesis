---
title: 首次运行
---

# 首次运行

## 运行您的第一次仿真

本指南将带您运行第一次数据采集 episode。

---

## 前置条件

- [ ] 已安装 RoboGenesis（参见[安装指南](./installation.md)）
- [ ] 已激活环境（conda activate RoboGenesis）
- [ ] 已拉取 Git LFS 资源（git lfs pull）

---

## 步骤 1: 验证安装

检查所有组件是否正确注册：

```bash
python scripts/check_registrations.py
```

预期输出：

```
OK: 8 robots in _CLASS_NAME_MAP, 8 in ROBOT_CONFIGS — all mappings resolve
```

---

## 步骤 2: 运行原子技能

使用默认的 Franka 机器人运行简单的 pick 技能：

```bash
python main.py --config-name atomic_skills/pick
```

执行流程：

1. Isaac Sim 启动，加载化学实验室场景
2. Franka 机器人被加载并初始化
3. 一个物体（锥形瓶）被放置在场景中
4. 脚本化的 pick 控制器执行 7 阶段抓取技能
5. 收集数据（图像、关节状态、动作）
6. 成功或达到最大步数后 episode 结束

---

## 步骤 3: 理解输出

成功采集后生成以下文件：

```
outputs/collect/
└── 2026.04.24/
    └── 12.34.56_atomic_pick/
        ├── dataset/
        │   ├── episode_000.h5    # 包含 episode 数据的 HDF5 文件
        │   ├── episode_001.h5
        │   └── ...
        ├── success.csv           # Episode 成功日志
        └── config.yaml           # 保存的配置
```

### HDF5 Episode 结构

每个 episode 包含：

| 字段 | 描述 |
| --- | --- |
| observation.images.camera_1_rgb | RGB 图像（相机1） |
| observation.images.camera_2_rgb | RGB 图像（相机2） |
| observation.robot_state.joint_positions | 关节位置 [7] |
| observation.robot_state.gripper_state | 夹爪状态 [2] |
| action | 策略动作 [9] |
| timestamp | 时间戳 |

---

## 步骤 4: 运行不同的机器人

```bash
# 使用 Rizon4 运行
python main.py --config-name atomic_skills/rizon4/pick

# 使用 UR5e 运行
python main.py --config-name atomic_skills/ur5e/pick

# 使用 FR3 运行
python main.py --config-name atomic_skills/fr3/pick
```

---

## 步骤 5: 运行工作流

运行组合多个技能的多步骤工作流：

```bash
# Pick + Pour 工作流
python main.py --config-name workflows/workflow_pick_pour

# 加热 + 搅拌反应
python main.py --config-name workflows/workflow_heat_stir_reaction

# 清洗烧杯协议
python main.py --config-name workflows/workflow_clean_beaker
```

---

## 步骤 6: 运行推理

首先，确保您有一个训练好的模型。然后修改配置：

```yaml
# 在您的配置文件中
mode: "infer"
infer:
  type: "local"
  policy_model_path: "outputs/train/checkpoints/latest.ckpt"
  policy_config_path: "outputs/train/.hydra/config.yaml"
  normalizer_path: "outputs/train/checkpoints/normalize.ckpt"
```

运行推理：

```bash
python main.py --config-name atomic_skills/pick mode=infer
```

---

## 命令参考

| 命令 | 描述 |
| --- | --- |
| `python main.py --config-name atomic_skills/pick` | 使用 Franka 运行 pick |
| `python main.py --config-name atomic_skills/rizon4/pick` | 使用 Rizon4 运行 pick |
| `python main.py --config-name workflows/workflow_pick_pour` | 运行 pick+pour 工作流 |
| `python main.py --config-name workflows/workflow_heat_stir_reaction_franka` | 使用 Franka 运行加热+搅拌 |
| `python main.py --config-name atomic_skills/pick mode=infer` | 运行推理 |
| `python main.py --config-name atomic_skills/pick headless=True` | 运行 headless 模式 |

---

## 常见输出路径

| 模式 | 输出目录 |
| --- | --- |
| collect | outputs/collect/ |
| infer | outputs/infer/ |
| train | outputs/train/ |

---

## 下一步

| 目标 | 下一步 |
| --- | --- |
| 采集更多数据 | [数据采集](../../Tutorials../../Tutorials/data-collection.md) |
| 训练策略 | [训练](../../Tutorials../../Tutorials/training.md) |
| 运行推理 | [推理](../../Tutorials../../Tutorials/inference.md) |
| 理解技能系统 | [技能](../../Skills../../Skills/atomic-skills.md) |
| 故障排除 | [故障排除](./troubleshooting.md) |
