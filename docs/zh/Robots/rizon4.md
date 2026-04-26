---
title: Rizon4
---

# Rizon4

## 概览

Rizon4 是来自 Flexiv 的 7 自由度协作机械臂，配备 Robotiq 2F-85 夹爪。以精度和平滑度著称。

---

## 技术规格

| 属性 | 值 |
| --- | --- |
| 自由度 | 7 |
| 负载 | 10 kg |
| 工作半径 | 1000 mm |
| 夹爪 | Robotiq 2F-85 |

---

## 机械臂类

文件：robots/rizon4/rizon4_arm.py

```python
from robots.rizon4.rizon4_arm import Rizon4Arm

robot = Rizon4Arm(
    prim_path="/World/Rizon4",
    name="rizon4",
    physics_sim_view=physics_view,
)
```

---

## 配置

```yaml
robot:
  type: "rizon4"
  position: [0, 0, 0.71]
  press_z_tcp_offset: 0.025
```

---

## 默认 HOME 姿态

```python
default_q = [0.0, -0.785, 0.0, -2.356, 0.0, 1.571, 0.785]
```

---

## 夹爪配置

```python
GRIPPER_TYPE = "revolute"
GRIPPER_DOF_INDICES = [7]
GRIPPER_OPEN = [0.0]        # 弧度
GRIPPER_CLOSED = [0.8]      # 弧度
GRIPPER_MAX_WIDTH = 0.085   # 米
```

---

## 弯曲肘部 HOME 姿态

为提高第 0 步的稳定性：

```python
# Rizon4 的替代家庭姿态
bent_elbow_q = [0.0, -0.5, 1.57, -2.0, 0.0, 1.0, 0.785]
```

---

## 使用方法

```bash
# 使用 Rizon4 运行 pick
python main.py --config-name atomic_skills/rizon4/pick

# 使用 Rizon4 运行 pick+pour 工作流
python main.py --config-name workflows/workflow_pick_pour_rizon4
```

---

## 关键文件

| 用途 | 文件 |
| --- | --- |
| 机械臂类 | robots/rizon4/rizon4_arm.py |
| RMPFlow 控制器 | robots/rizon4/rmpflow_controller.py |
| URDF | robots/rizon4/rizon4.urdf |
| RMPFlow 配置 | robots/rizon4/robot_description.yaml |
