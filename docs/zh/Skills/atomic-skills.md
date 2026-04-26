---
title: 原子技能
---

# 原子技能

## 概览

RoboGenesis 提供 9 个原子技能，它们是构建更复杂工作流的基础。每个技能都实现为具有基于阶段推进的状态机控制器。

---

## 技能概览

| 技能 | 阶段数 | 描述 |
| --- | --- | --- |
| pick | 7 | 抓取物体 |
| place | 6 | 放置物体 |
| pour | 6 | 倾倒液体 |
| stir | 5 | 搅拌液体 |
| shake | - | 摇晃/混合内容物 |
| press | - | 按压操作 |
| pressZ | - | Z轴对齐按压 |
| open | 8 | 打开门/容器 |
| close | 8 | 关闭门/容器 |
| move | - | 移动机械臂 |

---

## 技能控制器架构

所有原子技能控制器都遵循相同的模式：

```python
class SkillController:
    def __init__(self, ...):
        self._event = 0      # 当前阶段
        self._t = 0.0        # 阶段进度 [0, 1]

    def forward(self):
        """计算当前阶段的动作"""
        if self._event == 0:
            return self._phase_0()
        elif self._event == 1:
            return self._phase_1()
        # ...

    def is_done(self):
        """检查所有阶段是否完成"""
        return self._event >= self._num_phases

    def reset(self):
        """重置到初始状态"""
        self._event = 0
        self._t = 0.0
```

---

## Pick（抓取）

### 阶段

```
阶段 0: 移动到物体上方（接近方向）
阶段 1: 水平接近缓冲
阶段 2: 下降进行抓取
阶段 3: 等待动力学稳定
阶段 4: 闭合夹爪（支持虚拟附着）
阶段 5: 抬起物体
阶段 6: 完成
```

### 关键参数

```yaml
skill: "pick"
params:
  end_effector_euler: [0, 90, 30]   # TCP 方向
  events_dt: [0.002, 0.002, 0.005, 0.02, 0.08, 0.01, 0.02]
  pre_offset_x: 0.05                # 抓取前 X 偏移
  pre_offset_z: 0.05                # 抓取前 Z 偏移
  after_offset_z: 0.4               # 抓取后抬起高度
```

### 成功条件

物体 Z 位置 > 初始 Z + 0.1m（物体已被抬起）

---

## Place（放置）

### 阶段

```
阶段 0: 预放置（高空接近）
阶段 1: 下降到目标位置
阶段 2: 等待
阶段 3: 张开夹爪（释放物体）
阶段 4: 撤回
阶段 5: 完成
```

### 关键参数

```yaml
skill: "place"
params:
  end_effector_euler: [0, 90, 30]
  events_dt: [0.005, 0.002, 0.02, 0.01, 0.02, 0.02]
  pre_offset_z: 0.3                  # 接近高度
```

### 成功条件

物体到达目标位置（在阈值范围内）

---

## Pour（倾倒）

### 阶段

```
阶段 0-1: 接近目标烧杯
阶段 2-3: 倾斜并倾倒（腕部关节使用速度模式）
阶段 4-5: 恢复直立
```

### 关键参数

```yaml
skill: "pour"
params:
  events_dt: [0.006, 0.002, 0.009, 0.01, 0.009, 0.01]
  pour_speed: -1                     # 倾倒速度
```

### 成功条件

源烧杯已倾斜，目标液位发生变化

---

## Stir（搅拌）

### 阶段

```
阶段 0: 抬起/保持当前位置
阶段 1: 移动到烧杯上方
阶段 2: 下降到烧杯内
阶段 3: 搅拌动作（圆形路径）
阶段 4: 抬起离开
```

### 关键参数

```yaml
skill: "stir"
params:
  events_dt: [0.005, 0.01, 0.02, 0.5, 0.02]
  stir_radius: 0.02                  # 搅拌圆半径
  stir_speed: 1.0                    # 搅拌速度
```

### 成功条件

检测到连续搅拌动作

---

## Shake（摇晃）

摇晃控制器执行振荡运动以进行混合。

```yaml
skill: "shake"
params:
  amplitude: 0.1                     # 摇晃幅度
  frequency: 2.0                     # 摇晃频率
  duration: 1.0                      # 总时长
```

---

## Press（按压）

按压控制器移动到目标位置并施加力。

```yaml
skill: "press"
params:
  target_position: [x, y, z]
  press_force: 10.0                  # 按压力
  approach_height: 0.1               # 接近间隙
```

---

## Open / Close（打开/关闭）

### Open（8 阶段）

```
阶段 0: 移动到手柄
阶段 1: 与手柄对齐
阶段 2: 抓取手柄
阶段 3-6: 旋转/平移以打开
阶段 7: 释放手柄
```

### Close（类似的反向过程）

---

## 默认参数

默认参数在 controllers/workflow/skill_defaults.py 中管理：

```python
SKILL_DEFAULT_EE_EULER = {
    "pick": [0, 90, 30],
    "place": [0, 90, 30],
    "pour": [-90, 0, 0],
    "stir": [0, 90, 90],
    # ...
}

SKILL_DEFAULT_EVENTS_DT = {
    "pick": [0.002, 0.002, 0.005, 0.02, 0.08, 0.01, 0.02],
    "place": [0.005, 0.002, 0.02, 0.01, 0.02, 0.02],
    # ...
}
```

也支持特定机器人的覆盖参数。

---

## 技能注册表

技能在 controllers/workflow/skill_registry.py 中注册：

```python
SKILL_CONTROLLER_MAP = {
    "pick": "controllers.atomic_actions.pick_controller.PickController",
    "place": "controllers.atomic_actions.place_controller.PlaceController",
    "pour": "controllers.atomic_actions.pour_controller.PourController",
    # ...
}
```

---

## 关键文件

| 用途 | 文件 |
| --- | --- |
| Pick 控制器 | controllers/atomic_actions/pick_controller.py |
| Place 控制器 | controllers/atomic_actions/place_controller.py |
| Pour 控制器 | controllers/atomic_actions/pour_controller.py |
| Stir 控制器 | controllers/atomic_actions/stir_controller.py |
| Shake 控制器 | controllers/atomic_actions/shake_controller.py |
| Press 控制器 | controllers/atomic_actions/press_controller.py |
| Open 控制器 | controllers/atomic_actions/open_controller.py |
| Close 控制器 | controllers/atomic_actions/close_controller.py |
| 技能默认值 | controllers/workflow/skill_defaults.py |
| 技能注册表 | controllers/workflow/skill_registry.py |
