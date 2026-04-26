---
title: 机械臂
---

# 机械臂

## 概览

RoboGenesis 支持7种机械臂平台，涵盖不同的制造商。每种机械臂都实现为 Python 类，继承自 GenericArm（基类）或 Isaac Sim 的 Robot 类。

---

## 支持的机械臂

| 机械臂 | 夹爪 | 资产来源 | DOF | 制造商 |
| --- | --- | --- | --- | --- |
| Franka (Panda) | 夹持式（内置） | Isaac Sim CDN | 7 | Franka Robotics |
| UR5e | Robotiq 2F-85（旋转式） | Isaac Sim CDN | 6 | Universal Robots |
| UR16e | Robotiq 2F-85（旋转式） | Isaac Sim CDN | 6 | Universal Robots |
| Festo | Robotiq 2F-85（旋转式） | Isaac Sim CDN | 6 | Festo |
| Piper | 夹持式（内置） | Isaac Sim CDN | 6 | AgileX |
| Rizon4 | Robotiq 2F-85（旋转式） | Isaac Sim CDN | 7 | Flexiv |
| FR3 | 夹持式（内置） | Isaac Sim CDN | 7 | Franka Robotics |

---

## 基础类：GenericArm

robots/base/generic_arm.py 提供了一个可重用的基类，用于新机械臂的实现。

### 主要类常量

| 常量 | 描述 |
| --- | --- |
| ARM_DOF | 机械臂关节数量 |
| GRIPPER_TYPE | "prismatic"（夹持式）或 "revolute"（旋转式） |
| GRIPPER_DOF_INDICES | 夹爪关节索引列表 |
| GRIPPER_OPEN | 夹爪张开位置值 |
| GRIPPER_CLOSED | 夹爪闭合位置值 |
| GRIPPER_MAX_WIDTH | 夹爪最大开合宽度 |
| TCP_OFFSET_LOCAL | 法兰盘到 TCP 的偏移量（np.array） |

### 主要方法

| 方法 | 描述 |
| --- | --- |
| _resolve_usd_path() | 解析 USD 资源路径 |
| _attach_gripper(stage) | 连接夹爪到机械臂 |
| initialize(physics_sim_view) | 初始化机械臂 |
| post_reset() | 重置机械臂状态 |
| get_gripper_position() | 获取夹爪位置 |

---

## 机械臂目录结构

每个机械臂都遵循以下目录模式：

```
robots/
├── <robot>.py              # 主机械臂类
├── __init__.py             # 导出机械臂类
├── rmpflow_controller.py   # RMPFlow 运动规划
├── <robot>.urdf            # Lula/RMPFlow 使用的 URDF
├── lula_<robot>_gen.urdf   # 生成的 URDF
└── rmpflow/                # RMPFlow 配置
    ├── <robot>_rmpflow_config.yaml
    └── robot_description.yaml
```

---

## 机械臂注册表

所有机械臂在两个地方注册：

### 1. 控制器注册表

文件：controllers/robot_configs/registry.py

```python
ROBOT_CONFIGS = {
    "franka": {
        "arm_dof": 7,
        "gripper_dof_indices": [7, 8],
        "gripper_type": "prismatic",
        "gripper_max_width": 0.08,
        "lula_description_path": "franka/rmpflow/robot_description.yaml",
        "lula_urdf_path": "franka/lula_franka_gen.urdf",
        "press_z_tcp_offset": 0.031,
    },
    # ... 其他机械臂
}
```

### 2. 机械臂工厂

文件：factories/robot_factory.py

```python
_CLASS_NAME_MAP = {
    "franka": ("robots.franka.franka", "Franka"),
    "fr3": ("robots.fr3.fr3", "FR3"),
    # ... 其他机械臂
}
```

---

## 夹爪类型

### 夹持式（平行夹爪）

- 适用机械臂：Franka、FR3、Piper
- 线性运动，对称手指
- 通过关节位置限制进行配置
- 内置夹爪（无需外部连接）

### 旋转式（Robotiq 2F-85）

- 适用机械臂：UR5e、UR16e、Rizon4、Festo
- 1 自由度，带 5 个仿生关节实现四连杆机构
- 在 ParallelGripper 中使用 use_mimic_joints=True
- 需要使用 attach_robotiq_2f85() 辅助函数

---

## 工具函数

### attach_robotiq_2f85()

将 Robotiq 2F-85 夹爪连接到机械臂：

```python
from robots.base import attach_robotiq_2f85

def _attach_gripper(self, stage):
    attach_robotiq_2f85(
        stage,
        robot_prim_path=self.prim_path_str,
        mount_link_path=f"{self.prim_path_str}/flange",
    )
```

### local_asset_path()

离线优先的资产路径解析：

```python
from robots.base import local_asset_path

def _resolve_usd_path(self):
    return local_asset_path("robots/MyNewArm.usd")
    # 如果存在则返回本地路径，否则返回 None（回退到 CDN）
```

---

## 各机械臂配置

### [Franka](../Robots/franka.md)

### [Fr3](../Robots/fr3.md)

### [Rizon4](../Robots/rizon4.md)

### [UR5e](../Robots/ur5e.md)

### [UR16e](../Robots/ur16e.md)

### [Piper](../Robots/piper.md)

### [Festo](../Robots/festo.md)


---

## 添加新机械臂

详细教程请参阅[添加新机械臂](../Robots/adding-new-robot.md)。

---

## 关键文件

| 用途 | 文件 |
| --- | --- |
| 基础类 | robots/base/generic_arm.py |
| 基础工具 | robots/base/__init__.py |
| 机械臂注册表 | controllers/robot_configs/registry.py |
| 机械臂工厂 | factories/robot_factory.py |
| Franka 实现 | robots/franka/franka.py |
| FR3 实现 | robots/fr3/fr3.py |
| UR5e 实现 | robots/ur5e/ur5e.py |
| UR16e 实现 | robots/ur16e/ur16e_arm.py |
| Rizon4 实现 | robots/rizon4/rizon4_arm.py |
| Festo 实现 | robots/festo/festo_arm.py |
| Piper 实现 | robots/piper/piper.py |
