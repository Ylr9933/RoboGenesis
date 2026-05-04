---
title: Piper
---

# Piper

## 概述

Piper 是来自 AgileX 的感知型 6 自由度协作机械臂，内置平行指夹爪。相较于其他 6-DOF 机械臂，Piper 的显著特点是其"感知型"设计——集成了 RealSense 深度相机，能够同时获取 RGB 图像和深度信息，适用于需要视觉反馈的抓取和操作任务。

Piper 使用本地 USD 资源（`robots/piper/piper_v2_noscale.usd`），夹爪采用 Prismatic 设计但控制方式与 Franka 不同（joint7 正向开、joint8 负向开）。

---

## 技术规格

<div style="text-align: center; margin: 1.5em 0;" markdown="1">

| 属性 | 值 |
| --- | --- |
| 自由度 | 6（机械臂）+ 2（夹爪）= 8 DOF |
| 额定负载 | 3 kg |
| 夹爪类型 | Prismatic（双指对称反向运动） |
| 夹爪关节 | joint7（正向）、joint8（负向） |
| 末端执行器 | link6 |
| 集成相机 | RealSense 深度相机（RGB-D） |
| USD 资源 | 本地（robots/piper/piper_v2_noscale.usd） |

</div>

---

## 机械臂类

文件：`robots/piper/piper.py`

Piper 类的构造函数签名如下：

```python
def __init__(self, prim_path="/World/Piper", name="piper",
             position=None, orientation=None):
```

初始化示例：

```python
import numpy as np
from robots.piper.piper import Piper

robot = Piper(
    prim_path="/World/Piper",
    name="piper",
    position=np.array([0, 0, 0.71]),
)
```

---

## 默认 HOME 姿态

Piper 官方默认姿态让大臂抬起、小臂倾斜，避免初始贴桌面：

```python
_DEFAULT_ARM_Q = [0.0, 1.5708, -1.5, 0.0, 0.0, 0.0]
```

各关节含义（弧度）：

- joint1 = 0.0（肩部旋转）
- joint2 = 1.5708（约 90°，大臂抬高）
- joint3 = -1.5（小臂向下倾斜约 86°）
- joint4-6 = 0.0（手腕居中）

---

## 夹爪配置

Piper 夹爪的独特之处在于两个关节运动方向相反（joint7 正向、joint8 负向），这是通过机械结构设计实现的：

<div style="text-align: center; margin: 1.5em 0;" markdown="1">

| 参数 | 值 | 说明 |
| --- | --- | --- |
| GRIPPER_DOF_INDICES | [6, 7] | link6 的两个夹爪关节 |
| GRIPPER_OPEN | [0.05, -0.05] | joint7 正向 0.05，joint8 负向 0.05 |
| GRIPPER_CLOSED | [0.0, 0.0] | 完全闭合 |
| 夹爪类型 | Prismatic | 平行指平移夹爪 |

</div>

### 夹爪物理修复

Piper USD 中 link7/link8 是空 Xform，没有 collision mesh，导致夹爪"幽灵化"无法物理接触物体。代码中通过程序化添加 Sphere collider 修复此问题：

```python
# 为 link7/link8 添加半径 1.5cm 的球形碰撞体
FINGER_RADIUS = 0.015  # 1.5cm
for link_name in ["link7", "link8"]:
    sphere_prim = stage.DefinePrim(f"{link_path}/fingerCollider", "Sphere")
    sphere.CreateRadiusAttr(FINGER_RADIUS)
    UsdPhysics.CollisionAPI.Apply(sphere_prim)
```

同时增大夹爪关节驱动参数：

```python
drive_api.GetStiffnessAttr().Set(2000.0)
drive_api.GetDampingAttr().Set(200.0)
drive_api.GetMaxForceAttr().Set(500.0)
```

---

## 获取夹爪位置

Piper 的夹爪位置通过 link7 和 link8 中点计算（而非 link6），更准确反映实际指尖位置：

```python
def get_gripper_position(self) -> np.ndarray:
    """返回 link7 与 link8 中点的世界坐标"""
    p7 = get_object_xform_position(link7)
    p8 = get_object_xform_position(link8)
    return (np.array(p7) + np.array(p8)) / 2.0
```

---

## 技能默认参数覆盖

Piper 是唯一使用特殊末端朝向的机械臂（因为 wrist 方向不同）：

```python
ROBOT_SKILL_OVERRIDES = {
    "piper": {
        "pick": {
            "end_effector_euler": [90, 0, 0],  # Piper 特殊朝向
            "events_dt": [0.003, 0.003, 0.008, 0.04, 0.08, 0.01, 0.02],
        },
        "place": {"end_effector_euler": [90, 0, 0]},
        "pour": {"end_effector_euler": [90, 0, 0]},
        "shake": {"end_effector_euler": [90, 0, 0]},
    }
}
```

**注意**：`stir` 使用全局默认 `[0, 90, -10]`，不强制覆盖。

---

## PD 增益配置

initialize 时设置各关节 PD 增益：

- 机械臂关节（0-5）：kp = 5e4，kd = 5e3
- 夹爪关节（6-7）：kp = 2000.0，kd = 200.0

---

## 工作流配置示例

```yaml
robot:
  type: "piper"
  position: [0, 0, 0.71]

# Piper 的 skill 参数会被自动覆盖
steps:
  - skill: "pick"
    target_object: "beaker"
    # 自动使用 [90, 0, 0] 末端朝向
```

---

## 运行命令

```bash
# 使用 Piper 运行 pick 原子技能
python main.py --config-name atomic_skills/piper/pick
```

---

## 关键文件索引

<div style="text-align: center; margin: 1.5em 0;" markdown="1">

| 用途 | 文件路径 |
| --- | --- |
| 机械臂实现 | robots/piper/piper.py |
| RMPFlow 控制器 | robots/piper/rmpflow_controller.py |
| URDF 描述 | robots/piper/piper.urdf |
| 本地 USD | robots/piper/piper_v2_noscale.usd |
| Lula 配置 | robots/piper/lula/piper_robot_description.yaml |
| RMPFlow 配置 | robots/piper/lula/piper_rmpflow_config.yaml |

</div>