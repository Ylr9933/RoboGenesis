# 原子技能

## 概览

RoboGenesis 提供 10 个原子技能（pick, place, pour, stir, shake, press, pressZ, open, close, move），它们是构建更复杂工作流的基础。每个技能都实现为具有基于阶段推进的状态机控制器。

所有技能控制器遵循统一的架构模式，通过 `self._event` 控制当前阶段，`self._t` 跟踪阶段内进度，`events_dt` 控制每帧推进量。

---

## 技能概览

| 技能 | 阶段数 | 描述 | 控制器文件 |
| --- | --- | --- | --- |
| pick | 7 | 抓取物体 | pick_controller.py |
| place | 6 | 放置物体 | place_controller.py |
| pour | 6 | 倾倒液体 | pour_controller.py |
| stir | 5 | 搅拌液体 | stir_controller.py |
| shake | 10 | 摇晃/混合内容物 | shake_controller.py |
| press | 3 | 按压操作（X轴方向） | press_controller.py |
| pressZ | 3/4 | Z轴对齐按压 | pressZ_controller.py |
| open | 8 | 打开门/容器 | open_controller.py |
| close | 3 | 关闭门/容器 | close_controller.py |
| move | 单阶段 | 移动到目标位置 | move_controller.py |

---

## 技能控制器架构

所有原子技能控制器都遵循相同的模式：

```python
class SkillController(BaseController):
    def __init__(self, name, cspace_controller, events_dt=None, ...):
        self._event = 0      # 当前阶段
        self._t = 0.0        # 阶段进度 [0, 1]
        self._events_dt = events_dt or [dt1, dt2, ...]  # 每阶段推进量

    def forward(self, ...):
        """执行当前阶段的动作"""
        if self._event == 0:
            return self._phase_0()
        elif self._event == 1:
            return self._phase_1()
        # ...

        # 阶段推进逻辑
        self._t += self._events_dt[self._event]
        if self._t >= 1.0:
            self._event += 1
            self._t = 0

        return action

    def is_done(self):
        """检查所有阶段是否完成"""
        return self._event >= len(self._events_dt)

    def reset(self):
        """重置到初始状态"""
        self._event = 0
        self._t = 0
```

**阶段推进机制**：

- `events_dt[i]` 控制第 i 阶段每帧推进量（累计到 1.0 触发阶段转换）
- 值越小 = 等待越久 = 动作越精确；值 = 1 = 立刻跳过
- 各技能默认 `events_dt` 在 `controllers/workflow/skill_defaults.py` 统一管理

**夹爪适配**：

- 通过 `GripperAdapter` 统一处理不同机器人夹爪的差异（prismatic vs revolute）
- `apply_to_action(joint_positions, gap_meters)` - 闭合到指定间距
- `apply_open_to_action(joint_positions)` - 张开夹爪

---

## Pick（抓取）

### 控制器

`controllers/atomic_actions/pick_controller.py`

### 7 个阶段

```text
阶段 0: 移动到物体上方（根据接近方向计算偏移）
阶段 1: 水平接近缓冲（调整 pre_offset_x 方向）
阶段 2: 下降到抓取位置（叠加 pickz_offset）
阶段 3: 等待动力学稳定
阶段 4: 闭合夹爪抓取（支持虚拟附着）
阶段 5: 抬起物体到目标位置
阶段 6: 完成
```

### 关键参数

```yaml
skill: "pick"
params:
  end_effector_euler: [0, 90, 30]   # TCP 朝向 [Roll, Pitch, Yaw] 度
  events_dt: [0.002, 0.002, 0.005, 0.02, 0.08, 0.01, 0.02]  # 7阶段
  pre_offset_x: 0.05                # 抓取前 X 方向偏移（米）
  pre_offset_z: 0.05                # 抓取前 Z 方向偏移（米）
  after_offset_z: 0.3               # 抓取后抬起高度（米）
  gripper_distances: null           # 夹爪间距（null=从 object_properties.yaml 读取）
```

### 抓取偏移计算

```python
# 优先级:
# 1. pickz_offset_override (forward 参数, 用于 re-pick from heater 等特殊场景)
# 2. config/object_properties.yaml 中的 per-object 值
# 3. 动态 fallback = object_size[2] * 2 / 5
```

### 虚拟夹持

支持虚拟附着（virtual attach）用于：

- `object_properties.yaml` 中声明 `needs_virtual_attach` 的物体（如 glass_rod）
- 强制使用虚拟夹持的机械臂（如 piper，物理夹爪不可用时）

---

## Place（放置）

### 控制器

`controllers/atomic_actions/place_controller.py`

### 6 个阶段

```text
阶段 0: 预放置（高空接近，target_z += pre_place_z）
阶段 1: 下降到目标上方（target_z += place_offset_z）
阶段 2: 等待稳定
阶段 3: 张开夹爪释放物体（通过 GripperAdapter）
阶段 4: 撤回（X-0.15, Z+0.15）
阶段 5: 完成
```

### 关键参数

```yaml
skill: "place"
params:
  end_effector_euler: [0, 90, 30]
  events_dt: [0.005, 0.01, 0.08, 0.05, 0.01, 0.1]  # 6阶段
  pre_place_z: 0.2            # 下降起点高度（米）
  place_offset_z: 0.05        # 目标上方悬停高度（米）
```

---

## Pour（倾倒）

### 控制器

`controllers/atomic_actions/pour_controller.py`

### 6 个阶段

```text
阶段 0: 移动到目标上方（叠加随机高度 height_range_1）
阶段 1: 精调位置和高度（叠加 height_range_2 + object_size/2 + pickz_offset）
阶段 2: 切换腕关节到速度模式，开始正转倾倒
阶段 3: 暂停（保持倾倒状态）
阶段 4: 反转（负速度，恢复直立）
阶段 5: 暂停，完成
```

### 关键参数

```yaml
skill: "pour"
params:
  end_effector_euler: [0, 90, 30]
  events_dt: [0.006, 0.002, 0.009, 0.01, 0.009, 0.01]  # 6阶段
  pour_speed: -1                    # 倾倒角速度（rad/s，默认 -120°/s）
  height_range_1: [0.3, 0.4]       # 阶段0高度范围（米）
  height_range_2: [0.1, 0.2]       # 阶段1高度范围（米）
```

### 腕关节控制

- 7-DOF 机械臂：wrist_dof_index = 6
- 6-DOF 机械臂：wrist_dof_index = 5
- 阶段2/4 切换到 velocity 模式，阶段3/5 切回 position 模式

---

## Stir（搅拌）

### 控制器

`controllers/atomic_actions/stir_controller.py`

### 5 个阶段

```text
阶段 0: 抬起/保持当前位置（Z 抬高到安全高度）
阶段 1: 水平移动到烧杯正上方
阶段 2: 下降到烧杯内部（安全深度）
阶段 3: 搅拌动作（圆形路径，实时计算 XY 偏移）
阶段 4: 提起离开烧杯
```

### 关键参数

```yaml
skill: "stir"
params:
  end_effector_euler: [0, 90, -10]    # 搅拌时 TCP 朝向
  events_dt: [0.004, 0.004, 0.005, 0.001, 0.004]  # 5阶段
  stir_radius: 0.009                  # 搅拌圆半径（米）
  stir_speed: 3.0                     # 搅拌角速度
  target_height: 0.12                 # 烧杯高度（用于计算安全深度）
```

### 安全深度计算

```python
# 确保玻璃棒尖始终高于烧杯底部至少 2cm
half_h = target_height / 2
rod_extends = 0.12  # 玻璃棒伸出长度
safe_min = max(rod_extends - half_h + 0.02, 0.02)
```

---

## Shake（摇晃）

### 控制器

`controllers/atomic_actions/shake_controller.py`

### 10 个阶段

```text
阶段 0: 记录摇晃中心（首帧 gripper_position）
阶段 1: 保持位置
阶段 2: 移动到中心 - shake_distance (Y轴)
阶段 3: 移动到中心 + shake_distance (Y轴)
阶段 4: 移动到中心 - shake_distance (Y轴)
阶段 5: 移动到中心 + shake_distance (Y轴)
阶段 6: 移动到中心 - shake_distance (Y轴)
阶段 7: 移动到中心 + shake_distance (Y轴)
阶段 8: 回到中心
阶段 9: 完成
```

### 关键参数

```yaml
skill: "shake"
params:
  end_effector_euler: [0, 90, 10]
  events_dt: [0.02, 0.018, 0.018, 0.018, 0.018, 0.018, 0.018, 0.018, 0.018, 0.015]  # 10阶段
  shake_distance: 0.1              # 摇晃幅度（米）
```

### 自适应高度

摇晃中心自动从首帧 gripper_position 记录，适配任意桌面高度。

---

## Press（按压）

### 控制器

`controllers/atomic_actions/press_controller.py`

### 3 个阶段

```text
阶段 0: 移动到目标前方（X -= initial_offset）
阶段 1: 闭合夹爪
阶段 2: 向前按压（X += press_distance）
```

### 关键参数

```yaml
skill: "press"
params:
  end_effector_euler: [0, 90, 10]
  events_dt: [0.005, 0.1, 0.005]   # 3阶段
  initial_offset: 0.2              # 目标前方起始距离（米）
  press_distance: 0.04             # 按压深度（米）
```

---

## PressZ（Z轴按压）

### 控制器

`controllers/atomic_actions/pressZ_controller.py`

### 3 或 4 个阶段（可选第4阶段）

```text
阶段 0: 接近目标上方（Z += initial_offset）
阶段 1: 闭合夹爪
阶段 2: Z轴按压（Z += press_z_tcp_offset）
阶段 3 (可选): 撤回并张开夹爪（用于 workflow 组合，避免半闭合夹爪干扰下一技能）
```

### 关键参数

```yaml
skill: "pressZ"
params:
  end_effector_euler: [0, 90, 10]
  events_dt: [0.005, 0.01, 0.01]   # 3阶段（可配置为4阶段）
  initial_offset: 0.2              # 接近高度（米）
  press_z_tcp_offset: 0.031        # TCP指尖补偿（米，Franka 默认值）
```

### 使用场景

适用于需要 Z 轴精确对齐的按压场景，如按钮、开关。

---

## Open（开门）

### 控制器

`controllers/atomic_actions/open_controller.py`

### 8 个阶段

```text
阶段 0: APPROACH - 移动到把手正前方（X -= approach_offset_x）
阶段 1: FINE_ADJUST - 微调到抓握位（X -= fine_adjust_x）
阶段 2: GRIP - 闭合夹爪抓住把手
阶段 3: ARC_PULL - 弧线拉门（绕 Z 轴旋转插值，角度=angle）
阶段 4: IDLE - 等待门稳定
阶段 5: RELEASE - 张开夹爪释放把手
阶段 6: RETREAT - 后撤远离门（X -= retreat_x, Y ± retreat_y）
阶段 7: DONE - 完成
```

### 关键参数

```yaml
skill: "open"
params:
  end_effector_euler: [0, 110, 0]
  events_dt: [0.0025, 0.005, 0.0075, 0.002, 0.05, 0.05, 0.01, 0.004]  # 8阶段
  angle: 50.0                      # 开门角度（度）
  furniture_type: "door"           # 家具类型
  approach_offset_x: 0.08         # 接近阶段 X 偏移（米）
  fine_adjust_x: 0.015             # 精调 X 偏移（米）
  grip_offset_x: 0.0              # 抓取 X 偏移（米）
  grip_gap: 0.01                   # 夹爪闭合间距（米）
  pull_time_max: 1.0              # 弧线拉门最大时间（Festo 用 12.0）
  retreat_x: 0.06                  # 撤回 X 偏移（米）
  retreat_y: 0.04                  # 撤回 Y 偏移（米）
  retreat_z: 0.0                    # 撤回 Z 偏移（米）
```

### 弧线插值

使用 SLERP（四元数球面线性插值）进行位置和旋转的弧线插值，确保沿门轴旋转时末端执行器轨迹平滑。

---

## Close（关门）

### 控制器

`controllers/atomic_actions/close_controller.py`

### 3 个阶段

```
阶段 0: APPROACH - 移动到把手前方预备位（X -= approach_offset_x, Z += approach_offset_z）
阶段 1: ARC_PUSH - 弧线推门（绕 Z 轴反向旋转）
阶段 2: RETREAT - 等待后撤（retreat_dwell_t 等待惯性消散）
```

### 关键参数

```yaml
skill: "close"
params:
  end_effector_euler: [350, 90, 25]
  events_dt: [0.0025, 0.005, 0.005]  # 3阶段
  angle: 50.0                      # 关门角度（度）
  furniture_type: "door"
  approach_offset_x: 0.05         # 接近 X 偏移（米）
  approach_offset_y: 0.0           # 接近 Y 偏移（米）
  approach_offset_z: 0.1          # 接近 Z 偏移（米）
  retreat_offset_x: 0.2            # 撤回 X 偏移（米）
  retreat_dwell_t: 0.0            # 推门后等待时间
  retreat_threshold: 0.03         # 撤回距离阈值（米）
  regrip_gap: null                 # 重新抓握间距（可选，用于 openclose 组合场景）
```

### regrip_gap 用途

当 workflow 中 open 后接 close 时，open 阶段释放夹爪后，close 需要重新抓握把手。`regrip_gap` 参数控制：

- Phase 0: 张开夹爪让把手进入
- Phase 1: 闭合到指定间距抓握

---

## Move（移动）

### 控制器

`controllers/atomic_actions/move_controller.py`

### 单阶段控制

直接通过 cspace_controller 移动到目标位置，使用位置阈值判定完成。

### 支持的移动模式

**单点移动**：

```yaml
skill: "move"
params:
  end_effector_euler: [0, 90, 30]
  position_threshold: 0.02         # 位置阈值（米）
  orientation_threshold: 0.1       # 朝向阈值
```

**多点路径移动**：

```python
move_controller.forward_multi_segment(
    waypoints=[p1, p2, p3],  # 路径点列表
    current_joint_positions=...,
    gripper_position=...,
    target_orientation=...
)
```

**两段式移动（垂直+水平）**：

```python
move_controller.forward_two_points(
    first_position=p1,       # 中间点
    final_position=p2,       # 最终目标
    ...
)
```

---

## 默认参数管理

所有技能的默认参数统一在 `controllers/workflow/skill_defaults.py` 管理：

### 末端执行器朝向

```python
SKILL_DEFAULT_EE_EULER = {
    "pick":   [0, 90, 30],
    "place":  [0, 90, 30],
    "pour":   [0, 90, 30],
    "shake":  [0, 90, 10],
    "stir":   [0, 90, -10],
    "open":   [0, 110, 0],
    "close":  [350, 90, 25],
    "press":  [0, 90, 10],
    "pressZ": [0, 90, 10],
}
```

### 阶段时间

```python
SKILL_DEFAULT_EVENTS_DT = {
    "pick":   [0.002, 0.002, 0.005, 0.02, 0.08, 0.01, 0.02],
    "place":  [0.005, 0.01, 0.08, 0.05, 0.01, 0.1],
    "pour":   [0.006, 0.002, 0.009, 0.01, 0.009, 0.01],
    "stir":   [0.004, 0.004, 0.005, 0.001, 0.004],
    "press":  [0.005, 0.1, 0.005],
    "pressZ": [0.004, 0.02, 0.01],
    "open":   [0.0025, 0.005, 0.0075, 0.002, 0.05, 0.05, 0.01, 0.004],
    "close":  None,   # 使用控制器内部默认值 [0.0025, 0.005, 0.005]
    "shake":  None,    # ShakeController 内部自管理
}
```

### 机械臂覆盖

不同机械臂有针对性的覆盖参数：

```python
ROBOT_SKILL_OVERRIDES = {
    "piper": {  # Piper 使用 [90, 0, 0] 朝向
        "pick": {"end_effector_euler": [90, 0, 0], ...},
        "place": {"end_effector_euler": [90, 0, 0]},
        ...
    },
    "fr3": {"pick": {"end_effector_euler": [0, 90, 30]}, ...},
    "ur5e": {...},
    "ur16e": {...},
    "festo": {...},
    "rizon4": {...},
}
```

### 参数合并优先级

```text
YAML 显式参数 > 机械臂覆盖 > 全局默认
```

---

## 技能注册表

技能在 `controllers/workflow/skill_registry.py` 中注册：

```python
from controllers.workflow.skill_registry import create_skill_controller, SUPPORTED_SKILLS

# 创建控制器
controller = create_skill_controller(
    skill_type="pick",
    name="my_pick",
    rmp_controller=rmp_ctrl,
    robot=robot,
    events_dt=None,        # None=使用默认
    params={},            # YAML 参数
    robot_type="franka"
)

# 检查是否支持
if "pick" in SUPPORTED_SKILLS:
    ...
```

---

## 配置示例

### config/atomic_skills/pick.yaml

```yaml
skill: "pick"
params:
  end_effector_euler: [0, 90, 30]
  events_dt: [0.002, 0.002, 0.005, 0.02, 0.08, 0.01, 0.02]
  pre_offset_x: 0.05
  pre_offset_z: 0.05
  after_offset_z: 0.3
```

### config/atomic_skills/stir.yaml

```yaml
skill: "stir"
params:
  end_effector_euler: [0, 90, -10]
  events_dt: [0.004, 0.004, 0.005, 0.001, 0.004]
  stir_radius: 0.009
  stir_speed: 3.0
  target_height: 0.12
```

---

## 关键文件

| 用途 | 文件路径 |
| --- | --- |
| Pick 控制器 | controllers/atomic_actions/pick_controller.py |
| Place 控制器 | controllers/atomic_actions/place_controller.py |
| Pour 控制器 | controllers/atomic_actions/pour_controller.py |
| Stir 控制器 | controllers/atomic_actions/stir_controller.py |
| Shake 控制器 | controllers/atomic_actions/shake_controller.py |
| Press 控制器 | controllers/atomic_actions/press_controller.py |
| PressZ 控制器 | controllers/atomic_actions/pressZ_controller.py |
| Open 控制器 | controllers/atomic_actions/open_controller.py |
| Close 控制器 | controllers/atomic_actions/close_controller.py |
| Move 控制器 | controllers/atomic_actions/move_controller.py |
| 技能默认值 | controllers/workflow/skill_defaults.py |
| 技能注册表 | controllers/workflow/skill_registry.py |
| 夹爪适配器 | controllers/gripper_adapters/ |
| 插件注册 | controllers/atomic_actions/_plugin.py |
