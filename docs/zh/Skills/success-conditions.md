---
title: 成功条件
---

# 成功条件

## 概览

成功条件用于判断技能是否成功完成了其任务。每个原子技能都有对应的成功检查器，根据预定义的标准评估当前状态。

---

## 系统架构

```
SuccessConditionManager
├── PickChecker
├── PlaceChecker
├── PourChecker
├── StirChecker
├── ShakeChecker
├── PressChecker
├── PressZChecker
├── OpenChecker
└── CloseChecker
```

---

## 基础检查器

文件：controllers/workflow/success_conditions/base_checker.py

```python
class BaseSuccessChecker:
    def __init__(self, task, controller):
        self.task = task
        self.controller = controller

    def check(self) -> bool:
        """如果技能成功则返回 True"""
        raise NotImplementedError

    def get_failure_reason(self) -> str:
        """返回人类可读的错误原因"""
        return "Unknown"
```

---

## PickChecker

**条件：** 物体 Z 位置 > 初始 Z + 0.1m

**逻辑：**

```python
class PickChecker(BaseSuccessChecker):
    def check(self) -> bool:
        current_z = self.task.get_object_position("target_object")[2]
        initial_z = self.controller._initial_z
        return current_z > initial_z + 0.1  # 物体已被抬起
```

---

## PlaceChecker

**条件：** 物体到达目标位置（在阈值范围内）

**逻辑：**

```python
class PlaceChecker(BaseSuccessChecker):
    def check(self) -> bool:
        current_pos = self.task.get_object_position("target_object")
        target_pos = self.controller._target_position
        distance = np.linalg.norm(current_pos - target_pos)
        return distance < 0.05  # 5cm 阈值
```

---

## PourChecker

**条件：** 源烧杯已倾斜 AND 目标液位已改变

**逻辑：**

```python
class PourChecker(BaseSuccessChecker):
    def check(self) -> bool:
        # 检查源烧杯已倾斜（腕部关节已旋转）
        source_tilted = self.controller._wrist_joint > threshold

        # 检查目标有更多液体
        target_level_changed = (
            self.task.get_object_property("target", "liquid_level") >
            self.controller._initial_target_level
        )

        return source_tilted and target_level_changed
```

---

## StirChecker

**条件：** 检测到连续搅拌动作

**逻辑：**

```python
class StirChecker(BaseSuccessChecker):
    def check(self) -> bool:
        # 检查搅拌阶段是否处于活动状态
        if self.controller._event != 3:  # 阶段 3 是搅拌
            return False

        # 检查动作是否连续（未卡住）
        position_history = self.controller._position_history
        if len(position_history) < 10:
            return False

        # 计算速度方差（搅拌时应该非零）
        velocities = np.diff(position_history, axis=0)
        velocity_variance = np.var(velocities, axis=0)
        return np.sum(velocity_variance) > threshold
```

---

## ShakeChecker

**条件：** 检测到振荡模式

**逻辑：**

```python
class ShakeChecker(BaseSuccessChecker):
    def check(self) -> bool:
        # 检查振荡频率
        position_history = self.controller._position_history

        # FFT 检测振荡
        freq = np.fft.fft(position_history)
        dominant_freq = np.argmax(np.abs(freq[1:])) + 1
        return dominant_freq >= 2  # 至少 2 个振荡周期
```

---

## PressChecker

**条件：** 到达目标位置 AND 已施加力

**逻辑：**

```python
class PressChecker(BaseSuccessChecker):
    def check(self) -> bool:
        # 检查位置是否到达
        current_pos = self.task.get_robot_state()["end_effector"]
        target_pos = self.controller._target_position
        position_ok = np.linalg.norm(current_pos - target_pos) < 0.02

        # 检查力是否已施加（通过关节扭矩）
        joint_torques = self.task.get_robot_state()["joint_torques"]
        force_applied = np.max(np.abs(joint_torques)) > force_threshold

        return position_ok and force_applied
```

---

## OpenChecker / CloseChecker

**条件：** 门状态与目标匹配（打开/关闭）

**逻辑：**

```python
class OpenChecker(BaseSuccessChecker):
    def check(self) -> bool:
        door_state = self.task.get_object_state("door")
        return door_state == "open"  # 门完全打开

class CloseChecker(BaseSuccessChecker):
    def check(self) -> bool:
        door_state = self.task.get_object_state("door")
        return door_state == "closed"  # 门完全关闭
```

---

## 多帧成功

某些技能需要连续成功帧来确认完成：

```python
REQUIRED_SUCCESS_STEPS = 5  # 连续 5 帧成功

class BaseSuccessChecker:
    def check(self) -> bool:
        current_success = self._evaluate_single_frame()
        if current_success:
            self._consecutive_success += 1
        else:
            self._consecutive_success = 0
        return self._consecutive_success >= REQUIRED_SUCCESS_STEPS
```

这可以防止瞬态造成的误报。

---

## 成功条件配置

成功条件通过技能注册表自动与技能类型关联：

```python
SKILL_SUCCESS_CHECKER_MAP = {
    "pick": "controllers.workflow.success_conditions.pick_checker.PickChecker",
    "place": "controllers.workflow.success_conditions.place_checker.PlaceChecker",
    "pour": "controllers.workflow.success_conditions.pour_checker.PourChecker",
    # ...
}
```

---

## 自定义成功条件

添加自定义成功条件的步骤：

1. 创建继承自 BaseSuccessChecker 的检查器类
2. 实现 check() 方法
3. 在 SKILL_SUCCESS_CHECKER_MAP 中注册

```python
from controllers.workflow.success_conditions.base_checker import BaseSuccessChecker

class CustomChecker(BaseSuccessChecker):
    def check(self) -> bool:
        # 在这里添加你的逻辑
        return custom_condition_met

# 注册
SKILL_SUCCESS_CHECKER_MAP["custom_skill"] = "path.to.CustomChecker"
```

---

## 关键文件

| 用途 | 文件 |
| --- | --- |
| 基础检查器 | controllers/workflow/success_conditions/base_checker.py |
| Pick 检查器 | controllers/workflow/success_conditions/pick_checker.py |
| Place 检查器 | controllers/workflow/success_conditions/place_checker.py |
| Pour 检查器 | controllers/workflow/success_conditions/pour_checker.py |
| Stir 检查器 | controllers/workflow/success_conditions/stir_checker.py |
| Shake 检查器 | controllers/workflow/success_conditions/shake_checker.py |
| Press 检查器 | controllers/workflow/success_conditions/press_checker.py |
| Open 检查器 | controllers/workflow/success_conditions/open_checker.py |
| Close 检查器 | controllers/workflow/success_conditions/close_checker.py |
