---
title: 添加新机械臂
---

# 添加新机械臂

## 概览

本指南介绍如何将新的机械臂平台添加到 RoboGenesis。最小实现需要约 30 行代码和 YAML 配置。

---

## 步骤指南

### 步骤 1：创建机械臂类

创建 `robots/new_arm/new_arm.py`：

```python
import numpy as np
from robots.base import GenericArm, attach_robotiq_2f85, local_asset_path

class MyNewArm(GenericArm):
    ARM_DOF = 6
    GRIPPER_TYPE = "revolute"
    GRIPPER_DOF_INDICES = [6]
    GRIPPER_OPEN = [0.0]
    GRIPPER_CLOSED = [0.8]
    GRIPPER_MAX_WIDTH = 0.085
    TCP_OFFSET_LOCAL = np.array([0.0, 0.0, 0.15])

    def _resolve_usd_path(self):
        # 离线优先：如果本地存在则使用，否则为 None（CDN 回退）
        return local_asset_path("robots/MyNewArm.usd")

    def _attach_gripper(self, stage):
        attach_robotiq_2f85(
            stage,
            robot_prim_path=self.prim_path_str,
            mount_link_path=f"{self.prim_path_str}/flange",
        )
```

### 步骤 2：创建 init.py

创建 `robots/new_arm/__init__.py`：

```python
from .my_new_arm import MyNewArm
```

### 步骤 3：在机械臂注册表中注册

编辑 `controllers/robot_configs/registry.py`：

```python
ROBOT_CONFIGS = {
    # ... 现有的机械臂 ...

    "my_new_arm": {
        "arm_dof": 6,
        "gripper_type": "revolute",
        "gripper_dof_indices": [6],
        "gripper_open_positions": [0.0],
        "gripper_max_width": 0.085,
        "gripper_frame_suffix": "/flange",
        "lula_description_path": "my_new_arm/lula_description.yaml",
        "lula_urdf_path": "my_new_arm/my_new_arm.urdf",
        "rmpflow_controller_class": "robots.my_new_arm.rmpflow_controller.RMPFlowController",
    },
}
```

### 步骤 4：在机械臂工厂中注册

编辑 `factories/robot_factory.py`：

```python
_CLASS_NAME_MAP = {
    # ... 现有的机械臂 ...

    "my_new_arm": ("robots.my_new_arm.my_new_arm", "MyNewArm"),
}
```

### 步骤 5：创建 RMPFlow 配置

创建 `robots/new_arm/rmpflow/` 目录，包含：

- new_arm_rmpflow_config.yaml
- new_arm_robot_description.yaml

### 步骤 6：创建配置文件

创建 `config/atomic_skills/my_new_arm/pick.yaml`：

```yaml
defaults:
  - /atomic_skills/pick  # 继承自默认值

robot:
  type: "my_new_arm"
  position: [0, 0, 0.71]
```

### 步骤 7：验证注册

```bash
python scripts/check_registrations.py
```

预期输出：

```
OK: 8 robots in _CLASS_NAME_MAP, 8 in ROBOT_CONFIGS — all mappings resolve
```

---

## 夹爪类型

### 棱柱形（内置）

适用于具有内置平行指夹爪的机械臂：

```python
GRIPPER_TYPE = "prismatic"
GRIPPER_DOF_INDICES = [7, 8]  # 两个指关节
GRIPPER_OPEN = [0.04, 0.04]    # 米
GRIPPER_CLOSED = [0.0, 0.0]
```

### 旋转式 (Robotiq 2F-85)

适用于使用 Robotiq 2F-85 的机械臂：

```python
GRIPPER_TYPE = "revolute"
GRIPPER_DOF_INDICES = [6]     # 单自由度（仿生关节）
GRIPPER_OPEN = [0.0]          # 弧度
GRIPPER_CLOSED = [0.8]
```

---

## 类常量参考

| 常量 | 值 | 描述 |
| --- | --- | --- |
| ARM_DOF | 6 | 关节数量 |
| GRIPPER_TYPE | "revolute" | 夹爪类型 |
| GRIPPER_DOF_INDICES | [6] | 夹爪关节索引 |
| GRIPPER_OPEN | [0.0] | 张开位置 |
| GRIPPER_CLOSED | [0.8] | 闭合位置 |
| GRIPPER_MAX_WIDTH | 0.085 | 最大开度宽度 |
| TCP_OFFSET_LOCAL | np.array | TCP 偏移量 |

---

## 离线资源解析

使用 `local_asset_path()` 进行离线优先的资源加载：

```python
def _resolve_usd_path(self):
    return local_asset_path("robots/MyNewArm.usd")
    # 返回：
    # - /data/xuezirui/RoboGenesis/RoboGenesis_xzr_v3/assets/robots/MyNewArm.usd（如果存在）
    # - 否则为 None（回退到 Isaac Sim CDN）
```

---

## 迁移指南

将现有机械臂迁移到使用 GenericArm：

1. 使现有类继承自 GenericArm
2. 实现 `_resolve_usd_path()`（离线优先）
3. 将内联的 `_attach_robotiq_2f85` 替换为调用 `attach_robotiq_2f85()`
4. 运行 `python scripts/check_registrations.py` 进行验证

**优势：**

- 之前：5-7 个文件，100+ 行模板代码
- 之后：2 个文件，约 30 行 + 配置

---

## 关键文件

| 用途 | 文件 |
| --- | --- |
| 基础类 | robots/base/generic_arm.py |
| 基础工具 | robots/base/__init__.py |
| 扩展指南 | docs/en/Robots/adding-new-robot/adding-new-robot.md |
| 机械臂注册表 | controllers/robot_configs/registry.py |
| 机械臂工厂 | factories/robot_factory.py |
| 注册检查器 | scripts/check_registrations.py |
