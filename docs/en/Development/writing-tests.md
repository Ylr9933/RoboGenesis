---
title: Writing Tests
---

# Writing Tests

## Overview

This guide explains how to write and run tests for RoboGenesis components.

---

## Test Structure

```
tests/
├── test_single_config.py      # Single config integration test
├── test_robot_factory.py      # Robot factory tests
├── test_task_factory.py       # Task factory tests
├── test_controller_factory.py # Controller factory tests
└── ...
```

---

## Running Tests

### Run All Tests

```bash
python -m pytest tests/
```

### Run Specific Test

```bash
python -m pytest tests/test_single_config.py
```

### Run with Coverage

```bash
python -m pytest tests/ --cov=. --cov-report=html
```

---

## Writing Tests

### Test Example

File：tests/test_robot_factory.py

```python
import pytest
from factories.robot_factory import RobotFactory
from omegaconf import DictConfig


def test_robot_factory_creates_franka():
    """Test that RobotFactory creates Franka robot"""
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
    """Test that unknown robot type raises error"""
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

### Test Configuration

```python
@pytest.fixture
def mock_physics_view():
    """Fixture for mock physics view"""
    # Setup mock physics view
    pass


@pytest.fixture
def sample_task_config():
    """Fixture for sample task config"""
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

## Integration Tests

### test_single_config.py

```python
def test_atomic_pick_config():
    """Test that atomic_pick config loads correctly"""
    # This test validates config structure
    pass


def test_workflow_config():
    """Test that workflow config loads correctly"""
    # This test validates workflow config
    pass
```

---

## Test Categories

| Category | Description |
| --- | --- |
| Unit Tests | Test individual components |
| Integration Tests | Test component interactions |
| Config Tests | Test configuration loading |
| Registration Tests | Test factory registrations |

---

## Best Practices

### Arrange-Act-Assert

```python
def test_pick_controller_forward():
    # Arrange
    controller = PickController(task, robot, cfg)
    controller.reset()
    # Act
    action = controller.forward()
    # Assert
    assert action.shape == (9,)  # 7 joints + 2 gripper
```

### Test Edge Cases

```python
def test_robot_factory_empty_position():
    """Test with empty position"""
    cfg = DictConfig({"robot": {"type": "franka", "position": []}})
    factory = RobotFactory()
    with pytest.raises(Exception):
        factory.create(cfg)
```

### Mock External Dependencies

```python
from unittest.mock import Mock, patch


def test_controller_with_mocked_rmpflow():
    """Test controller with mocked RMPFlow"""
    mock_rmpflow = Mock()
    mock_rmpflow.execute.return_value = [...]  # [x, y, z, qx, qy, qz, qw]

    controller = MyController(task, robot, cfg)
    controller.rmpflow_controller = mock_rmpflow
```

---

## Key Files

| 用途 | 文件 |
| --- | --- |
| 单配置测试 | tests/test_single_config.py |
| 机械臂工厂测试 | tests/test_robot_factory.py |
| 任务工厂测试 | tests/test_task_factory.py |
| 注册检查脚本 | scripts/check_registrations.py |
