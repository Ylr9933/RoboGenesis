---
title: 项目概述
---

# 项目概述

---

<div style="text-align: center; margin: 1.5em 0;" markdown>

## RoboGenesis

[![arXiv](https://img.shields.io/badge/arXiv-2401.05999-b31b1b.svg)](#)
[![GitHub](https://img.shields.io/badge/GitHub-Code-181717?logo=github)](#)
[![Conference](https://img.shields.io/badge/Conference-Paper-4b44ce.svg)](#)
[![Docs](https://img.shields.io/badge/Docs-Docs-0099cc.svg)](#)

</div>

---

## 什么是 RoboGenesis？

RoboGenesis 是一个面向科学具身智能体的高保真仿真平台与分层测试基准。

### 核心能力

| 能力 | 说明 |
| --- | --- |
| 高保真仿真 | 基于 Isaac Sim 5.1 与 PhysX |
| 多机器人支持 | 7 种机器人平台 |
| 分层技能 | 9 种基础技能 + 完整工作流 |
| 数据采集 | HDF5 格式 episode 记录 |
| 策略训练 | 支持 ACT 与 Diffusion 模型 |
| 场景生成 | 程序化资产自动生成 |

### 关键统计

| 指标 | 数值 |
| --- | --- |
| 机器人平台 | 7 |
| 基础技能 | 9 |
| 任务类型 | 5 |
| 仿真引擎 | Isaac Sim 5.1 |
| Python 版本 | 3.11 |
| 发表会议 | NeurIPS 2025 |

---

## 项目结构

```
RoboGenesis/
├── assets/                     # USD/MDL 资源文件 (git-lfs)
│   ├── chemistry_lab/          # 化学实验室场景
│   ├── navigation/            # 导航任务资源
│   └── robots/                 # 机器人模型资源
├── config/                     # Hydra YAML 配置文件
│   ├── atomic_skills/          # 单技能配置（顶层 + 各机器人）
│   ├── workflows/              # 长时序多技能工作流
│   ├── designer_presets/       # 任务设计器预设
│   └── *.yaml                  # 共享配置
├── controllers/               # 控制层
│   ├── atomic_actions/        # 拾取/放置/倾倒/按压/摇晃/搅拌/打开/关闭/移动
│   ├── workflow/              # 工作流引擎（调度基础技能）
│   ├── inference_engines/     # 本地/远程策略推理
│   ├── robot_controllers/    # 机器人专用封装
│   └── robot_configs/         # 各机器人注册配置
├── robots/                    # 各机器人类
├── tasks/                     # 任务类
├── factories/                 # 工厂模式（机器人/任务/控制器/采集器）
├── data_collectors/          # HDF5 数据记录器
├── scene_factory/            # 程序化资产与场景生成
├── scene_manager/            # 运行时资产注入与物理设置
├── task_designer/            # Gradio Web UI 场景与任务编辑工具
├── lab_utils/                 # 通用工具库
├── packages/openpi-client/   # 第三方 OpenPI 客户端
├── scripts/                   # 实用脚本
├── tests/                    # 集成测试
├── doc/                      # 架构文档
└── main.py                   # 仿真入口文件
```

---

## 技术栈

| 组件 | 技术 |
| --- | --- |
| 仿真环境 | Isaac Sim 5.1 |
| 物理引擎 | PhysX |
| 场景描述 | USD |
| Python | 3.11 |
| 配置管理 | Hydra |
| 深度学习 | PyTorch |
| 数据格式 | HDF5 |
| Web 界面 | Gradio |
| 机器人运动 | RMPFlow / Lula |

---

## 系统要求

| 要求 | 最低配置 | 推荐配置 |
| --- | --- | --- |
| 显卡 | NVIDIA RTX 系列 | RTX 4090 / RTX 3090 |
| CUDA | CUDA 12.6 | CUDA 12.6+ |
| 操作系统 | Ubuntu 24.04 | Ubuntu 24.04 |
| Python | 3.11 | 3.11 |
| Conda | 任意版本 | 最新版本 |

!!! 警告
    Isaac Sim 不支持 A100/A800 显卡，请使用 RTX 系列显卡。

---

## 快速开始

### 数据采集

```bash
# 基础技能（默认 Franka）
python main.py --config-name atomic_skills/pick

# 基础技能（指定机器人）
python main.py --config-name atomic_skills/rizon4/pick

# 长时序工作流
python main.py --config-name workflows/workflow_pick_pour
```

数据保存路径：`outputs/collect/日期/小时.分钟.秒_任务名/`

### 模型训练

```bash
# 训练 Diffusion 模型
python train.py --config-name=train_diffusion_unet_image_workspace

# 训练 ACT 模型
python train.py --config-name=train_act_image_workspace
```

模型保存路径：`outputs/train/日期/时间_模型名_任务名/`

### 推理部署

```bash
# 本地推理
python main.py --config-name atomic_skills/pick mode=infer

# 远程推理（OpenPI）
python main.py --config-name workflows/workflow_pick_pour infer.type=remote
```

结果保存路径：`outputs/infer/日期/时间_任务名/`

---

## 致谢

本项目基于以下优秀开源项目构建：

- NVIDIA Isaac Sim
- NVIDIA RMPFlow / Lula
- ACT（动作分块Transformer）
- Diffusion Policy
- OpenPI（开放词汇操作）

---

## 相关链接

- [论文 (arXiv)](#)
- [项目主页](#)
- [HuggingFace 数据集](#)
- [GitHub 仓库](#)