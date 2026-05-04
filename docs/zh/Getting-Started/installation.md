---
title: 安装指南
---

# 安装指南

## 系统要求

<div style="text-align: center; margin: 1.5em 0;" markdown>

| 要求 | 最低配置 | 推荐配置 |
| --- | --- | --- |
| GPU | NVIDIA RTX 系列 | RTX 4090 / RTX 3090 |
| CUDA | 12.6 | 12.6+ |
| 操作系统 | Ubuntu 24.04 | Ubuntu 24.04 |
| Python | 3.11 | 3.11 |
| Conda | 任意版本 | 最新版本 |
| Isaac Sim | 5.1.0 | 5.1.0 |

</div>

!!! warning "GPU 兼容性"
    Isaac Sim 不支持 A100/A800 GPU。请使用 RTX 系列 GPU。

---

## 步骤 1: 下载代码

```bash
# 克隆仓库
git clone https://github.com/your-repo/RoboGenesis.git
cd RoboGenesis

# 如果还没有安装 git-lfs
sudo apt install git-lfs

# 拉取大型资源文件（USD 模型、纹理）
git lfs pull
```

!!! note "大文件支持"
    资源文件（USD、MDL、纹理）通过 Git LFS 存储。克隆后请务必运行 git lfs pull。

---

## 步骤 2: 创建环境

```bash
# 创建 Python 3.11 的 conda 环境
conda create -n RoboGenesis python=3.11 -y

# 激活环境
conda activate RoboGenesis
```

---

## 步骤 3: 安装依赖

### 3.1 安装 PyTorch

```bash
pip install torch==2.9.0 torchvision==0.24.0 torchaudio==2.9.0 --index-url https://download.pytorch.org/whl/cu126
```

### 3.2 安装 Isaac Sim

```bash
pip install isaacsim[all,extscache]==5.1.0 --extra-index-url https://pypi.nvidia.com
```

!!! note "Isaac Sim 安装说明"
    这需要您的系统已安装 NVIDIA Isaac Sim。请参阅 NVIDIA Isaac Sim 文档获取安装说明。

### 3.3 安装其他依赖

```bash
pip install -r requirements.txt
```

### 3.4 设置 VSCode

```bash
python -m isaacsim --generate-vscode-settings
```

这会创建 .vscode/settings.json 以支持 Isaac Sim 的 IntelliSense。

---

## 步骤 4: 验证安装

运行注册检查脚本以验证所有组件是否正确安装：

```bash
python scripts/check_registrations.py
```

预期输出：

```text
OK: 8 robots in _CLASS_NAME_MAP, 8 in ROBOT_CONFIGS — all mappings resolve
```

---

## 目录结构

安装后您应该看到：

```text
RoboGenesis/
├── assets/                  # USD/MDL 资源文件
├── config/                  # Hydra YAML 配置
├── controllers/             # 控制器层
├── robots/                  # 机器人实现
├── tasks/                   # 任务定义
├── factories/               # 工厂模式
├── data_collectors/         # HDF5 写入器
├── scene_factory/           # 资源生成
├── scene_manager/           # 运行时注入
├── task_designer/           # Gradio 网页界面
├── lab_utils/               # 工具函数
├── scripts/                 # 辅助脚本
├── tests/                   # 单元测试
├── doc/                     # 文档
├── main.py                  # 入口点
├── requirements.txt         # Python 依赖
└── README.md
```

---

## 可选：下载数据

预采集的数据集可在 HuggingFace 上获取：

```bash
# 从 HuggingFace 下载
git clone https://huggingface.co/datasets/RoboGenesis/RoboGenesis-Dataset
```

或者使用转换脚本将 RoboGenesis 格式转换为 LeRobot 格式：

```bash
python scripts/convert_labsim_data_to_lerobot.py \
    --data_dir outputs/collect/xxx/dataset \
    --num_processes 8 \
    --fps 60 \
    --repo_name RoboGenesis/level3-pick
```

---

## 下一步

<div style="text-align: center; margin: 1.5em 0;" markdown>

| 目标 | 下一步 |
| --- | --- |
| 了解配置系统 | [配置](./configuration.md) |
| 运行第一个 episode | [第一个 Episode](./first-episode.md) |
| 学习核心概念 | [核心概念](../../Core-Concepts../../Robots/robots.md) |
| 故障排除 | [故障排除](./troubleshooting.md) |

</div>
