---
title: 调试工具
---

# 调试工具

## 概览

RoboGenesis 提供调试工具用于回放 episode 和诊断问题。

---

## 注册检查器

验证所有机械臂和技能都已正确注册。

### 使用方法


```

python scripts/check_registrations.py

```


### 预期输出


```

OK: 8 robots in _CLASS_NAME_MAP, 8 in ROBOT_CONFIGS — all mappings resolve

```


### 检查内容

_CLASS_NAME_MAP 中的所有机械臂都存在于 ROBOT_CONFIGS

ROBOT_CONFIGS 中的所有机械臂都存在于 _CLASS_NAME_MAP

配置文件可以加载

导入路径有效

---

## 回放工具

回放收集的 episode 以进行可视化和调试。

### 使用方法


```

python scripts/labgen_replay.py --episode outputs/collect/xxx/episode_000.h5

```


### 选项


```

# 指定 episode 文件

python scripts/labgen_replay.py --episode /path/to/episode.h5
# 指定相机

python scripts/labgen_replay.py --episode /path/to/episode.h5 --camera camera_1
# 循环播放

python scripts/labgen_replay.py --episode /path/to/episode.h5 --loop

```


---

## 调试模式

启用详细日志记录以便进行详细调试。

### 使用方法


```

# 使用调试日志运行

python main.py --config-name atomic_skills/pick log_level=DEBUG
# 或在配置中

python main.py --config-name atomic_skills/pick --override log_level=DEBUG

```


### 日志级别

| 级别 |
| --- |
| DEBUG |
| INFO |
| WARNING |
| ERROR |

---

## 物理调试

### 检查碰撞


```

# 在控制器中

if self._check_collision():
print("Collision detected!")
self._handle_collision()

```


### 可视化碰撞球


```

# 在配置中

physics:
visualize_collision_spheres: true
collision_sphere_radius: 0.02

```


---

## RMPFlow 调试

### 检查轨迹


```

# 在控制器中

trajectory = self.rmpflow_controller.get_trajectory()
print("Trajectory points:", len(trajectory))
# 检查 NaN

if np.any(np.isnan(trajectory)):
print("Warning: NaN in trajectory!")

```


---

## 相机调试

### 验证相机数据


```

# 在任务中

camera_data = self.get_camera_data("camera_1")
print("RGB shape:", camera_data["rgb"].shape)
print("Depth shape:", camera_data["depth"].shape)
# 检查空数据

if camera_data["rgb"] is None:
print("Warning: No RGB data!")

```


---

## 常见调试场景

### 机械臂不动

检查 RMPFlow 是否已初始化

验证关节限制

检查动作中是否有 NaN


```

print("Action:", action)
print("NaN in action:", np.any(np.isnan(action)))

```


### 技能未完成

检查成功条件阈值

验证阶段推进

检查转换管理器


```

print("Current phase:", controller._event)
print("Phase progress:", controller._t)

```


### 找不到物体

验证场景中的物体路径

检查位置范围

验证 USD 文件是否存在


```

ls -la assets/chemistry_lab/

```


---

## 性能分析

### 时间测量


```

import time
start = time.time()
action = controller.forward()
elapsed = time.time() - start
print(f"Controller forward took {elapsed*1000:.2f}ms")

```


### 内存


```

import tracemalloc
tracemalloc.start()
# 运行代码

current, peak = tracemalloc.get_traced_memory()
print(f"Peak memory: {peak / 1024 / 1024:.2f} MB")
tracemalloc.stop()

```


---

## 关键文件

<div style="text-align: center; margin: 1.5em 0;" markdown>

| 文件 | 描述 |
| --- | --- |
| `scripts/check_registrations.py` | 注册自检脚本 |
| `scripts/labgen_replay.py` | Episode 回放脚本 |
| `controllers/workflow/workflow_engine.py` | 工作流引擎 |
| `lab_utils/` | 工具库目录 |

</div>
