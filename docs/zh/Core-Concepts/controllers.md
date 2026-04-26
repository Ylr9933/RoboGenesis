---
title: 控制器
---

# 控制器

## 概览

控制器负责机械臂如何行动（动作计算）和任务是否成功（成功检查）。控制器层组织如下：

- 原子动作控制器：单独技能控制器（拾取、放置、倾倒等）
- 工作流引擎：多步骤任务编排
- 推理引擎：策略模型推理（本地/远程）
- 机械臂控制器：机械臂专用封装器（RMPFlow、移动基座）

---

## BaseController

所有控制器都继承自 controllers/base_controller.py：

### 主要属性

| 属性 | 描述 |
| --- | --- |
| robot | 机械臂实例 |
| gripper | 夹爪控制器 |
| rmpflow_controller | RMPFlow 运动规划器 |
| mode | "collect"（采集）或 "infer"（推理） |
| skill_name | 当前技能名称 |

### 主要方法

| 方法 | 描述 |
| --- | --- |
| forward() | 计算当前步骤的动作 |
| reset() | 重置控制器状态 |
| is_done() | 检查任务/技能是否完成 |
| close() | 清理资源 |

---

## 两种执行模式

### 采集模式

通过状态机执行脚本化技能。用于数据采集。

```yaml
mode: "collect"
```

流程：

1. 执行预定义的技能阶段
2. 记录观测数据（图像、关节状态）
3. 记录动作
4. 检查成功条件
5. 为下一个回合重置

### 推理模式

策略模型推理。用于评估。

```yaml
mode: "infer"
infer:
  type: "local"  # 或 "remote"
  policy_model_path: "path/to/model.ckpt"
```

流程：

1. 从任务获取观测数据
2. 发送到推理引擎
3. 从策略模型获取动作
4. 通过 RMPFlow 执行动作
5. 检查成功条件

---

## RMPFlow 控制器

RMPFlow（Riemannian Motion Policy Flow）提供平滑的运动规划。

```python
# 初始化 RMPFlow
self.rmpflow_controller = RMPFlowController(
    robot_prim_path=self.robot.prim_path_str,
    robot_description_path=rmpflow_yaml_path,
    rmpflow_config_path=rmpflow_config_yaml,
)
```

用法：

```python
# 移动到目标姿态
target_pose = [x, y, z, rx, ry, rz, rw]  # 四元数
self.rmpflow_controller.execute(target_pose)

# 获取当前末端执行器姿态
current_pose = self.robot.get_end_effector_pose()
```

---

## 原子动作控制器

位于 controllers/atomic_actions/：

| 技能 | 阶段数 | 文件 |
| --- | --- | --- |
| pick（拾取） | 7 | pick_controller.py |
| place（放置） | 6 | place_controller.py |
| pour（倾倒） | 6 | pour_controller.py |
| stir（搅拌） | 5 | stir_controller.py |
| shake（摇晃） | 10 | shake_controller.py |
| press（按压） | 3 | press_controller.py |
| pressZ（Z轴按压） | 3 | pressZ_controller.py |
| open（打开） | 8 | open_controller.py |
| close（关闭） | 3 | close_controller.py |
| move（移动） | 1 | move_controller.py |

### 状态机模式

所有原子控制器都遵循基于阶段的状态机：

```python
class PickController:
    def __init__(self, ...):
        self._event = 0      # 当前阶段（0-6）
        self._t = 0.0        # 阶段进度（0-1）

    def forward(self):
        if self._event == 0:
            # 阶段 0：移动到物体上方
            return self._phase_0()
        elif self._event == 1:
            # 阶段 1：水平接近
            return self._phase_1()
        # ...

    def is_done(self):
        return self._event >= 7  # 所有阶段完成
```

### 拾取控制器（7 阶段）

| 阶段 | 描述 |
| --- | --- |
| 0 | 移动末端执行器到物体上方（沿接近方向） |
| 1 | 末端执行器下降靠近物体（水平缓冲） |
| 2 | 调整末端执行器至抓取姿态 |
| 3 | 等待机械臂动力学稳定 |
| 4 | 闭合夹爪抓取物体（支持虚拟连接） |
| 5 | 抬起物体 |
| 6 | 完成抓取序列 |

### 放置控制器（6 阶段）

| 阶段 | 描述 |
| --- | --- |
| 0 | 预放置：高处接近（先移动到目标上方） |
| 1 | 下降到目标位置 |
| 2 | 等待动力学稳定 |
| 3 | 张开夹爪释放物体 |
| 4 | 从放置位置撤回 |
| 5 | 完成 |

**events_dt：**`[0.005, 0.01, 0.08, 0.05, 0.01, 0.1]`

### 倾倒控制器（6 阶段）

| 阶段 | 描述 |
| --- | --- |
| 0 | 移动到目标上方（带随机高度偏移） |
| 1 | 调整高度和横向位置至目标 |
| 2 | 切换第7关节至速度模式，施加正向倾倒速度 |
| 3 | 保持第7关节速度为0（暂停倾倒） |
| 4 | 施加反向（负）速度倒回 |
| 5 | 保持并完成倾倒 |

倾倒动作使用腕部关节（第7关节）的速度模式来控制倾斜角度。正向速度倾倒液体，反向速度恢复。

### 搅拌控制器（5 阶段）

| 阶段 | 描述 |
| --- | --- |
| 0 | 抬起玻璃棒 |
| 1 | 移动到烧杯上方 |
| 2 | 下降进入烧杯 |
| 3 | 执行搅拌动作 |
| 4 | 从烧杯中抬起 |

### 摇晃控制器（10 阶段）

多阶段摇晃/动态运动序列。

**events_dt：**`[0.02, 0.018, 0.018, 0.018, 0.018, 0.018, 0.018, 0.018, 0.018, 0.015]`

| 阶段 | 描述 |
| --- | --- |
| 0–9 | 递减时间间隔的连续摇晃动作 |

### 按压控制器（3 阶段）

| 阶段 | 描述 |
| --- | --- |
| 0 | 移动末端执行器到目标前方 |
| 1 | 闭合夹爪 |
| 2 | 向前按压至目标位置 |

### 按压Z控制器（3 阶段）

垂直（Z轴）按压运动。

**events_dt：**`[0.005, 0.01, 0.01]`

| 阶段 | 描述 |
| --- | --- |
| 0 | 移动到目标上方 |
| 1 | 下降至按压位置 |
| 2 | 施加向下按压力 |

### 打开控制器（8 阶段）

用于柜门和抽屉。

**状态流程：**`APPROACH → FINE_ADJUST → GRIP → ARC_PULL → IDLE → RELEASE → RETREAT → DONE`

**events_dt：**`[0.0025, 0.005, 0.0075, 0.002, 0.05, 0.05, 0.01, 0.008]`

| 阶段 | 描述 |
| --- | --- |
| 0 | 接近：移动到把手前方预备位置 |
| 1 | 微调：精确对准把手 |
| 2 | 抓取：夹爪夹住把手 |
| 3 | 弧线拉动：弧形轨迹拉动 |
| 4 | 等待：惯性消散等待 |
| 5 | 释放：张开夹爪放开把手 |
| 6 | 撤回：从门处后退 |
| 7 | 完成 |

### 关闭控制器（3 阶段）

用于关闭柜门和抽屉。

**events_dt：**`[0.0025, 0.005, 0.005]`

| 阶段 | 描述 |
| --- | --- |
| 0 | APPROACH：移动到把手前方预备位置（手指保持张开以便把手进入） |
| 1 | ARC_PUSH：弧形推动轨迹，当把手进入张开的手指间时夹爪夹紧至 regrip_gap |
| 2 | RETREAT：如配置了等待时间则先等待，然后使用最后的旋转方向后撤 |

支持 `regrip_gap` 参数，用于需要在推动前主动重新夹紧的工作流。

### 移动控制器（1 阶段）

简单的笛卡尔空间点对点移动控制器。

| 阶段 | 描述 |
| --- | --- |
| 0 | 通过 cspace 控制器将末端执行器移动至目标位置和姿态 |

**多段模式：**`forward_multi_segment()` 顺序遍历路径点列表。`forward_two_points()` 是垂直移动后再水平移动的两路径点便捷封装。

---

## 推理引擎

### 本地推理

```python
from controllers.inference_engines.local_model_inference_engine import LocalModelInferenceEngine

engine = LocalModelInferenceEngine(
    policy_model_path="path/to/model.ckpt",
    normalizer_path="path/to/normalize.ckpt",
)
action = engine.infer(observation)
```

### 远程推理

```python
from controllers.inference_engines.remote_inference_engine import RemoteInferenceEngine

engine = RemoteInferenceEngine(
    host="0.0.0.0",
    port=8080,
    n_obs_steps=3,
)
action = engine.infer(observation)
```

---

## 关键文件

| 用途 | 文件 |
| --- | --- |
| 基础控制器 | controllers/base_controller.py |
| 原子动作 | controllers/atomic_actions/ |
| 工作流引擎 | controllers/workflow/workflow_engine.py |
| 技能执行器 | controllers/workflow/skill_executor.py |
| 持有物体上下文 | controllers/workflow/held_object_context.py |
| 本地推理 | controllers/inference_engines/local_model_inference_engine.py |
| 远程推理 | controllers/inference_engines/remote_inference_engine.py |
| 成功条件 | controllers/workflow/success_condition_manager.py |
