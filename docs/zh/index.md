---
title: Home
---

# Home

---

<div style="text-align: center; margin: 1.5em 0;" markdown>

## RoboGenesis

[![arXiv](https://img.shields.io/badge/arXiv-2401.05999-b31b1b.svg)](#)
[![GitHub](https://img.shields.io/badge/GitHub-Code-181717?logo=github)](#)
[![Conference](https://img.shields.io/badge/Conference-Paper-4b44ce.svg)](#)
[![Docs](https://img.shields.io/badge/Docs-Docs-0099cc.svg)](#)

</div>

---

## 核心特性

| 特性 | 描述 |
| --- | --- |
| **Isaac Sim 5.1** | 高保真物理仿真 (PhysX) |
| **7 种机械臂** | Franka, FR3, UR5e, UR16e, Festo, Piper, Rizon4 |
| **9 种原子技能** | pick, place, pour, shake, stir, press, open, close, move |
| **分层基准** | 技能 → 工作流 → 长期任务协议 |
| **多模态观测** | RGB, Depth, Point Cloud, Segmentation |
| **HDF5 数据采集** | 用于 ACT、Diffusion 策略训练的演示采集 |

---

## 快速开始

### 克隆仓库

```bash
git clone https://github.com/your-repo/RoboGenesis.git
cd RoboGenesis
git lfs pull
```

### 创建环境

```bash
conda create -n RoboGenesis python=3.11 -y
conda activate RoboGenesis
```

### 安装依赖

```bash
pip install torch==2.9.0 torchvision==0.24.0 --index-url https://download.pytorch.org/whl/cu126
pip install isaacsim[all,extscache]==5.1.0 --extra-index-url https://pypi.nvidia.com
pip install -r requirements.txt
```

### 运行第一个 episode

```bash
python main.py --config-name atomic_skills/pick
```

---

## 支持的机械臂

| 机械臂 | 自由度 | 夹爪类型 | 系列 |
| --- | --- | --- | --- |
| **Franka** (Panda) | 7 | Prismatic | Franka Robotics |
| **FR3** | 7 | Prismatic | Franka Robotics |
| **UR5e** | 6 | Robotiq 2F-85 | Universal Robots |
| **UR16e** | 6 | Robotiq 2F-85 | Universal Robots |
| **Festo** | 6 | Robotiq 2F-85 | Cobot |
| **Piper** | 6 | Prismatic | AgileX |
| **Rizon4** | 7 | Robotiq 2F-85 | Flexiv |

---

## 文档

### 入门

- [安装指南](Getting-Started/installation.md) — 系统要求、GPU 设置、依赖
- [配置系统](Getting-Started/configuration.md) — Hydra 配置系统、YAML 结构
- [第一个 Episode](Getting-Started/first-episode.md) — 运行您的第一次数据采集
- [故障排除](Getting-Started/troubleshooting.md) — 常见问题和解决方案

### 核心概念

- [机械臂](Core-Concepts/robots.md) — 机械臂基类、7 种平台、注册表
- [控制器](Core-Concepts/controllers.md) — BaseController、RMPFlow、推理引擎
- [任务](Core-Concepts/tasks.md) — 任务层次、场景管理、观测获取
- [工厂](Core-Concepts/factories.md) — 工厂模式（机械臂/任务/控制器）
- [数据采集](Core-Concepts/data-collection.md) — HDF5 模式、数据收集器

### 技能

- [原子技能](Skills/atomic-skills.md) — 9 种技能 (pick/place/pour/shake/stir/press/open/close/move)
- [工作流引擎](Skills/workflow-engine.md) — WorkflowEngine、SkillExecutor、HeldObjectContext
- [成功条件](Skills/success-conditions.md) — 每种技能的成功检查器
- [技能注册表](Skills/skill-registry.md) — 技能注册和默认参数

### 教程

- [数据采集](Tutorials/data-collection.md) — 完整的数据采集教程
- [训练](Tutorials/training.md) — PyTorch 训练（ACT、Diffusion）
- [推理](Tutorials/inference.md) — 本地和远程推理
- [OpenPI 集成](Tutorials/openpi-integration.md) — OpenPI 远程服务器设置
- [自定义工作流](Tutorials/custom-workflow.md) — 从原子技能组合新工作流

### API 参考

- [控制器](API-Reference/controllers.md) — BaseController API
- [机械臂](API-Reference/robots.md) — GenericArm API
- [任务](API-Reference/tasks.md) — BaseTask、WorkflowTask API
- [工厂](API-Reference/factories.md) — 工厂函数
- [推理引擎](API-Reference/inference-engines.md) — 本地/远程推理引擎

---

## 系统架构

| 层级 | 描述 |
| --- | --- |
| **L5 社区层** | 文档、插件中心 |
| **L4 发行层** | pip 安装、Docker、GitHub Pages |
| **L3 可观测层** | 结构化日志、回放、调试 |
| **L2 可靠性层** | 离线资产、测试、随机种子 |
| **L1 核心引擎层** | 机械臂、技能、工作流、数据 |

**设计理念：**

1. **模块化结构** — 更好的代码组织和可维护性
2. **任务与控制器分离** — 任务处理场景/观测，控制器处理执行/成功检查

---

## 引用

```bibtex
@article{待补充,
    author    = {待补充},
    title     = {待补充},
    journal   = {待补充},
    year      = {待补充},
}
```

---

## 许可证

- **代码**: MIT License
- **数据资产**: CC BY-NC 4.0（免费用于研究，不可商用）
