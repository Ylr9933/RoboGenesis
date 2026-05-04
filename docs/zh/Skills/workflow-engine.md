---
title: 工作流引擎
---

# 工作流引擎

## 概览

工作流引擎通过协调原子技能来编排多步骤任务执行。它管理技能转换、成功检查和持有对象跟踪。

---

## 系统架构

```
WorkflowEngine
├── SkillExecutor           # 将技能分派到控制器
├── TransitionManager       # 处理技能转换
├── SuccessConditionManager # 每个技能的成功检查
├── HeldObjectContext       # 跟踪持有的对象
└── StepTracker            # 记录执行历史
```

---

## 执行流程

```
1. 回合预热（物理稳定）
2. 转换稳定（如果切换技能）
3. 通过 SkillExecutor.dispatch() 执行技能
   └── 每个步骤调用 AtomicController.forward()
4. 成功条件检查
5. 转换到下一个技能或完成
```

---

## SkillExecutor

文件：controllers/workflow/skill_executor.py

将技能分派到原子控制器：

```python
class SkillExecutor:
    def dispatch(self, skill_name, target_object, params, held_ctx):
        if skill_name == "pick":
            return self._exec_pick(target_object, params, held_ctx)
        elif skill_name == "place":
            return self._exec_place(target_object, params, held_ctx)
        elif skill_name == "pour":
            return self._exec_pour(target_object, params, held_ctx)
        # ...
```

### 参数合并

三层合并优先级：

1. YAML 步骤参数（最高）
2. 机器人覆盖参数
3. 全局默认值（最低）

```python
# 来自 skill_defaults.py
SKILL_DEFAULT_EE_EULER = {...}
SKILL_DEFAULT_EVENTS_DT = {...}
ROBOT_SKILL_OVERRIDES = {...}
```

---

## HeldObjectContext

跟踪机器人持有的对象：

```python
@dataclass
class HeldObject:
    name: str           # 对象名称（例如 "source_beaker"）
    usd_path: str       # 对象 prim 路径
    attach_frame: str   # 附着框架
    # ...

class HeldObjectContext:
    def require(self, skill_name):
        """验证技能所需的持有对象"""
        if skill_name in ["place", "pour"]:
            assert self._held_object is not None, "No object held!"

    def set_held(self, obj: HeldObject):
        self._held_object = obj

    def clear_held(self):
        self._held_object = None
```

### 前置条件强制执行

- place：需要持有对象
- pour：需要持有对象（源烧杯）
- pick：产生持有对象

---

## TransitionManager

处理技能之间的干净转换：

1. 重置 RMPFlow — 清除速度历史
2. 恢复 DOF 模式 — 修复倾倒速度模式
3. 更新夹爪对象位置 — 同步持有对象
4. 重置下一个技能控制器 — 准备执行
5. 等待物理稳定 — 默认 30 帧

```python
def transition_to(self, next_skill, scene_objects):
    self._reset_rmpflow()
    self._restore_dof_modes()
    self._update_gripper_object_pose(scene_objects)
    self._reset_next_controller(next_skill)
    self._settle_physics(frames=30)
```

---

## SuccessConditionManager

每个技能的成功检查器：

<div style="text-align: center; margin: 1.5em 0;" markdown>

| 技能 | 成功条件 | 检查器 |
| --- | --- | --- |
| pick | 物体 Z > 初始 Z + 0.1m | PickChecker |
| place | 物体到达目标位置 | PlaceChecker |
| pour | 源烧杯倾斜，目标液位改变 | PourChecker |
| stir | 检测到连续搅拌动作 | StirChecker |
| shake | 检测到振荡模式 | ShakeChecker |

</div>

---

## 工作流配置

```yaml
workflow:
  table_prim_path: "/World/table"
  language_instruction: "Pick source and pour into target"
  scene_objects:
    - name: "source_beaker"
      path: "/World/beaker_2"
      position_range:
        x: [0.20, 0.28]
        y: [0.05, 0.12]
        z: [0.06, 0.065]
  steps:
    - skill: "pick"
      target_object: "source_beaker"
      params:
        end_effector_euler: [0, 90, 30]
        events_dt: [0.002, 0.002, 0.005, 0.02, 0.08, 0.01, 0.02]
    - skill: "pour"
      target_object: "target_beaker"
      params:
        events_dt: [0.006, 0.002, 0.009, 0.01, 0.009, 0.01]
        pour_speed: -1
```

---

## StepTracker

记录执行历史：

```python
class StepTracker:
    def __init__(self):
        self.history = []  # (步骤索引, 技能名称, 成功状态) 列表

    def record(self, step_index, skill_name, success):
        self.history.append({
            "step": step_index,
            "skill": skill_name,
            "success": success,
            "timestamp": time.time()
        })

    def get_summary(self):
        total = len(self.history)
        successful = sum(1 for h in self.history if h["success"])
        return {"total": total, "successful": successful, "rate": successful/total}
```

---

## WorkflowState

```python
@dataclass
class WorkflowState:
    current_step: int = 0
    current_skill: str = None
    held_object: HeldObject = None
    step_results: List[StepResult] = field(default_factory=list)
    # ...
```

---

## 关键文件

<div style="text-align: center; margin: 1.5em 0;" markdown>

| 用途 | 文件 |
| --- | --- |
| 工作流引擎 | controllers/workflow/workflow_engine.py |
| 技能执行器 | controllers/workflow/skill_executor.py |
| 转换管理器 | controllers/workflow/transition_manager.py |
| 持有对象上下文 | controllers/workflow/held_object_context.py |
| 状态管理器 | controllers/workflow/workflow_state.py |
| 成功条件 | controllers/workflow/success_condition_manager.py |
| 技能默认值 | controllers/workflow/skill_defaults.py |
| 技能注册表 | controllers/workflow/skill_registry.py |

</div>
