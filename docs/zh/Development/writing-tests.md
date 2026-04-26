---
title: 编写测试
---

# 编写测试

## 概览

本指南介绍如何为 RoboGenesis 组件编写和运行测试。

---

## 测试结构


```

tests/
├── test_single_config.py      # 单配置集成测试

├── test_robot_factory.py      # 机械臂工厂测试

├── test_task_factory.py       # 任务工厂测试

├── test_controller_factory.py # 控制器工厂测试

└── ...

```


---

## 运行测试

### 运行所有测试


```

python -m pytest tests/

```


### 运行特定测试


```

python -m pytest tests/test_single_config.py

```


### 带覆盖率运行


```

python -m pytest tests/ --cov=. --cov-report=html

```


---

## 编写测试

### 测试示例

文件: tests/test_robot_factory.py


```

import pytest
from factories.robot_factory import RobotFactory
from omegaconf import DictConfig
def test_robot_factory_creates_franka():
"""测试 RobotFactory 创建 Franka 机械臂"""
cfg = DictConfig({
"robot": {
"type": "franka",
"position": [-0.4, 0, 0.71]
}
})
factory = RobotFactory()
robot = factory.create(cfg)
assert robot is not None
assert robot.name == "franka"
def test_robot_factory_unknown_type():
"""测试未知机械臂类型会抛出错误"""
cfg = DictConfig({
"robot": {
"type": "unknown_robot",
"position": [0, 0, 0]
}
})
factory = RobotFactory()
with pytest.raises(KeyError):
factory.create(cfg)

```


### 测试配置


```

@pytest.fixture
def mock_physics_view():
"""模拟物理视图的 fixture"""
# 设置模拟物理视图

pass
@pytest.fixture
def sample_task_config():
"""示例任务配置的 fixture"""
return {
"max_steps": 1000,
"obj_paths": [
{
"path": "/World/object",
"position_range": {
"x": [0.2, 0.3],
"y": [-0.1, 0.1],
"z": [0.8, 0.8]
}
}
]
}

```


---

## 集成测试

### test_single_config.py


```

def test_atomic_pick_config():
"""测试 atomic_pick 配置是否正确加载"""
# 此测试验证配置结构

pass
def test_workflow_config():
"""测试工作流配置是否正确加载"""
# 此测试验证工作流配置

pass

```


---

## 测试分类

| 分类 |
| --- |
| 单元测试 |
| 集成测试 |
| 配置测试 |
| 注册测试 |

---

## 最佳实践

### Arrange-Act-Assert（准备-执行-断言）


```

def test_pick_controller_forward():
# 准备

controller = PickController(task, robot, cfg)
controller.reset()
# 执行

action = controller.forward()
# 断言

assert action.shape == (9,)  # 7 个关节 + 2 个夹爪

```


### 测试边界情况


```

def test_robot_factory_empty_position():
"""测试空位置情况"""
cfg = DictConfig({"robot": {"type": "franka", "position": []}})
factory = RobotFactory()
with pytest.raises(Exception):
factory.create(cfg)

```


### Mock 外部依赖


```

from unittest.mock import Mock, patch
def test_controller_with_mocked_rmpflow():
"""使用 mock 的 RMPFlow 测试控制器"""
mock_rmpflow = Mock()
mock_rmpflow.execute.return_value = [...]  # [x, y, z, qx, qy, qz, qw]

controller = MyController(task, robot, cfg)
controller.rmpflow_controller = mock_rmpflow

```


---

## 关键文件

| 文件 |
| --- |
| tests/test_single_config.py |
| tests/test_robot_factory.py |
| tests/test_task_factory.py |
| scripts/check_registrations.py |