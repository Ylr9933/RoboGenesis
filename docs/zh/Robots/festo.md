---
title: Festo
---

# Festo

## 概述

Festo（FestoCobot）是来自德国 Festo 公司的 6 自由度协作机械臂，配备 Robotiq 2F-85 自适应并行夹爪。Festo 以其精确的工艺和优秀的运动控制性能著称，在工业自动化领域有广泛应用。

Festo 与 UR5e/UR16e 结构类似（6-DOF + Robotiq 2F-85），夹爪同样挂载在末端法兰（flange）上。不同之处在于 Festo 的 USD 来自 Omniverse CDN，且夹爪挂载路径使用 `flange` 而非 `wrist_3_link`。

---

## 技术规格

<div style="text-align: center; margin: 1.5em 0;" markdown="1">

| 属性 | 值 |
| --- | --- |
| 自由度 | 6（机械臂）+ 1（夹爪主控）+ 5（夹爪从动）= 12 DOF |
| 额定负载 | 5 kg |
| 关节 1-6 | a1、a2、a3、a4、a5、a6 |
| 夹爪类型 | Robotiq 2F-85（Revolute，自适应） |
| 夹爪主控关节 | finger_joint（index 6） |
| 夹爪最大开度 | 0.085 m（85mm） |
| 夹爪闭合角度 | 0.8 rad |
| 末端执行器 | tool_center（flange + Z 0.15m） |
| USD 来源 | Omniverse CDN |

</div>

---

## 机械臂类

文件：`robots/festo/festo_arm.py`

```python
from robots.festo.festo_arm import FestoCobot

robot = FestoCobot(
    prim_path="/World/FestoCobot",
    name="festo",
    position=[0, 0, 0.71],
)
```

---

## 夹爪配置

Festo 使用与 UR5e/UR16e 完全相同的 Robotiq 2F-85 配置：

<div style="text-align: center; margin: 1.5em 0;" markdown="1">

| 参数 | 值 | 说明 |
| --- | --- | --- |
| GRIPPER_DOF_INDICES | [6] | finger_joint（主控关节） |
| GRIPPER_OPEN | [0.0] | 完全张开（弧度） |
| GRIPPER_CLOSED | [0.8] | 完全闭合（弧度） |
| GRIPPER_TYPE | "revolute" | revolute 类型（角度控制） |
| GRIPPER_MAX_WIDTH | 0.085 | 最大开度 85mm |
| GRIPPER_MAX_ANGLE | 0.8 | 最大角度 0.8 rad |
| use_mimic_joints | True | 使用 mimic 关节联动 |

</div>

---

## Robotiq 2F-85 适配器

夹爪通过 `attach_robotiq_2f85` 安装到 flange：

```python
attach_robotiq_2f85(stage, prim_path, f"{prim_path}/flange")
```

末端执行器路径：

```python
end_effector_prim_path = prim_path + "/Robotiq2F85/Robotiq_2F_85/base_link"
```

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

- 机械臂关节（0-5）：kp = 5e4，kd = 5e3
- finger_joint（index 6）：kp = 1000.0，kd = 100.0
- 从动关节（index 7-11）：kp = 0，kd = 0（由物理约束驱动）

---

## 技能默认参数

Festo 使用与 UR5e/UR16e/Rizon4 相同的末端朝向覆盖：

```python
ROBOT_SKILL_OVERRIDES = {
    "festo": {
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
/Isaac/Robots/Festo/FestoCobot/festo_cobot.usd
```

Robotiq 2F-85 在运行时通过 `attach_robotiq_2f85` 动态加载。

---

## 工作流配置示例

```yaml
robot:
  type: "festo"
  position: [0, 0, 0.71]
  press_z_tcp_offset: 0.025
```

---

## 运行命令

```bash
# 使用 Festo 运行 pick 原子技能
python main.py --config-name atomic_skills/festo/pick
```

---

## 关键文件索引

<div style="text-align: center; margin: 1.5em 0;" markdown="1">

| 用途 | 文件路径 |
| --- | --- |
| 机械臂实现 | robots/festo/festo_arm.py |
| RMPFlow 控制器 | robots/festo/rmpflow_controller.py |
| URDF 描述 | robots/festo/festo_cobot.urdf |
| Robotiq 适配器 | robots/base/__init__.py（attach_robotiq_2f85） |

</div>