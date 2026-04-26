---
title: 快速入门
---

# 快速入门

## 一分钟快速入门

按照以下步骤运行您的第一个仿真 episode。

---

## 前置要求

[ ] NVIDIA GPU（RTX 系列，不是 A100/A800）

[ ] Ubuntu 24.04

[ ] 已安装 conda

[ ] 已安装 Isaac Sim 5.1

---

## 第一步：环境配置


```

# 创建并激活环境

conda create -n RoboGenesis python=3.11 -y
conda activate RoboGenesis
# 安装 PyTorch

pip install torch==2.9.0 torchvision==0.24.0 torchaudio==2.9.0 --index-url https://download.pytorch.org/whl/cu126
# 安装 Isaac Sim

pip install isaacsim[all,extscache]==5.1.0 --extra-index-url https://pypi.nvidia.com
# 安装其他依赖

pip install -r requirements.txt
# 设置 VSCode 配置

python -m isaacsim --generate-vscode-settings

```


---

## 第二步：克隆和设置


```

git clone #
cd RoboGenesis

git lfs pull

```


---

## 第三步：运行数据采集


```

# 运行 pick 技能数据采集（默认使用 Franka）

python main.py --config-name atomic_skills/pick
# 或运行 pour 工作流

python main.py --config-name workflows/workflow_pick_pour

```


预期输出：


```

[INFO] Loading scene from assets/chemistry_lab/...
[INFO] Robot initialized: franka
[INFO] Starting data collection...
[INFO] Episode 1/100 completed, success: True
[INFO] Episode 2/100 completed, success: True
...

```


---

## 第四步：运行推理

首先，修改配置以从 collect 切换到 infer 模式：


```

mode: "infer"
infer:
policy_model_path: "outputs/train///checkpoints/latest.ckpt"
policy_config_path: "outputs/train///.hydra/config.yaml"
normalizer_path: "outputs/train///checkpoints/normalize.ckpt"

```


然后运行：


```

python main.py --config-name atomic_skills/pick mode=infer

```


---

## 下一步？

| 目标 | 下一步 |
| --- | --- |
| 了解系统整体架构 | [系统架构](../Overview/architecture.md) |
| 完成环境安装部署 | [安装指南](../Getting-Started/installation.md) |
| 熟悉项目配置 | [基础配置](../Getting-Started/configuration.md) |
| 采集仿真数据集 | [数据采集](../Tutorials/data-collection.md) |
| 训练智能策略模型 | [模型训练](../Tutorials/training.md) |
| 添加机器人 | [新增机器人](../Robots/adding-new-robot.md) |

---

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `python main.py --config-name atomic_skills/pick` | 使用 Franka 机械臂执行拾取技能 |
| `python main.py --config-name atomic_skills/rizon4/pick` | 使用 Rizon4 机械臂执行拾取技能 |
| `python main.py --config-name workflows/workflow_pick_pour` | 运行拾取+倾倒组合任务流程 |
| `python main.py --config-name atomic_skills/pick mode=infer` | 执行模型推理 |
| `python scripts/check_registrations.py` | 校验组件注册项 |

---

## 故障排除

如果遇到问题，请查看[故障排除](../Getting-Started/troubleshooting.md)获取常见解决方案。