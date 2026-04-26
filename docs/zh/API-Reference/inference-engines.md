---
title: 推理引擎 API
---

# 推理引擎 API

## 概述

推理引擎提供策略模型的推理能力。支持两种类型：本地（GPU 上）和远程（通过 WebSocket）。

---

## BaseInferenceEngine

文件: controllers/inference_engines/base_inference_engine.py

```python
from controllers.inference_engines.base_inference_engine import BaseInferenceEngine

class MyEngine(BaseInferenceEngine):
    pass
```

### 方法

#### infer()

```python
def infer(self, observation: Dict) -> np.ndarray:
    """
    对观测进行推理。
    参数:
        observation: {
            'images': {...},
            'robot_state': {...}
        }
    返回:
        动作数组 [DOF + gripper]
    """
    raise NotImplementedError
```

#### reset()

```python
def reset(self):
    """重置推理引擎状态"""
    pass
```

---

## LocalModelInferenceEngine

文件: controllers/inference_engines/local_model_inference_engine.py

用于训练好的策略模型的本地 GPU 推理。

```python
from controllers.inference_engines.local_model_inference_engine import LocalModelInferenceEngine

engine = LocalModelInferenceEngine(
    policy_model_path="path/to/model.ckpt",
    normalizer_path="path/to/normalize.ckpt",
    device="cuda:0",
)
```

### 构造函数

```python
def __init__(
    self,
    policy_model_path: str,
    normalizer_path: str,
    device: str = "cuda:0",
):
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| policy_model_path | str | 模型检查点路径 |
| normalizer_path | str | 归一化器检查点路径 |
| device | str | 设备 ("cuda:0" 或 "cpu") |

### infer()

```python
def infer(self, observation: Dict) -> np.ndarray:
    # 预处理观测
    # 归一化输入
    # 运行模型前向传播
    # 反归一化输出
    return action
```

---

## RemoteInferenceEngine

文件: controllers/inference_engines/remote_inference_engine.py

通过 OpenPI WebSocket 协议进行远程推理。

```python
from controllers.inference_engines.remote_inference_engine import RemoteInferenceEngine

engine = RemoteInferenceEngine(
    host="0.0.0.0",
    port=8080,
    n_obs_steps=3,
    timeout=30,
    max_retries=3,
)
```

### 构造函数

```python
def __init__(
    self,
    host: str = "0.0.0.0",
    port: int = 8080,
    n_obs_steps: int = 1,
    timeout: int = 30,
    max_retries: int = 3,
):
```

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| host | str | OpenPI 服务器主机 |
| port | int | OpenPI 服务器端口 |
| n_obs_steps | int | 观测历史长度 |
| timeout | int | 请求超时时间（秒） |
| max_retries | int | 最大重试次数 |

### infer()

```python
def infer(self, observation: Dict) -> np.ndarray:
    # 将观测序列化为 JSON
    # 通过 WebSocket 发送
    # 接收响应
    # 从响应中解析动作
    return action
```

### 错误处理

```python
try:
    action = engine.infer(observation)
except ConnectionError:
    # 处理连接失败
    action = fallback_action
except TimeoutError:
    # 处理超时
    action = fallback_action
except ResponseParseError:
    # 处理无效响应
    action = fallback_action
```

---

## 配置

### 本地推理配置

```yaml
infer:
  type: "local"
  policy_model_path: "outputs/train/checkpoints/latest.ckpt"
  policy_config_path: "outputs/train/.hydra/config.yaml"
  normalizer_path: "outputs/train/checkpoints/normalize.ckpt"
  device: "cuda:0"
```

### 远程推理配置

```yaml
infer:
  type: "remote"
  host: "0.0.0.0"
  port: 8080
  n_obs_steps: 3
  timeout: 30
  max_retries: 3
```

---

## 关键文件

| 文件 | 描述 |
| --- | --- |
| controllers/inference_engines/base_inference_engine.py | 推理引擎基类 |
| controllers/inference_engines/local_model_inference_engine.py | 本地推理引擎 |
| controllers/inference_engines/remote_inference_engine.py | 远程推理引擎 |
