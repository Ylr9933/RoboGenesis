---
title: FR3 (Franka Research 3)
---

# FR3 (Franka Research 3)

## 概览

FR3 (Franka Research 3) 是一款 7 自由度研究级协作机械臂，内置平行指夹爪。与 Panda 类似，但硬件有所更新。

---

## 技术规格

| 属性 | 值 |
| --- | --- |
| 自由度 | 7 |
| 负载 | 2.6 kg |
| 工作半径 | 850 mm |
| 夹爪类型 | Prismatic |
| 接口 | ROS / Franka Control Interface |

---

## 机械臂类

文件：robots/fr3/fr3.py

```python
from robots.fr3.fr3 import FR3

robot = FR3(
    prim_path="/World/FR3",
    name="fr3",
    physics_sim_view=physics_view,
)
```

---

## 配置

```yaml
robot:
  type: "fr3"
  position: [0, 0, 0.71]
  press_z_tcp_offset: 0.031
```

---

## 默认 HOME 姿态

```python
default_q = [0.0, -0.785, 0.0, -2.356, 0.0, 1.571, 0.785]
```

---

## 夹爪配置

```python
GRIPPER_DOF_INDICES = [7, 8]
GRIPPER_OPEN = [0.04, 0.04]
GRIPPER_CLOSED = [0.0, 0.0]
GRIPPER_MAX_WIDTH = 0.08
```

---

## 使用方法

```bash
python main.py --config-name atomic_skills/fr3/pick
```

---

## 关键文件

| 用途 | 文件 |
| --- | --- |
| 机械臂类 | robots/fr3/fr3.py |
| RMPFlow 控制器 | robots/fr3/rmpflow_controller.py |
| URDF | robots/fr3/fr3.urdf |
| RMPFlow 配置 | robots/fr3/robot_description.yaml |
