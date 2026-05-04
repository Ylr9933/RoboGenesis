---
title: Rizon4
---

# Rizon4

## 概述

Rizon4 是来自 Flexiv 的 7 自由度协作机械臂，配备 Robotiq 2F-85 自适应并行夹爪。Rizon4 是本项目中唯一采用 7-DOF 的非 Franka 机械臂，额外的冗余自由度使其在复杂姿态和受限空间操作中具有更好的灵活性。

Rizon4 与 Franka FR3 同样拥有 7 个机械臂关节，但 Rizon4 额外配备了 Robotiq 2F-85 外部夹爪，而非 FR3 的内置夹爪。这使得 Rizon4 在保持冗余自由度的同时，拥有更大的末端负载能力。

---

## 技术规格

<div style="text-align: center; margin: 1.5em 0;" markdown="1">

| 属性 | 值 |
| --- | --- |
| 自由度 | 7（机械臂）+ 1（夹爪主控）+ 5（夹爪从动）= 13 DOF |
| 额定负载 | 10 kg |
| 工作半径 | 1000 mm |
| 关节 1-7 | 7 个旋转关节 |
| 夹爪类型 | Robotiq 2F-85（Revolute，自适应） |
| 夹爪主控关节 | finger_joint（index 7） |
| 夹爪最大开度 | 0.085 m（85mm） |
| 夹爪闭合角度 | 0.8 rad |
| 末端执行器 | tool_center（flange + Z 0.15m） |
| 末端执行器帧 | grip_center（Robotiq base_link 下的额外 Xform） |

</div>

---

## 机械臂类

文件：`robots/rizon4/rizon4_arm.py`

```python
from robots.rizon4.rizon4_arm import Rizon4Arm

robot = Rizon4Arm(
    prim_path="/World/Rizon4",
    name="rizon4",
    position=[0, 0, 0.71],
)
```

---

## 默认 HOME 姿态

Rizon4 提供了标准姿态和弯曲肘部替代姿态：

```python
# 标准默认姿态
default_q = [0.0, -0.785, 0.0, -2.356, 0.0, 1.571, 0.785]

# 弯曲肘部姿态（提高第 0 步稳定性）
bent_elbow_q = [0.0, -0.5, 1.57, -2.0, 0.0, 1.0, 0.785]
```

弯曲肘部姿态的特点：
- joint2 = -0.5（大臂略微抬高）
- joint3 = 1.57（小臂水平）
- joint4 = -2.0（肘部弯曲约 115°）
- joint6 = 1.0（手腕弯曲约 57°）

---

## 夹爪配置

Rizon4 使用与 UR5e/UR16e/Festo 相同的 Robotiq 2F-85 配置：

<div style="text-align: center; margin: 1.5em 0;" markdown="1">

| 参数 | 值 | 说明 |
| --- | --- | --- |
| GRIPPER_DOF_INDICES | [7] | finger_joint（主控关节） |
| GRIPPER_OPEN | [0.0] | 完全张开（弧度） |
| GRIPPER_CLOSED | [0.8] | 完全闭合（弧度） |
| GRIPPER_TYPE | "revolute" | revolute 类型（角度控制） |
| GRIPPER_MAX_WIDTH | 0.085 | 最大开度 85mm |
| GRIPPER_MAX_ANGLE | 0.8 | 最大角度 0.8 rad |
| use_mimic_joints | True | 使用 mimic 关节联动 |

</div>

---

## Rizon4 特有的 grip_center

Rizon4 的 Robotiq 2F-85 适配器在 `base_link` 下额外添加了 `grip_center` Xform，作为 skill_executor 的 virtual attach 目标：

```python
def _attach_robotiq_2f85_with_grip_center(stage, robot_prim_path, mount_link_path):
    """Rizon4 特有：在 Robotiq 2F-85 的 base_link 下加一个 grip_center Xform"""
    gripper_path = attach_robotiq_2f85(stage, robot_prim_path, mount_link_path)
    grip_center = stage.DefinePrim(
        f"{gripper_path}/Robotiq_2F_85/base_link/grip_center", "Xform"
    )
    # grip_center 偏移 (0, 0, 0.15)，与 TCP_OFFSET_LOCAL 一致
    UsdGeom.Xformable(grip_center).AddTranslateOp().Set(Gf.Vec3d(0, 0, 0.15))
```

这个 grip_center Xform 专门供 skill_executor 的 virtual attach 使用（见 `robot_configs/registry.py:70`）。

---

## 获取夹爪位置

```python
_TCP_LOCAL_OFFSET = Gf.Vec3d(0.0, 0.0, 0.15)

def get_gripper_position(self) -> np.ndarray:
    """通过 flange 世界变换 × TCP 偏移计算 tool_center"""
    prim = get_prim_at_path(self.prim_path_str + "/flange")
    xf = UsdGeom.Xformable(prim)
    world_mat = xf.ComputeLocalToWorldTransform(Usd.TimeCode.Default())
    tcp_world = world_mat.Transform(self._TCP_LOCAL_OFFSET)
    return np.array([tcp_world[0], tcp_world[1], tcp_world[2]])
```

---

## PD 增益配置

initialize 时设置各关节 PD 增益：

- 机械臂关节（0-6）：kp = 5e4，kd = 5e3
- finger_joint（index 7）：kp = 1000.0，kd = 100.0

```python
kps = np.full(n, 5e4)
kds = np.full(n, 5e3)
for idx in self.GRIPPER_DOF_INDICES:
    if idx < n:
        kps[idx] = 1000.0
        kds[idx] = 100.0
self.get_articulation_controller().set_gains(kps, kds)
```

---

## 技能默认参数

Rizon4 使用与 UR5e/UR16e/Festo 相同的末端朝向覆盖：

```python
ROBOT_SKILL_OVERRIDES = {
    "rizon4": {
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
/Isaac/Robots/Flexiv/Rizon4/flexiv_rizon4.usd
```

Robotiq 2F-85 在运行时通过 `_attach_robotiq_2f85_with_grip_center` 动态加载。

---

## 工作流配置示例

```yaml
robot:
  type: "rizon4"
  position: [0, 0, 0.71]
  press_z_tcp_offset: 0.025
```

---

## 运行命令

```bash
# 使用 Rizon4 运行 pick 原子技能
python main.py --config-name atomic_skills/rizon4/pick

# 使用 Rizon4 运行 pick+pour 工作流
python main.py --config-name workflows/workflow_pick_pour_rizon4
```

---

## 关键文件索引

<div style="text-align: center; margin: 1.5em 0;" markdown="1">

| 用途 | 文件路径 |
| --- | --- |
| 机械臂实现 | robots/rizon4/rizon4_arm.py |
| RMPFlow 控制器 | robots/rizon4/rmpflow_controller.py |
| URDF 描述 | robots/rizon4/flexiv_rizon4.urdf |
| RMPFlow 配置 | robots/rizon4/robot_description.yaml |
| Flexiv 配置 | robots/rizon4/flexiv_config/ |

</div>