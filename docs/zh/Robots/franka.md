---
title: Franka Panda
---

# Franka Panda

## 概览

Franka Panda 是 RoboGenesis 中的默认研究级机械臂。它是一款具有内置平行指夹爪的 7 自由度协作机械臂。

---

## 技术规格

| 属性 | 值 |
| --- | --- |
| 自由度 | 7 |
| 负载 | 2.6 kg |
| 工作半径 | 850 mm |
| 夹爪类型 | Prismatic |
| 夹爪行程 | 0-0.08 m |
| 位置重复精度 | ±0.1 mm |

---

## 机械臂类

文件：robots/franka/franka.py

```python
from robots.franka.franka import Franka

robot = Franka(
    prim_path="/World/Franka",
    name="franka",
    physics_sim_view=physics_view,
)
```

---

## 配置

```yaml
robot:
  type: "franka"
  position: [-0.4, -0, 0.71]
  press_z_tcp_offset: 0.031
```

---

## RMPFlow 配置

文件：

- robots/franka/rmpflow/franka_rmpflow_config.yaml
- robots/franka/rmpflow/robot_description.yaml

### 关节限制

```yaml
joint_limits:
  position_lower: [-2.8973, -2.6180, -2.8973, -2.8973, -2.8973, -3.8223, -2.8973]
  position_upper: [2.8973, 2.6180, 2.8973, 2.8973, 2.8973, 0.0873, 2.8973]
```

---

## 默认 HOME 姿态

```python
default_q = [0.0, -0.785, 0.0, -2.356, 0.0, 1.571, 0.785]  # 7 个关节
```

---

## 夹爪配置

```python
GRIPPER_DOF_INDICES = [7, 8]      # 夹爪关节
GRIPPER_OPEN = [0.04, 0.04]       # 张开位置（米）
GRIPPER_CLOSED = [0.0, 0.0]       # 闭合位置
GRIPPER_MAX_WIDTH = 0.08          # 最大开度
```

---

## 使用方法

### 使用默认配置运行

```bash
python main.py --config-name atomic_skills/pick
```

### 使用 Franka 运行

```bash
python main.py --config-name atomic_skills/franka/pick
```

---

## 关键文件

| 用途 | 文件 |
| --- | --- |
| 机械臂类 | robots/franka/franka.py |
| RMPFlow 控制器 | robots/franka/rmpflow_controller.py |
| URDF | robots/franka/lula_franka_gen.urdf |
| RMPFlow 配置 | robots/franka/rmpflow/ |
| 机械臂描述 | robots/franka/rmpflow/robot_description.yaml |
