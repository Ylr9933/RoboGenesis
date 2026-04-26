---
title: UR5e
---

# UR5e

## 概览

UR5e 是来自 Universal Robots 的 6 自由度工业协作机械臂，配备 Robotiq 2F-85 自适应夹爪。

---

## 技术规格

| 属性 | 值 |
| --- | --- |
| 自由度 | 6 |
| 负载 | 5 kg |
| 工作半径 | 850 mm |
| 夹爪 | Robotiq 2F-85 |
| 重复精度 | ±0.03 mm |

---

## 机械臂类

文件：robots/ur5e/ur5e.py

```python
from robots.ur5e.ur5e import UR5e

robot = UR5e(
    prim_path="/World/UR5e",
    name="ur5e",
    physics_sim_view=physics_view,
)
```

---

## 配置

```yaml
robot:
  type: "ur5e"
  position: [-0.5, 0, 0.71]
  press_z_tcp_offset: 0.025
```

---

## 默认 HOME 姿态

```python
default_q = [0.0, -1.571, 0.0, -1.571, 0.0, 0.0]  # 6 个关节
```

---

## 夹爪配置

```python
GRIPPER_TYPE = "revolute"
GRIPPER_DOF_INDICES = [6]
GRIPPER_OPEN = [0.0]        # 弧度
GRIPPER_CLOSED = [0.8]      # 弧度
GRIPPER_MAX_WIDTH = 0.085   # 米
```

---

## 使用方法

```bash
python main.py --config-name atomic_skills/ur5e/pick
```

---

## 关键文件

| 用途 | 文件 |
| --- | --- |
| 机械臂类 | robots/ur5e/ur5e.py |
| RMPFlow 控制器 | robots/ur5e/rmpflow_controller.py |
| URDF | robots/ur5e/ur5e_robotiq85.urdf |
| Robotiq 夹爪 | robots/base/__init__.py |
| 组合 USD | robots/ur5e/combined.usd |
