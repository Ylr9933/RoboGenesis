---
title: Franka Panda
---

# Franka Panda

## 概述

Franka Panda 是 RoboGenesis 中的默认研究级机械臂，采用 7 自由度（7-DOF）协作机械臂设计，配备内置平行指夹爪（Prismatic Gripper）。机械臂具有精确的力控能力和高灵敏度的触觉反馈，适合精细操作任务。

Franka 的显著特点在于其内置夹爪直接集成在机械臂末端（无需外部夹爪适配器），以及贴片式关节传感器设计，使其成为机器人研究领域的标杆平台。

---

## 技术规格

<div style="text-align: center; margin: 1.5em 0;" markdown="1">

| 属性 | 值 |
| --- | --- |
| 自由度 | 7（机械臂）+ 2（夹爪）= 9 DOF |
| 额定负载 | 2.6 kg |
| 工作半径 | 850 mm |
| 位置重复精度 | ±0.1 mm |
| 关节 1-7 限位 | ±166° 至 ±123°（各关节不同） |
| 夹爪类型 | Prismatic（平移式） |
| 夹爪行程 | 0 - 0.08 m（双指间距） |
| 末端执行器 | panda_rightfinger |
| 内置相机 | arm_camera（手眼相机） |

</div>

---

## 机械臂类

文件：`robots/franka/franka.py`

Franka 类的构造函数签名如下：

```python
def __init__(
    self,
    prim_path: str = "/World/Franka",
    name: str = "franka",
    usd_path: Optional[str] = None,
    position: Optional[np.ndarray] = None,
    orientation: Optional[np.ndarray] = None,
    end_effector_prim_name: Optional[str] = None,
    gripper_dof_names: Optional[List[str]] = None,
    gripper_open_position: Optional[np.ndarray] = None,
    gripper_closed_position: Optional[np.ndarray] = None,
    deltas: Optional[np.ndarray] = None,
) -> None:
```

初始化示例：

```python
import numpy as np
from robots.franka.franka import Franka

robot = Franka(
    prim_path="/World/Franka",
    name="franka",
    position=np.array([-0.4, 0, 0.71]),
)
```

---

## 默认 HOME 姿态

Franka 使用弯曲姿态启动，避免初始状态贴桌面或伸太直：

```python
_DEFAULT_ARM_Q = [0.00, -1.3, 0.00, -2.87, 0.00, 2.00, 0.75]
```

各关节含义（弧度）：

- joint1 = 0.00（肩部旋转，水平）
- joint2 = -1.3（大臂抬高约 75°，向前）
- joint3 = 0.00（小臂竖直向下）
- joint4 = -2.87（肘部弯曲约 164°）
- joint5 = 0.00（前臂朝向）
- joint6 = 2.00（手腕弯曲约 115°）
- joint7 = 0.75（手腕旋转约 43°）

---

## 夹爪配置

Franka 使用内置 Prismatic 平行指夹爪，无需外部适配器：

<div style="text-align: center; margin: 1.5em 0;" markdown="1">

| 参数 | 值 | 说明 |
| --- | --- | --- |
| GRIPPER_DOF_INDICES | [7, 8] | joint7 + joint8 |
| GRIPPER_OPEN | [0.05, 0.05] / get_stage_units() | 张开位置（约 0.05 m） |
| GRIPPER_CLOSED | [0.0, 0.0] | 闭合位置（完全闭合） |
| 夹爪控制模式 | position | 位置控制模式 |

</div>

夹爪通过 `ParallelGripper` 类管理，内部物理接触传感器位于 `panda_leftfinger` 和 `panda_rightfinger`。

---

## 内置相机配置

Franka 末端集成手眼相机 `arm_camera`：

```python
self.camera = Camera(
    prim_path=prim_path + "/panda_hand/arm_camera",
    translation=np.array([-0.2, -0, -0.02]),  # 相机在手部的偏移
    frequency=60,
    resolution=(256, 256),
    orientation=np.array([0.20083, 0.67799, -0.67799, -0.20083]),
)
```

---

## PD 增益配置

initialize 时设置各关节 PD 增益（与 Rizon4/Festo/UR5e/UR16e/Piper 模式一致）：

- 机械臂关节（0-6）：kp = 5e4，kd = 5e3
- 夹爪关节（7-8）：由 ParallelGripper 管理，使用内部设置

---

## RMPFlow 配置

RMPFlow 运动规划配置文件位于：

<div style="text-align: center; margin: 1.5em 0;" markdown="1">

| 文件 | 用途 |
| --- | --- |
| robots/franka/rmpflow/franka_rmpflow_common.yaml | 共享 RMP 配置 |
| robots/franka/rmpflow/config.json | RMPFlow 控制器参数 |
| robots/franka/rmpflow/robot_descriptor.yaml | 机械臂描述（URDF 路径、默认姿态） |

</div>

---

## 关节限位

```yaml
joint_limits:
  position_lower: [-2.8973, -2.6180, -2.8973, -2.8973, -2.8973, -3.8223, -2.8973]
  position_upper: [2.8973, 2.6180, 2.8973, 2.8973, 2.8973, 0.0873, 2.8973]
```

注意 joint6（腕关节 2）的上限仅为 +0.0873 rad（约 5°），限制了手腕向上弯曲的范围。

---

## USD 资产

- 优先使用本地资产：`assets/robots/Franka.usd`（内含 SubUSDs 目录下的所有 `panda_link*.usd`）
- 无本地资产时回退到 Omniverse CDN：`/Isaac/Robots/FrankaRobotics/FrankaPanda/franka.usd`

---

## 获取夹爪位置

```python
def get_gripper_position(self) -> np.ndarray:
    """返回夹爪中心 panda_hand/tool_center 的世界坐标"""
    return ObjectUtils.get_instance().get_object_xform_position(
        object_path=self.prim_path_str + "/panda_hand/tool_center"
    )
```

---

## 工作流配置示例

```yaml
robot:
  type: "franka"
  position: [-0.4, 0, 0.71]

# Franka 是全局默认机械臂，无需额外 skill overrides
```

---

## 运行命令

```bash
# 使用 Franka 默认配置运行 pick 原子技能
python main.py --config-name atomic_skills/franka/pick

# 使用 Franka 运行工作流
python main.py --config-name workflows/workflow_pick_open_place_close_franka
```

---

## 关键文件索引

<div style="text-align: center; margin: 1.5em 0;" markdown="1">

| 用途 | 文件路径 |
| --- | --- |
| 机械臂实现 | robots/franka/franka.py |
| RMPFlow 控制器 | robots/franka/rmpflow_controller.py |
| URDF 描述 | robots/franka/lula_franka_gen.urdf |
| USD 资产 | assets/robots/Franka.usd |
| RMPFlow 配置 | robots/franka/rmpflow/ |
| 机器人描述 | robots/franka/rmpflow/robot_descriptor.yaml |

</div>