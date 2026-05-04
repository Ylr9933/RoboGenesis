---
title: UR5e
---

# UR5e

## 概述

UR5e 是来自 Universal Robots 的 6 自由度协作机械臂，配备 Robotiq 2F-85 自适应并行夹爪。UR5e 以紧凑的体积、灵活的关节配置和成熟的生态系统著称，广泛应用于中小型工业和实验室场景。

UR5e 与 UR16e 结构相似（同一系列），主要区别在于负载能力和工作半径。本项目采用 Robotiq 2F-85 替代 UR 官方夹爪，通过 `attach_robotiq_2f85` 适配器安装到 `wrist_3_link`。

---

## 技术规格

<div style="text-align: center; margin: 1.5em 0;" markdown="1">

| 属性 | 值 |
| --- | --- |
| 自由度 | 6（机械臂）+ 1（夹爪主控）+ 5（夹爪从动）= 12 DOF |
| 额定负载 | 5 kg |
| 工作半径 | 850 mm |
| 关节 1-6 | shoulder_pan、shoulder_lift、elbow、wrist_1、wrist_2、wrist_3 |
| 夹爪类型 | Robotiq 2F-85（Revolute，自适应） |
| 夹爪主控关节 | finger_joint（index 6） |
| 夹爪最大开度 | 0.085 m（85mm） |
| 夹爪闭合角度 | 0.8 rad |
| 末端执行器 | tool_center（wrist_3_link + Z 0.15m） |

</div>

---

## 机械臂类

文件：`robots/ur5e/ur5e.py`

```python
from robots.ur5e.ur5e import UR5e

robot = UR5e(
    prim_path="/World/UR5e",
    name="ur5e",
    position=[-0.5, 0, 0.71],
)
```

---

## 默认 HOME 姿态

UR5e 使用弯曲肘部姿态，避免初始状态贴桌面：

```python
_DEFAULT_ARM_Q = [0.0, -2.8, 2.2, -1.5, 1.57, 0.0]
```

各关节含义（弧度）：

- shoulder_pan = 0.0（肩部旋转）
- shoulder_lift = -2.8（大臂抬高约 160°）
- elbow = 2.2（肘部弯曲约 126°）
- wrist_1 = -1.5（手腕弯曲约 86°）
- wrist_2 = 1.57（手腕外旋约 90°）
- wrist_3 = 0.0（手腕最终旋转）

此姿态使肘部朝上、手腕下垂，末端执行器朝向下方，便于抓取桌面物体。

---

## 夹爪配置

Robotiq 2F-85 是自适应夹爪，采用四连杆机构实现双指同步运动：

<div style="text-align: center; margin: 1.5em 0;" markdown="1">

| 参数 | 值 | 说明 |
| --- | --- | --- |
| GRIPPER_DOF_INDICES | [6] | finger_joint（主控关节） |
| GRIPPER_OPEN | [0.0] | 完全张开（弧度） |
| GRIPPER_CLOSED | [0.8] | 完全闭合（弧度） |
| GRIPPER_TYPE | "revolute" |  revolute 类型（角度控制） |
| GRIPPER_MAX_WIDTH | 0.085 | 最大开度 85mm |
| GRIPPER_MAX_ANGLE | 0.8 | 最大角度 0.8 rad |
| use_mimic_joints | True | 使用 mimic 关节联动 |

</div>

### Mimic 关节机制

Robotiq 2F-85 的 5 个从动关节（index 7-11）通过物理约束跟随 finger_joint 运动：

```python
# 设置非主控关节的 PD 增益为 0，让物理约束自然传递
for idx in range(self.ARM_DOF + 1, n):
    kps[idx] = 0.0
    kds[idx] = 0.0
```

---

## Robotiq 2F-85 适配器

夹爪通过 `attach_robotiq_2f85` 安装到 wrist_3_link：

```python
attach_robotiq_2f85(stage, prim_path, f"{prim_path}/wrist_3_link")
```

该函数在 `robots/base/__init__.py` 中定义，执行以下操作：
1. 加载 Robotiq 2F-85 USD 到指定路径
2. 建立 finger_joint 的 mimic 关系
3. 绑定物理材质

---

## 获取夹爪位置

```python
_TCP_LOCAL_OFFSET = Gf.Vec3d(0.0, 0.0, 0.15)

def get_gripper_position(self) -> np.ndarray:
    """通过 wrist_3_link 世界变换 × TCP 偏移计算 tool_center"""
    prim = get_prim_at_path(self.prim_path_str + "/wrist_3_link")
    xf = UsdGeom.Xformable(prim)
    world_mat = xf.ComputeLocalToWorldTransform(Usd.TimeCode.Default())
    tcp_world = world_mat.Transform(self._TCP_LOCAL_OFFSET)
    return np.array([tcp_world[0], tcp_world[1], tcp_world[2]])
```

---

## PD 增益配置

initialize 时设置各关节 PD 增益：

- 机械臂关节（0-5）：kp = 5e4，kd = 5e3
- finger_joint（index 6）：kp = 1000.0，kd = 100.0
- 从动关节（index 7-11）：kp = 0，kd = 0（由物理约束驱动）

---

## 技能默认参数

UR5e 使用与 UR16e/Festo/Rizon4 相同的末端朝向覆盖：

```python
ROBOT_SKILL_OVERRIDES = {
    "ur5e": {
        "pick":  {"end_effector_euler": [0, 90, 30]},
        "place": {"end_effector_euler": [0, 90, 30]},
        "pour":  {"end_effector_euler": [0, 90, 30]},
        "shake": {"end_effector_euler": [0, 90, 30]},
    }
}
```

---

## USD 资产

使用 Omniverse CDN 资产：

```
/Isaac/Robots/UniversalRobots/ur5e/ur5e.usd
```

Robotiq 2F-85 在运行时通过 `attach_robotiq_2f85` 动态加载。

---

## 工作流配置示例

```yaml
robot:
  type: "ur5e"
  position: [-0.5, 0, 0.71]
  press_z_tcp_offset: 0.025
```

---

## 运行命令

```bash
# 使用 UR5e 运行 pick 原子技能
python main.py --config-name atomic_skills/ur5e/pick

# 使用 UR5e 运行工作流
python main.py --config-name workflows/workflow_pick_pour_ur5e
```

---

## 关键文件索引

<div style="text-align: center; margin: 1.5em 0;" markdown="1">

| 用途 | 文件路径 |
| --- | --- |
| 机械臂实现 | robots/ur5e/ur5e.py |
| RMPFlow 控制器 | robots/ur5e/rmpflow_controller.py |
| URDF 描述 | robots/ur5e/ur5e_robotiq85.urdf |
| Robotiq 适配器 | robots/base/__init__.py（attach_robotiq_2f85） |

</div>
