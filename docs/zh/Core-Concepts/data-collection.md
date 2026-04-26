---
title: 数据采集
---

# 数据采集

## 概览

RoboGenesis 以 HDF5 格式收集演示数据用于策略学习。数据采集使用脚本化控制器在 collect 模式下执行预定义的技能序列。

---

## 数据采集器架构

```
DataCollector（基类）
├── DefaultDataCollector   # 标准 HDF5 写入
└── MockCollector          # 用于测试
```

---

## HDF5 回合数据结构

每个回合文件包含：

```
episode_000.h5/
├── observation/
│   ├── images/
│   │   ├── camera_1_rgb        # [H, W, 3] uint8
│   │   └── camera_2_rgb        # [H, W, 3] uint8
│   └── robot_state/
│       ├── joint_positions     # [7] float32
│       ├── joint_velocities   # [7] float32
│       └── gripper_state      # [2] float32
├── action                     # [7+2] float32（关节 + 夹爪）
├── timestamp                  # float64
└── success                    # bool

episode_001.h5/
...
```

---

## DataCollector

文件：data_collectors/data_collector.py

### 主要方法

| 方法 | 描述 |
| --- | --- |
| start_new_episode() | 初始化新回合缓冲区 |
| write_step(obs, action) | 记录观测和动作 |
| finish_episode(success) | 将回合写入 HDF5 文件 |
| resume() | 从上一个检查点恢复 |

### 用法

```python
from data_collectors.data_collector import DataCollector

collector = DataCollector(cfg)
collector.start_new_episode()

for step in range(max_steps):
    obs = task.get_observation()
    action = controller.forward()
    collector.write_step(obs, action)
    if controller.is_done():
        success = check_success()
        collector.finish_episode(success)
        break
```

---

## 配置

```yaml
collector:
  type: "default"           # 或 "mock"
  compression: null          # 或 "gzip"
  chunk_size: 100            # HDF5 块大小
  output_dir: "outputs/collect/date/time/"
```

---

## 多相机支持

```yaml
cameras_names: ["camera_1", "camera_2", "camera_3"]
cameras:
  - prim_path: "/World/Camera1"
    name: "camera_1"
    image_type: "rgb"
  - prim_path: "/World/Camera2"
    name: "camera_2"
    image_type: "depth"
  - prim_path: "/World/Camera3"
    name: "camera_3"
    image_type: "pointcloud"
```

所有相机都记录在 HDF5 文件中的 observation/images/ 下。

---

## 数据类型

| 类型 | 格式 | 描述 |
| --- | --- | --- |
| RGB 图像 | float32 [H, W, 3] | 彩色图像 |
| 深度图像 | float32 [H, W] | 深度值 |
| 点云 | float32 [H, W, 6] | XYZ + RGB |
| 关节位置 | float32 [DOF] | 机械臂关节位置 |
| 关节速度 | float32 [DOF] | 机械臂关节速度 |
| 夹爪状态 | float32 [2] | 夹爪开合位置 |
| 动作 | float32 [DOF+gripper] | 策略输出动作 |

---

## 数据转换

将 RoboGenesis 格式转换为 LeRobot 格式：

```bash
python scripts/convert_labsim_data_to_lerobot.py \
    --data_dir outputs/collect/xxx/dataset \
    --num_processes 8 \
    --fps 60 \
    --repo_name RoboGenesis/level3-pick
```

参数：

- `--data_dir`：采集的 HDF5 回合路径
- `--num_processes`：并行转换工作进程数
- `--fps`：时间戳的帧率
- `--repo_name`：HuggingFace 数据集名称

---

## 预采集数据

HuggingFace 上提供了预采集的数据集：

```bash
# 待补充 HuggingFace 数据集链接
```

### 数据集结构

```
RoboGenesis-Dataset/
├── level1_pick/
│   ├── meta.json
│   └── episodes/
│       ├── episode_000.h5
│       └── ...
├── level2_pour/
├── level3_workflow/
└── level4_long_horizon/
```

---

## 关键文件

| 用途 | 文件 |
| --- | --- |
| 数据采集器 | data_collectors/data_collector.py |
| Mock 采集器 | data_collectors/mock_collector.py |
| 采集器工厂 | factories/collector_factory.py |
| 转换脚本 | scripts/convert_labsim_data_to_lerobot.py |
