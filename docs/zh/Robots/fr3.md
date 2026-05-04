---
title: FR3
---

# FR3

## 概述

FR3（Franka Research 3）是 Franka Panda 的下一代研究平台，同样采用 7 自由度协作机械臂设计，但硬件有所升级。FR3 配备内置平行指夹爪（Prismatic Gripper），总自由度为 9（7 机械臂 + 2 夹爪）。

FR3 与 Franka 的主要区别在于使用 `_FR3GripperWrapper` 封装内置夹爪为 `ParallelGripper` 兼容接口，以及通过 `fr3_hand` + TCP 偏移计算夹爪位置，而非 Franka 的 `panda_hand/tool_center` 路径。

---

## 技术规格

<div style="text-align: center; margin: 1.5em 0;" markdown="1">

| 属性 | 值 |
| --- | --- |
| 自由度 | 7（机械臂）+ 2（夹爪）= 9 DOF |
| 额定负载 | 2.6 kg |
| 工作半径 | 850 mm |
| 夹爪类型 | Prismatic（平移式） |
| 夹爪关节 | fr3_finger_joint1、fr3_finger_joint2 |
| 夹爪行程 | 0 - 0.04 m（单指位移） |
| 末端执行器 | gripper_center（fr3_hand + z 0.1034m） |
| 内置相机 | arm_camera（手眼相机） |

</div>

---

## 机械臂类

文件：`robots/fr3/fr3.py`

FR3 类的构造函数签名如下：

```python
def __init__(self, prim_path="/World/FR3", name="fr3",
             position=None, orientation=None):
```

初始化示例：

```python
import numpy as np
from robots.fr3.fr3 import FR3

robot = FR3(
    prim_path="/World/FR3",
    name="fr3",
    position=np.array([0, 0, 0.71]),
)
```

---

## 夹爪配置

FR3 使用内置 Prismatic 夹爪，通过 `_FR3GripperWrapper` 适配为 `ParallelGripper` 接口：

<div style="text-align: center; margin: 1.5em 0;" markdown="1">

| 参数 | 值 | 说明 |
| --- | --- | --- |
| GRIPPER_DOF_INDICES | [7, 8] | fr3_finger_joint1、fr3_finger_joint2 |
| GRIPPER_OPEN | [0.04, 0.04] | 张开 4cm（单指 4cm） |
| GRIPPER_CLOSED | [0.0, 0.0] | 完全闭合 |
| 夹爪类型 | Prismatic | 位置控制 |
| 夹爪最大宽度 | 0.08 m | 双指合计 |

</div>

### 夹爪摩擦增强

FR3 内置手指摩擦力原 USD 默认值不足以夹持烧杯。代码中通过 `_boost_finger_friction` 提高摩擦系数：

```python
# 为 fr3_leftfinger/fr3_rightfinger 添加高摩擦材质
mat_prim.GetAttribute("physics:staticFriction").Set(8.0)   # 静摩擦 8.0
mat_prim.GetAttribute("physics:dynamicFriction").Set(6.0)   # 动摩擦 6.0
```

---

## 夹爪位置计算

FR3 使用 `fr3_hand` + 局部 TCP 偏移计算夹爪中心位置：

```python
_TCP_LOCAL_OFFSET = Gf.Vec3d(0.0, 0.0, 0.1034)

def get_gripper_position(self) -> np.ndarray:
    """通过 fr3_hand 世界变换 × TCP 局部偏移计算夹爪中心"""
    hand_prim = stage.GetPrimAtPath(self.prim_path_str + "/fr3_hand")
    xf = UsdGeom.Xformable(hand_prim)
    world_mat = xf.ComputeLocalToWorldTransform(Usd.TimeCode.Default())
    tcp_world = world_mat.Transform(self._TCP_LOCAL_OFFSET)
    return np.array([tcp_world[0], tcp_world[1], tcp_world[2]])
```

这与 RMPFlow URDF 中定义的 `gripper_center`（fr3_hand + z 0.1m）对齐。

---

## 内置相机配置

FR3 末端集成手眼相机 `arm_camera`（与 Franka 相同）：

```python
self.camera = Camera(
    prim_path=prim_path + "/fr3_hand/arm_camera",
    translation=np.array([-0.2, -0, -0.02]),
    frequency=60,
    resolution=(256, 256),
    orientation=np.array([0.20083, 0.67799, -0.67799, -0.20083]),
)
```

---

## PD 增益配置

initialize 时设置各关节 PD 增益：

- 机械臂关节（0-6）：kp = 5e4，kd = 5e3
- 夹爪关节（7-8）：kp = 1000.0，kd = 100.0

```python
n = self.num_dof
kps = np.full(n, 5e4)
kds = np.full(n, 5e3)
for idx in self.GRIPPER_DOF_INDICES:
    kps[idx] = 1000.0
    kds[idx] = 100.0
self.get_articulation_controller().set_gains(kps, kds)
```

---

## 夹爪控制接口

FR3 提供便捷的夹爪控制方法：

```python
def open_gripper(self):
    """打开夹爪到最大宽度（0.04m 单指）"""
    positions = np.zeros(self.num_dof)
    positions[self.GRIPPER_DOF_INDICES] = self.GRIPPER_OPEN
    self.apply_action(ArticulationAction(joint_positions=positions))

def close_gripper(self):
    """关闭夹爪"""
    positions = np.zeros(self.num_dof)
    positions[self.GRIPPER_DOF_INDICES] = self.GRIPPER_CLOSED
    self.apply_action(ArticulationAction(joint_positions=positions))

def set_gripper_width(self, width: float):
    """设置夹爪宽度（范围 0~0.04m）"""
    half_w = np.clip(width / 2.0, 0.0, 0.04)
    # ...
```

---

## 技能默认参数

FR3 使用与 6-DOF 机械臂（UR5e/UR16e/Festo/Rizon4）相同的末端朝向覆盖：

```python
ROBOT_SKILL_OVERRIDES = {
    "fr3": {
        "pick":  {"end_effector_euler": [0, 90, 30]},
        "place": {"end_effector_euler": [0, 90, 30]},
        "pour":  {"end_effector_euler": [0, 90, 30]},
        "shake": {"end_effector_euler": [0, 90, 30]},
    }
}
```

---

## USD 资产

使用 Omniverse CDN 资产（FR3 无本地 USD）：

```
/Isaac/Robots/FrankaRobotics/FrankaFR3/fr3.usd
```

---

## 工作流配置示例

```yaml
robot:
  type: "fr3"
  position: [0, 0, 0.71]
  press_z_tcp_offset: 0.031
```

---

## 运行命令

```bash
# 使用 FR3 运行 pick 原子技能
python main.py --config-name atomic_skills/fr3/pick
```

---

## 关键文件索引

<div style="text-align: center; margin: 1.5em 0;" markdown="1">

| 用途 | 文件路径 |
| --- | --- |
| 机械臂实现 | robots/fr3/fr3.py |
| RMPFlow 控制器 | robots/fr3/rmpflow_controller.py |
| URDF 描述 | robots/fr3/fr3.urdf |
| RMPFlow 配置 | robots/fr3/rmpflow/ |
| 机器人描述 | robots/fr3/rmpflow/robot_descriptor.yaml |

</div>
