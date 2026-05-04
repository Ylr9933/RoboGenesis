---
title: 故障排除
---

# 故障排除

## 常见问题

---

## 安装问题

### 问题：isaacsim 包未找到

**症状：** `ModuleNotFoundError: No module named 'isaucsim'`

**解决方案：**

```bash
# 验证 Isaac Sim 是否已安装
pip show isaacsim

# 如果未安装，请重新安装
pip install isaacsim[all,extscache]==5.1.0 --extra-index-url https://pypi.nvidia.com
```

---

### 问题：未检测到 GPU

**症状：** `RuntimeError: No supported GPU found`

**解决方案：**

```bash
# 检查 NVIDIA 驱动
nvidia-smi

# 验证 CUDA 版本
nvcc --version

# 确保使用的是 RTX 系列（A100/A800 不支持）
```

!!! warning "GPU 兼容性"
    Isaac Sim 不支持 A100/A800 GPU。请使用 RTX 系列。

---

### 问题：Git LFS 文件未下载

**症状：** USD 资源显示为指针文件或非常小

**解决方案：**

```bash
# 安装 git-lfs
sudo apt install git-lfs

# 拉取大文件
git lfs pull

# 验证
git lfs ls-files | head -20
```

---

## 运行时问题

### 问题：机器人未在注册表中找到

**症状：** `KeyError: 'rizon4' not found in ROBOT_CONFIGS`

**解决方案：**

```bash
# 检查所有已注册的机器人
python scripts/check_registrations.py

# 如果注册缺失，添加到：
# 1. controllers/robot_configs/registry.py (ROBOT_CONFIGS)
# 2. factories/robot_factory.py (_CLASS_NAME_MAP)
```

---

### 问题：场景 USD 未加载

**症状：** `FileNotFoundError: assets/chemistry_lab/.../scene.usd`

**解决方案：**

```bash
# 验证资源是否已下载
git lfs pull

# 检查文件是否存在
ls -la assets/chemistry_lab/

# 尝试在配置中使用绝对路径
usd_path: "/absolute/path/to/scene.usd"
```

---

### 问题：数据采集提前停止

**症状：** Episode 在成功前结束，成功率低

**可能原因：**

- 物体位置距离机器人太远
- 物理不稳定
- 控制器参数未调优

**解决方案：**

```yaml
# 在配置中调整物体位置范围
obj_paths:
  - path: "/World/conical_bottle02"
    position_range:
      x: [0.20, 0.32]  # 靠近机器人
      y: [-0.07, 0.03]
      z: [0.80, 0.80]

# 或增加最大步数
task:
  max_steps: 2000  # 更多步数来完成
```

---

### 问题：Hydra 配置覆盖不生效

**症状：** `--override` 没有效果

**解决方案：**

```bash
# 使用正确的语法
python main.py --config-name atomic_skills/pick --override robot.type=rizon4

# 对于嵌套键，使用点号表示法
python main.py --config-name workflows/workflow_pick_pour --override "robot.position=[0,0,0.71]"

# 验证配置是否被读取
python main.py --config-name atomic_skills/pick --help
```

---

### 问题：Python 导入错误

**症状：** 项目模块的 `ModuleNotFoundError`

**解决方案：**

```bash
# 确保您在项目根目录
cd /path/to/RoboGenesis

# 添加到 PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# 或使用 VSCode 设置
python -m isaacsim --generate-vscode-settings
```

---

## 性能问题

### 问题：仿真速度慢

**可能原因：**

- GPU 未被使用
- 相机数量过多
- 渲染分辨率过高

**解决方案：**

```yaml
# 降低相机分辨率
cameras:
  - resolution: [128, 128]  # 更低分辨率

# 使用无头模式
python main.py --config-name atomic_skills/pick headless=True
```

---

### 问题：内存不足

**症状：** 采集期间出现内存不足错误

**解决方案：**

```yaml
# 减少训练批次大小
training:
  batch_size: 32  # 更小批次

# 减少相机数量
cameras_names: ["camera_1"]  # 单相机
```

---

## 调试工具

### 检查注册

```bash
python scripts/check_registrations.py
```

### 调试回放

```bash
# 回放一个 episode
python scripts/labgen_replay.py --episode outputs/collect/xxx/episode_000.h5
```

### 详细日志

```bash
# 使用详细输出运行
python main.py --config-name atomic_skills/pick log_level=DEBUG
```

---

## 获取帮助

<div style="text-align: center; margin: 1.5em 0;" markdown>

| 资源 | 链接 |
| --- | --- |
| GitHub Issues | https://github.com/your-repo/RoboGenesis/issues |
| GitHub Discussions | https://github.com/your-repo/RoboGenesis/discussions |
| 论文 (arXiv) | https://arxiv.org |

</div>

---

## 错误代码参考

<div style="text-align: center; margin: 1.5em 0;" markdown>

| 错误 | 解决方案 |
| --- | --- |
| ROBOT_NOT_FOUND | 添加到 ROBOT_CONFIGS |
| USD_FILE_NOT_FOUND | 运行 git lfs pull |
| CONFIG_OVERRIDE_FAILED | 使用正确的点号表示法 |
| MODEL_PATH_INVALID | 验证模型检查点存在 |
| CAMERA_INIT_FAILED | 检查相机 prim 路径 |

</div>

---

## 已知限制

- **GPU：** A100/A800 不支持（需要 RTX）
- **操作系统：** 仅在 Ubuntu 24.04 上测试
- **场景大小：** 大场景可能导致内存问题