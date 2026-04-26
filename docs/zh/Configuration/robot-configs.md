---
title: 机器人配置参考
---

# 机器人配置参考

## 概览

本文档介绍存储各机器人配置参数的 ROBOT_CONFIGS 注册表。

---

## ROBOT_CONFIGS

文件：controllers/robot_configs/registry.py

```python
ROBOT_CONFIGS = {
    "franka": {...},
    "fr3": {...},
    "ur5e": {...},
    "ur16e": {...},
    "festo": {...},
    "piper": {...},
    "rizon4": {...},
}
```

---

## 各机器人参数

### franka

```python
"franka": {
    "arm_dof": 7,
    "gripper_dof_indices": [7, 8],
    "gripper_type": "prismatic",
    "gripper_max_width": 0.08,
    "gripper_open_positions": [0.04, 0.04],
    "gripper_closed_positions": [0.0, 0.0],
    "lula_description_path": "franka/rmpflow/robot_description.yaml",
    "lula_urdf_path": "franka/lula_franka_gen.urdf",
    "press_z_tcp_offset": 0.031,
    "default_q": [0.0, -0.785, 0.0, -2.356, 0.0, 1.571, 0.785],
},
```

### fr3

```python
"fr3": {
    "arm_dof": 7,
    "gripper_dof_indices": [7, 8],
    "gripper_type": "prismatic",
    "gripper_max_width": 0.08,
    "gripper_open_positions": [0.04, 0.04],
    "gripper_closed_positions": [0.0, 0.0],
    "lula_description_path": "fr3/robot_description.yaml",
    "lula_urdf_path": "fr3/fr3.urdf",
    "press_z_tcp_offset": 0.031,
    "default_q": [0.0, -0.785, 0.0, -2.356, 0.0, 1.571, 0.785],
},
```

### ur5e

```python
"ur5e": {
    "arm_dof": 6,
    "gripper_dof_indices": [6],
    "gripper_type": "revolute",
    "gripper_max_width": 0.085,
    "gripper_open_positions": [0.0],
    "gripper_closed_positions": [0.8],
    "lula_description_path": "ur5e/robot_description.yaml",
    "lula_urdf_path": "ur5e/ur5e_robotiq85.urdf",
    "press_z_tcp_offset": 0.025,
    "default_q": [0.0, -1.571, 0.0, -1.571, 0.0, 0.0],
    "use_mimic_joints": True,
},
```

### ur16e

```python
"ur16e": {
    "arm_dof": 6,
    "gripper_dof_indices": [6],
    "gripper_type": "revolute",
    "gripper_max_width": 0.085,
    "gripper_open_positions": [0.0],
    "gripper_closed_positions": [0.8],
    "lula_description_path": "ur16e/robot_description.yaml",
    "lula_urdf_path": "ur16e/ur16e.urdf",
    "press_z_tcp_offset": 0.025,
    "default_q": [0.0, -1.571, 0.0, -1.571, 0.0, 0.0],
    "use_mimic_joints": True,
},
```

### festo

```python
"festo": {
    "arm_dof": 6,
    "gripper_dof_indices": [6],
    "gripper_type": "revolute",
    "gripper_max_width": 0.085,
    "gripper_open_positions": [0.0],
    "gripper_closed_positions": [0.8],
    "lula_description_path": "festo/robot_description.yaml",
    "lula_urdf_path": "festo/festo.urdf",
    "press_z_tcp_offset": 0.025,
    "default_q": [0.0, -1.571, 0.0, -1.571, 0.0, 0.0],
    "use_mimic_joints": True,
},
```

### piper

```python
"piper": {
    "arm_dof": 6,
    "gripper_dof_indices": [6],
    "gripper_type": "prismatic",
    "gripper_max_width": 0.08,
    "gripper_open_positions": [0.04],
    "gripper_closed_positions": [0.0],
    "lula_description_path": "piper/robot_description.yaml",
    "lula_urdf_path": "piper/piper.urdf",
    "press_z_tcp_offset": 0.025,
    "default_q": [0.0, -0.785, 0.0, -1.571, 0.0, 0.0],
    "usd_path": "robots/piper/piper_v2_noscale.usd",
},
```

### rizon4

```python
"rizon4": {
    "arm_dof": 7,
    "gripper_dof_indices": [7],
    "gripper_type": "revolute",
    "gripper_max_width": 0.085,
    "gripper_open_positions": [0.0],
    "gripper_closed_positions": [0.8],
    "lula_description_path": "rizon4/robot_description.yaml",
    "lula_urdf_path": "rizon4/rizon4.urdf",
    "press_z_tcp_offset": 0.025,
    "default_q": [0.0, -0.785, 0.0, -2.356, 0.0, 1.571, 0.785],
    "use_mimic_joints": True,
    "bent_elbow_q": [0.0, -0.5, 1.57, -2.0, 0.0, 1.0, 0.785],
},
```

---

## 参数参考

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| arm_dof | int | 机械臂关节数 |
| gripper_dof_indices | List[int] | 夹爪关节索引 |
| gripper_type | str | "prismatic"（平移）或 "revolute"（旋转） |
| gripper_max_width | float | 夹爪最大开距 |
| gripper_open_positions | List[float] | 夹爪张开时的关节位置 |
| gripper_closed_positions | List[float] | 夹爪闭合时的关节位置 |
| lula_description_path | str | 机器人描述 YAML 文件路径 |
| lula_urdf_path | str | URDF 文件路径 |
| press_z_tcp_offset | float | 按压 Z 技能的工具中心点偏移 |
| default_q | List[float] | 默认关节角度 |
| use_mimic_joints | bool | 是否使用 Robotiq 夹爪的仿生关节 |
| bent_elbow_q | List[float] | 弯曲肘部姿态 |

---

## 添加新机械臂

在 ROBOT_CONFIGS 中添加条目：

```python
"my_robot": {
    "arm_dof": 6,
    "gripper_type": "revolute",
    # ...
},
```

在 factories/robot_factory.py 中注册：

```python
"my_robot": ("robots.my_robot.my_robot", "MyRobot"),
```

---

## 关键文件

| 文件 | 描述 |
| --- | --- |
| controllers/robot_configs/registry.py | 机器人配置注册表 |
| factories/robot_factory.py | 机器人工厂 |
| robots/base/generic_arm.py | 通用机械臂基类 |
