---
title: 机械臂
---

# 机械臂

## 概览

RoboGenesis 支持7 个机械臂平台，来自不同的制造商。每个机械臂都实现为 Python 类，并支持 RMPFlow 运动规划。

---

## 支持的平台

| 机械臂 | 夹爪 | 资产来源 | DOF | 制造商 |
| --- | --- | --- | --- | --- |
| Franka | 棱柱形 | Isaac Sim CDN | 7 | Franka Robotics |
| FR3 | 棱柱形 | Isaac Sim CDN | 7 | Franka Robotics |
| UR5e | Robotiq 2F-85 | Isaac Sim CDN | 6 | Universal Robots |
| UR16e | Robotiq 2F-85 | Isaac Sim CDN | 6 | Universal Robots |
| Festo | Robotiq 2F-85 | Isaac Sim CDN | 6 | Festo |
| Piper | 棱柱形 | Isaac Sim CDN | 6 | AgileX |
| Rizon4 | Robotiq 2F-85 | Isaac Sim CDN | 7 | Flexiv |

---

## 夹爪类型

### 棱柱形 (Prismatic)

- **机械臂：** Franka、FR3、Piper
- **描述：** 线性运动，内置平行指夹爪
- **配置：** 关节位置限制用于开合

### 旋转式 (Robotiq 2F-85)

- **机械臂：** UR5e、UR16e、Rizon4、Festo
- **描述：** 1 自由度，带 5 个仿生关节用于四连杆机构
- **配置：** 在 ParallelGripper 中设置 use_mimic_joints=True

---

## 快速参考

### 机械臂类型字符串

```yaml
robot:
  type: "franka"   # 或 "fr3", "ur5e", "ur16e", "festo", "piper", "rizon4"
```

### 各机械臂配置

| 机械臂 | 描述 |
| --- | --- |
| Franka | 7 DOF 棱柱形夹爪 |
| FR3 | 7 DOF 棱柱形夹爪 |
| UR5e | 6 DOF Robotiq 2F-85 |
| UR16e | 6 DOF Robotiq 2F-85 |
| Festo | 6 DOF Robotiq 2F-85 |
| Piper | 6 DOF 棱柱形夹爪 |
| Rizon4 | 7 DOF Robotiq 2F-85 |

### 默认位置

```yaml
# Franka
robot.position: [-0.4, -0, 0.71]

# Rizon4 / UR5e
robot.position: [0, 0, 0.71]

# UR16e
robot.position: [-0.5, 0, 0.71]
```

---

## 添加新机械臂

有关详细教程，请参阅[添加新机械臂](./adding-new-robot.md)。

---

## 关键文件

| 用途 | 文件 |
| --- | --- |
| 基础类 | robots/base/generic_arm.py |
| 基础工具 | robots/base/__init__.py |
| 机械臂注册表 | controllers/robot_configs/registry.py |
| 机械臂工厂 | factories/robot_factory.py |
| Franka | robots/franka/franka.py |
| FR3 | robots/fr3/fr3.py |
| UR5e | robots/ur5e/ur5e.py |
| UR16e | robots/ur16e/ur16e_arm.py |
| Festo | robots/festo/festo_arm.py |
| Piper | robots/piper/piper.py |
| Rizon4 | robots/rizon4/rizon4_arm.py |
