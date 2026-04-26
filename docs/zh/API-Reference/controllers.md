---
title: 控制器 API
---

# 控制器 API

## 概述

本节介绍控制器层 API。控制器负责机器人动作计算和成功状态检查。

---

## BaseController

文件: controllers/base_controller.py

所有控制器的基类。

```python
from controllers.base_controller import BaseController

class MyController(BaseController):
    pass
```

### 继承关系

```
BaseController
├── WorkflowController
├── AtomicActionController
│   ├── PickController
│   ├── PlaceController
│   └── ...
└── NavigationController
```

### 构造函数

```python
def __init__(
    self,
    task: BaseTask,
    robot: Robot,
    cfg: DictConfig,
    name: str = "controller",
):
```

| 参数 | 描述 |
| --- | --- |
| task | 用于观测的任务实例 |
| robot | 机器人实例 |
| cfg | Hydra 配置 |
| name | 控制器名称 |

### 关键方法

#### forward()

```python
def forward(self) -> np.ndarray:
    """
    计算当前步骤的动作。
    返回: 动作数组 [DOF + gripper]
    """
    raise NotImplementedError
```

#### reset()

```python
def reset(self):
    """重置控制器状态以开始新的 episode"""
    pass
```

#### is_done()

```python
def is_done(self) -> bool:
    """检查任务/技能是否完成"""
    return False
```

#### close()

```python
def close(self):
    """清理资源"""
    pass
```

### 属性

| 属性 | 描述 |
| --- | --- |
| robot | 机器人实例 |
| gripper | 夹爪实例 |
| rmpflow_controller | 运动规划器 |
| skill_name | 技能名称 |

---

## 原子动作控制器

### PickController

文件: controllers/atomic_actions/pick_controller.py

```python
from controllers.atomic_actions.pick_controller import PickController

controller = PickController(task, robot, cfg)
```

阶段: 7 个阶段 (0-6)

| 阶段 | 描述 |
| --- | --- |
| 0 | 初始阶段 |
| 1 | 移动到物体上方 |
| 2 | 下降接近物体 |
| 3 | 关闭夹爪抓取 |
| 4 | 抬起物体 |
| 5 | 移动到目标位置 |
| 6 | 放置物体 |

### PlaceController

文件: controllers/atomic_actions/place_controller.py

阶段: 6 个阶段 (0-5)

| 阶段 | 描述 |
| --- | --- |
| 0 | 移动到放置位置上方 |
| 1 | 下降接近目标位置 |
| 2 | 打开夹爪释放物体 |
| 3 | 等待稳定 |
| 4 | 抬起夹爪 |
| 5 | 返回安全位置 |

### PourController

文件: controllers/atomic_actions/pour_controller.py

阶段: 6 个阶段 (0-5)

| 阶段 | 描述 |
| --- | --- |
| 0-1 | 倾斜准备 |
| 2-3 | 执行倾倒 |
| 4-5 | 恢复直立 |

### StirController

文件: controllers/atomic_actions/stir_controller.py

阶段: 5 个阶段 (0-4)

| 阶段 | 描述 |
| --- | --- |
| 0 | 移动到搅拌棒上方 |
| 1 | 下降接触液体 |
| 2 | 执行搅拌动作 |
| 3 | 搅拌完成 |
| 4 | 抬起搅拌棒 |

---

## WorkflowEngine

文件: controllers/workflow/workflow_engine.py

```python
from controllers.workflow.workflow_engine import WorkflowEngine

engine = WorkflowEngine(task, robot, cfg)
```

### 方法

#### step()

```python
def step(self) -> Tuple[np.ndarray, bool]:
    """
    执行一个工作流步骤。
    返回: (action, done)
    """
```

#### reset()

```python
def reset(self):
    """重置工作流状态"""
```

### 组件

| 组件 | 描述 |
| --- | --- |
| SkillExecutor | 技能执行器 |
| TransitionManager | 状态转换管理器 |
| SuccessConditionManager | 成功条件管理器 |
| HeldObjectContext | 持有对象上下文 |

---

## 关键文件

| 文件 | 描述 |
| --- | --- |
| controllers/base_controller.py | 基类控制器 |
| controllers/atomic_actions/pick_controller.py | 抓取控制器 |
| controllers/atomic_actions/place_controller.py | 放置控制器 |
| controllers/atomic_actions/pour_controller.py | 倾倒控制器 |
| controllers/atomic_actions/stir_controller.py | 搅拌控制器 |
| controllers/atomic_actions/shake_controller.py | 摇动控制器 |
| controllers/atomic_actions/press_controller.py | 按压控制器 |
| controllers/atomic_actions/open_controller.py | 打开控制器 |
| controllers/atomic_actions/close_controller.py | 关闭控制器 |
| controllers/workflow/workflow_engine.py | 工作流引擎 |
