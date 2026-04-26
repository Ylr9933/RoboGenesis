---
title: 机器人 API
---

# 机器人 API

## 概述

本节介绍机器人层 API。机器人为配有 RMPFlow 运动规划的机械臂提供物理抽象。

---

## GenericArm

文件: robots/base/generic_arm.py

新机器人实现的基类。

```python
from robots.base import GenericArm

class MyRobot(GenericArm):
    pass
```

### 类常量

| 常量 | 描述 |
| --- | --- |
| ARM_DOF | 手臂关节数 |
| GRIPPER_DOF_INDICES | 夹爪关节索引 |
| GRIPPER_CLOSED | 闭合位置 |
| TCP_OFFSET_LOCAL | TCP 偏移量 |

### 方法

#### _resolve_usd_path()

```python
def _resolve_usd_path(self) -> Optional[str]:
    """
    返回机器人资产的 USD 路径。
    返回 None 以使用 CDN 回退方案。
    """
    return local_asset_path("robots/MyRobot.usd")
```

#### _attach_gripper()

```python
def _attach_gripper(self, stage):
    """将夹爪连接到机器人"""
    attach_robotiq_2f85(
        stage,
        robot_prim_path=self.prim_path_str,
        mount_link_path=f"{self.prim_path_str}/flange",
    )
```

#### initialize()

```python
def initialize(self, physics_sim_view=None):
    """初始化机器人关节和控制器"""
    pass
```

#### post_reset()

```python
def post_reset(self):
    """将机器人重置为初始状态"""
    pass
```

#### get_gripper_position()

```python
def get_gripper_position(self) -> np.ndarray:
    """
    获取 TCP 世界坐标位置。
    返回: [x, y, z] 位置
    """
```

---

## 机器人实现

### Franka

文件: robots/franka/franka.py

```python
from robots.franka.franka import Franka

robot = Franka(
    prim_path="/World/Franka",
    name="franka",
    physics_sim_view=physics_view,
)
```

| 属性 | 值 |
| --- | --- |
| 自由度 | 7 |
| 夹爪 | 棱柱形（内置） |

### FR3

文件: robots/fr3/fr3.py

```python
from robots.fr3.fr3 import FR3

robot = FR3(
    prim_path="/World/FR3",
    name="fr3",
    physics_sim_view=physics_view,
)
```

| 属性 | 值 |
| --- | --- |
| 自由度 | 7 |
| 夹爪 | 棱柱形（内置） |

### UR5e

文件: robots/ur5e/ur5e.py

```python
from robots.ur5e.ur5e import UR5e

robot = UR5e(
    prim_path="/World/UR5e",
    name="ur5e",
    physics_sim_view=physics_view,
)
```

| 属性 | 值 |
| --- | --- |
| 自由度 | 6 |
| 夹爪 | Robotiq 2F-85（旋转式） |

### UR16e

文件: robots/ur16e/ur16e_arm.py

```python
from robots.ur16e.ur16e_arm import UR16eArm

robot = UR16eArm(
    prim_path="/World/UR16e",
    name="ur16e",
    physics_sim_view=physics_view,
)
```

| 属性 | 值 |
| --- | --- |
| 自由度 | 6 |
| 夹爪 | Robotiq 2F-85（旋转式） |

### Festo

文件: robots/festo/festo_arm.py

```python
from robots.festo.festo_arm import FestoArm

robot = FestoArm(
    prim_path="/World/Festo",
    name="festo",
    physics_sim_view=physics_view,
)
```

| 属性 | 值 |
| --- | --- |
| 自由度 | 6 |
| 夹爪 | Robotiq 2F-85（旋转式） |

### Piper

文件: robots/piper/piper.py

```python
from robots.piper.piper import Piper

robot = Piper(
    prim_path="/World/Piper",
    name="piper",
    physics_sim_view=physics_view,
)
```

| 属性 | 值 |
| --- | --- |
| 自由度 | 6 |
| 夹爪 | 棱柱形（内置） |

### Rizon4

文件: robots/rizon4/rizon4_arm.py

```python
from robots.rizon4.rizon4_arm import Rizon4Arm

robot = Rizon4Arm(
    prim_path="/World/Rizon4",
    name="rizon4",
    physics_sim_view=physics_view,
)
```

| 属性 | 值 |
| --- | --- |
| 自由度 | 7 |
| 夹爪 | Robotiq 2F-85（旋转式） |

---

## 工具函数

### attach_robotiq_2f85()

文件: robots/base/init.py

```python
from robots.base import attach_robotiq_2f85

def attach_robotiq_2f85(
    stage,
    robot_prim_path: str,
    mount_link_path: str,
):
    """将 Robotiq 2F-85 夹爪连接到机器人"""
```

### local_asset_path()

```python
from robots.base import local_asset_path

def local_asset_path(relative_path: str) -> Optional[str]:
    """
    使用离线优先逻辑解析资产路径。
    如果存在则返回本地路径，否则返回 None。
    """
```

---

## 关键文件

| 文件 | 描述 |
| --- | --- |
| robots/base/generic_arm.py | 通用机械臂基类 |
| robots/base/init.py | 初始化工具函数 |
| robots/franka/franka.py | Franka 机器人 |
| robots/fr3/fr3.py | FR3 机器人 |
| robots/ur5e/ur5e.py | UR5e 机器人 |
| robots/ur16e/ur16e_arm.py | UR16e 机器人 |
| robots/festo/festo_arm.py | Festo 机器人 |
| robots/piper/piper.py | Piper 机器人 |
| robots/rizon4/rizon4_arm.py | Rizon4 机器人 |
| controllers/robot_configs/registry.py | 机器人配置注册表 |
