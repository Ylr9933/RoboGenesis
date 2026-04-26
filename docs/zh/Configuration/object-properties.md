---
title: 物体属性配置
---

# 物体属性配置

## 概览

本文档介绍定义每个物体的几何形状和夹爪参数的 object_properties.yaml 配置文件。

---

## 配置文件

文件：config/object_properties.yaml

```yaml
object_name:
  geometry_type: "cylinder"    # cylinder, box, sphere
  dimensions: [0.03, 0.10]     # 取决于 geometry_type
  gripper_offset: 0.025        # 抓取时的偏移量
  mass: 0.5                    # 质量（千克）
  friction: 0.8                # 摩擦系数
```

---

## 几何类型

### 圆柱体

```yaml
conical_bottle02:
  geometry_type: "cylinder"
  dimensions: [radius, height]
  # 示例：radius=0.03, height=0.10
```

### 立方体

```yaml
box_object:
  geometry_type: "box"
  dimensions: [width, height, depth]
```

### 球体

```yaml
sphere_object:
  geometry_type: "sphere"
  dimensions: [radius]
```

---

## 物体示例

### 锥形瓶

```yaml
conical_bottle02:
  geometry_type: "cylinder"
  dimensions: [0.03, 0.10]  # radius=3cm, height=10cm
  gripper_offset: 0.025      # 抓取偏移 2.5cm
  mass: 0.5                  # 500g
  friction: 0.8
```

### 烧杯

```yaml
beaker_2:
  geometry_type: "cylinder"
  dimensions: [0.04, 0.10]  # radius=4cm, height=10cm
  gripper_offset: 0.02
  mass: 0.3
  friction: 0.6
```

### 移液器

```yaml
pipette:
  geometry_type: "cylinder"
  dimensions: [0.01, 0.15]  # radius=1cm, height=15cm
  gripper_offset: 0.01
  mass: 0.1
  friction: 0.5
```

---

## 夹爪偏移

gripper_offset 参数指定夹爪应从物体中心偏移多远的距离进行稳定抓取。

```yaml
# 示例：抓取烧杯
beaker:
  gripper_offset: 0.02  # 从中心偏移 2cm
  # 这会影响拾取技能的前进方式

skill: "pick"
target_object: "beaker"
params:
  pre_offset_z: 0.05  # 额外的接近偏移量
```

---

## 物理属性

### 质量

```yaml
object:
  mass: 0.5  # 千克
```

### 摩擦系数

```yaml
object:
  friction: 0.8  # 摩擦系数
```

---

## 完整示例

文件：config/object_properties.yaml

```yaml
# 实验室设备

conical_bottle02:
  geometry_type: "cylinder"
  dimensions: [0.03, 0.10]
  gripper_offset: 0.025
  mass: 0.5
  friction: 0.8

beaker_2:
  geometry_type: "cylinder"
  dimensions: [0.04, 0.10]
  gripper_offset: 0.02
  mass: 0.3
  friction: 0.6

beaker_small:
  geometry_type: "cylinder"
  dimensions: [0.025, 0.08]
  gripper_offset: 0.015
  mass: 0.2
  friction: 0.6

test_tube:
  geometry_type: "cylinder"
  dimensions: [0.015, 0.12]
  gripper_offset: 0.01
  mass: 0.1
  friction: 0.5

pipette:
  geometry_type: "cylinder"
  dimensions: [0.01, 0.15]
  gripper_offset: 0.01
  mass: 0.05
  friction: 0.4

# 盒子与容器

storage_box:
  geometry_type: "box"
  dimensions: [0.10, 0.05, 0.08]
  gripper_offset: 0.03
  mass: 0.2
  friction: 0.7

lid:
  geometry_type: "box"
  dimensions: [0.08, 0.01, 0.08]
  gripper_offset: 0.005
  mass: 0.1
  friction: 0.5
```

---

## 关键文件

| 文件 | 描述 |
| --- | --- |
| config/object_properties.yaml | 物体属性配置 |
| controllers/atomic_actions/pick_controller.py | 抓取控制器 |
| tasks/workflow_task.py | 工作流任务 |
