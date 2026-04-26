---
title: Festo
---

# Festo

## 概览

Festo 是来自 Festo 的 6 自由度协作机械臂，配备 Robotiq 2F-85 夹爪。

---

## 技术规格

| 属性 | 值 |
| --- | --- |
| 自由度 | 6 |
| 负载 | 5 kg |
| 夹爪 | Robotiq 2F-85 |

---

## 机械臂类

文件：robots/festo/festo_arm.py

```python
from robots.festo.festo_arm import FestoArm

robot = FestoArm(
    prim_path="/World/Festo",
    name="festo",
    physics_sim_view=physics_view,
)
```

---

## 配置

```yaml
robot:
  type: "festo"
  position: [0, 0, 0.71]
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
python main.py --config-name atomic_skills/festo/pick
```

---

## 关键文件

| 用途 | 文件 |
| --- | --- |
| 机械臂类 | robots/festo/festo_arm.py |
| RMPFlow 控制器 | robots/festo/rmpflow_controller.py |
| URDF | robots/festo/festo.urdf |
