---
title: Piper
---

# Piper

## 概览

Piper 是来自 AgileX 的 6 自由度感知型机械臂，内置平行指夹爪。使用本地 USD 资源。

---

## 技术规格

| 属性 | 值 |
| --- | --- |
| 自由度 | 6 |
| 负载 | 3 kg |
| 夹爪 | Prismatic |
| 资源 | 本地 USD |

---

## 机械臂类

文件：robots/piper/piper.py

```python
from robots.piper.piper import Piper

robot = Piper(
    prim_path="/World/Piper",
    name="piper",
    physics_sim_view=physics_view,
)
```

---

## 配置

```yaml
robot:
  type: "piper"
  position: [0, 0, 0.71]
  press_z_tcp_offset: 0.025
```

---

## 默认 HOME 姿态

```python
default_q = [0.0, -0.785, 0.0, -1.571, 0.0, 0.0]
```

---

## 夹爪配置

```python
GRIPPER_TYPE = "prismatic"
GRIPPER_DOF_INDICES = [6]
GRIPPER_OPEN = [0.04]       # 米
GRIPPER_CLOSED = [0.0]
GRIPPER_MAX_WIDTH = 0.08
```

---

## 使用方法

```bash
python main.py --config-name atomic_skills/piper/pick
```

---

## 关键文件

| 用途 | 文件 |
| --- | --- |
| 机械臂类 | robots/piper/piper.py |
| RMPFlow 控制器 | robots/piper/rmpflow_controller.py |
| URDF | robots/piper/piper.urdf |
| 本地 USD | robots/piper/piper_v2_noscale.usd |
| Lula 配置 | robots/piper/robot_description.yaml |
