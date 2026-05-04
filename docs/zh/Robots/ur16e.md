---
title: UR16e
---

# UR16e

## 概述

UR16e 是来自 Universal Robots 的 6 自由度工业协作机械臂，是 UR5e 的"大负载"版本。相较于 UR5e 的 5kg 额定负载，UR16e 提供 16kg 的额定负载能力，同时工作半径达到 900mm，非常适合需要大负载或更长臂展的工业操作任务。

UR16e 与 UR5e 结构完全一致（同一平台系列），本项目同样采用 Robotiq 2F-85 自适应夹爪，通过 `attach_robotiq_2f85` 适配器安装。

---

## 技术规格

<div style="text-align: center; margin: 1.5em 0;" markdown="1">

| 属性 | 值 |
| --- | --- |
| 自由度 | 6（机械臂）+ 1（夹爪主控）+ 5（夹爪从动）= 12 DOF |
| 额定负载 | 16 kg |
| 工作半径 | 900 mm |
| 关节 1-6 | shoulder_pan、shoulder_lift、elbow、wrist_1、wrist_2、wrist_3 |
| 夹爪类型 | Robotiq 2F-85（Revolute，自适应） |
| 夹爪主控关节 | finger_joint（index 6） |
| 夹爪最大开度 | 0.085 m（85mm） |
| 夹爪闭合角度 | 0.8 rad |
| 末端执行器 | tool_center（wrist_3_link + Z 0.15m） |

</div>

---

## 机械臂类

文件：`robots/ur16e/ur16e_arm.py`

```python
from robots.ur16e.ur16e_arm import UR16eArm

robot = UR16eArm(
    prim_path="/World/UR16e",
    name="ur16e",
    position=[-0.5, 0, 0.71],
)
```

---

## 默认 HOME 姿态

UR16e 官方默认姿态与 UR5e 类似（但关节角度略有不同），使用弯曲肘部避免贴桌面：

```python
_DEFAULT_ARM_Q = [0.0, -2.8, 2.2, -1.5, 1.57, 0.0]
```

与 UR5e 的区别在于：

- shoulder_lift 官方默认 -1.2 rad（大臂抬高约 69°）
- elbow 官方默认 1.1 rad（肘部弯曲约 63°）

通过调整后的默认姿态使肘部垂直朝上、手腕下垂，末端执行器朝向下方。

---

## 夹爪配置

UR16e 使用与 UR5e 完全相同的 Robotiq 2F-85 配置：

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

---

## Robotiq 2F-85 适配器

夹爪通过 `attach_robotiq_2f85` 安装到 wrist_3_link：

```python
attach_robotiq_2f85(stage, prim_path, f"{prim_path}/wrist_3_link")
```

共享 `robots/base/__init__.py` 中的实现，与 UR5e/Festo/Rizon4 完全一致。

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

initialize 时设置各关节 PD 增益（与 UR5e 完全一致）：

- 机械臂关节（0-5）：kp = 5e4，kd = 5e3
- finger_joint（index 6）：kp = 1000.0，kd = 100.0
- 从动关节（index 7-11）：kp = 0，kd = 0

---

## 技能默认参数

UR16e 使用与 UR5e/Festo/Rizon4 相同的末端朝向覆盖：

```python
ROBOT_SKILL_OVERRIDES = {
    "ur16e": {
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
/Isaac/Robots/UniversalRobots/ur16e/ur16e.usd
```

Robotiq 2F-85 在运行时通过 `attach_robotiq_2f85` 动态加载。

---

## 工作流配置示例

```yaml
robot:
  type: "ur16e"
  position: [-0.5, 0, 0.71]
  press_z_tcp_offset: 0.025
```

---

## 运行命令

```bash
# 使用 UR16e 运行 pick 原子技能
python main.py --config-name atomic_skills/ur16e/pick
```

---

## 关键文件索引

<div style="text-align: center; margin: 1.5em 0;" markdown="1">

| 用途 | 文件路径 |
| --- | --- |
| 机械臂实现 | robots/ur16e/ur16e_arm.py |
| RMPFlow 控制器 | robots/ur16e/rmpflow_controller.py |
| URDF 描述 | robots/ur16e/ur16e.urdf |
| Robotiq 适配器 | robots/base/__init__.py（attach_robotiq_2f85） |

</div>
