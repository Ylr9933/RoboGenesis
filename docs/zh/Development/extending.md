---
title: 扩展 RoboGenesis
---

# 扩展 RoboGenesis

## 概览

本指南介绍如何用新的机械臂、技能、任务和控制器扩展 RoboGenesis。

---

## 添加新机械臂

请参阅 添加新机械臂 获取详细教程。

创建继承自 GenericArm 的 robots/ new_arm / new_arm .py

在 controllers/robot_configs/registry.py 中注册

在 factories/robot_factory.py 中注册
在 config/atomic_skills/ new_arm / 中创建配置

---

## 添加新技能

### 步骤 1: 创建控制器

文件: controllers/atomic_actions/new_skill_controller.py


```

import numpy as np
from controllers.base_controller import BaseController
class NewSkillController(BaseController):
def __init__(self, task, robot, cfg):
super().__init__(task, robot, cfg, name="new_skill")
self._num_phases = 4
self._event = 0
self._t = 0.0
def forward(self):
if self._event == 0:
return self._phase_0()
elif self._event == 1:
return self._phase_1()
elif self._event == 2:
return self._phase_2()
elif self._event == 3:
return self._phase_3()
def reset(self):
self._event = 0
self._t = 0.0
def is_done(self):
return self._event >= self._num_phases

```


### 步骤 2: 注册技能

文件: controllers/workflow/skill_registry.py


```

SKILL_CONTROLLER_MAP["new_skill"] = "controllers.atomic_actions.new_skill_controller.NewSkillController"

```


### 步骤 3: 添加默认值

文件: controllers/workflow/skill_defaults.py


```

SKILL_DEFAULT_EE_EULER["new_skill"] = [0, 90, 0]
SKILL_DEFAULT_EVENTS_DT["new_skill"] = [0.1, 0.1, 0.1, 0.1]

```


### 步骤 4: 添加成功检查器

文件: controllers/workflow/success_conditions/new_skill_checker.py


```

from controllers.workflow.success_conditions.base_checker import BaseSuccessChecker
class NewSkillChecker(BaseSuccessChecker):
def check(self) -> bool:
# 您的成功条件逻辑

return success_condition_met

```


在 SKILL_SUCCESS_CHECKER_MAP 中注册。

---

## 添加新任务

### 步骤 1: 创建任务类

文件: tasks/new_task.py


```

from tasks.base_task import BaseTask
class NewTask(BaseTask):
def __init__(self, cfg, sim_config):
super().__init__(cfg, sim_config)
def reset(self):
# 重置新 episode 的场景

pass
def get_observation(self):
# 返回观测字典

return {"images": {}, "robot_state": {}}

```


### 步骤 2: 注册任务

文件: factories/task_factory.py


```

_TASK_CLASS_MAP["new_task"] = "tasks.new_task.NewTask"

```


### 步骤 3: 创建配置

文件: config/new_task.yaml


```

name: new_task
task_type: "new_task"
controller_type: "workflow"
mode: "collect"
task:
max_steps: 1000

```


---

## 添加新控制器

### 步骤 1: 创建控制器

文件: controllers/new_controller.py


```

from controllers.base_controller import BaseController
class NewController(BaseController):
def __init__(self, task, robot, cfg):
super().__init__(task, robot, cfg, name="new_controller")
def forward(self):
# 计算动作

return action
def reset(self):
pass
def is_done(self):
return False

```


### 步骤 2: 注册控制器

文件: factories/controller_factory.py


```

_CONTROLLER_CLASS_MAP["new_controller"] = "controllers.new_controller.NewController"

```


---

## 扩展工作流引擎

### 自定义转换


```

# 在 controllers/workflow/transition_manager.py 中

def custom_transition(self, from_skill, to_skill):
# 自定义转换逻辑

pass

```


### 自定义成功条件


```

# 在 controllers/workflow/success_conditions/ 中

class CustomSuccessChecker(BaseSuccessChecker):
def check(self) -> bool:
# 自定义逻辑

return condition_met

```


---

## 扩展示例

### 自定义夹爪


```

def _attach_custom_gripper(self, stage):
"""将自定义夹爪连接到机械臂"""
# 自定义连接逻辑

pass

```


### 自定义相机


```

def setup_custom_camera(self):
"""设置自定义相机配置"""
# 自定义相机设置

pass

```


---

## 最佳实践

遵循现有模式: 研究现有实现

添加测试: 为新组件编写测试

添加文档: 添加文档字符串和示例

注册: 确保所有新组件都已注册
验证: 运行 check_registrations.py 进行验证

---

## 关键文件

<div style="text-align: center; margin: 1.5em 0;" markdown>

| 文件 | 描述 |
| --- | --- |
| `robots/base/generic_arm.py` | 基础机械臂类 |
| `controllers/atomic_actions/` | 原子技能控制器 |
| `controllers/workflow/` | 工作流控制器 |
| `tasks/` | 任务目录 |
| `factories/` | 工厂目录 |
| `scripts/check_registrations.py` | 注册自检脚本 |

</div>
