---
title: UR16e
---

# UR16e

## 概览

UR16e 是来自 Universal Robots 的 6 自由度工业协作机械臂，具有更高负载（16kg）和 Robotiq 2F-85 夹爪。

---

## 技术规格

| 属性 | 值 |
| --- | --- |
| 自由度 | 6 |
| 负载 | 16 kg |
| 工作半径 | 900 mm |
| 夹爪 | Robotiq 2F-85 |

---

## 机械臂类

文件：robots/ur16e/ur16e_arm.py

```python
from robots.ur16e.ur16e_arm import UR16eArm

robot = UR16eArm(
    prim_path="/World/UR16e",
    name="ur16e",
    physics_sim_view=physics_view,
)
```

---

## 配置

```yaml
robot:
  type: "ur16e"
  position: [-0.5, 0, 0.71]
  press_z_tcp_offset: 0.025
```

---

## 默认 HOME 姿态

```python
default_q = [0.0, -1.571, 0.0, -1.571, 0.0, 0.0]
```

---

## 夹爪配置

与 UR5e 相同（Robotiq 2F-85）：

```python
GRIPPER_TYPE = "revolute"
GRIPPER_DOF_INDICES = [6]
GRIPPER_OPEN = [0.0]
GRIPPER_CLOSED = [0.8]
GRIPPER_MAX_WIDTH = 0.085
```

---

## 使用方法

```bash
python main.py --config-name atomic_skills/ur16e/pick
```

---

## 关键文件

| 用途 | 文件 |
| --- | --- |
| 机械臂类 | robots/ur16e/ur16e_arm.py |
| RMPFlow 控制器 | robots/ur16e/rmpflow_controller.py |
| URDF | robots/ur16e/ur16e.urdf |
