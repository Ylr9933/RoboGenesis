---
title: Inference Engines API
---

# Inference Engines API

## Overview

Inference engines provide policy model inference capabilities. Two types are supported: local (on-GPU) and remote (via WebSocket).

---

## BaseInferenceEngine

**File:** `controllers/inference_engines/base_inference_engine.py`

```python
from controllers.inference_engines.base_inference_engine import BaseInferenceEngine
class MyEngine(BaseInferenceEngine):
    pass
```

### Methods

#### infer()

```python
def infer(self, observation: Dict) -> np.ndarray:
    """
    Run inference on observation.
    Args:
        observation: {
            'images': {...},
            'robot_state': {...}
        }
    Returns: Action array [DOF + gripper]
    """
    raise NotImplementedError
```

#### reset()

```python
def reset(self):
    """Reset inference engine state"""
    pass
```

---

## LocalModelInferenceEngine

**File:** `controllers/inference_engines/local_model_inference_engine.py`

Local GPU inference for trained policy models.

```python
from controllers.inference_engines.local_model_inference_engine import LocalModelInferenceEngine
engine = LocalModelInferenceEngine(
    policy_model_path="path/to/model.ckpt",
    normalizer_path="path/to/normalize.ckpt",
    device="cuda:0",
)
```

### Constructor

```python
def __init__(
    self,
    policy_model_path: str,
    normalizer_path: str,
    device: str = "cuda:0",
):
```

| Parameter | Type | Description |
| --- | --- | --- |
| policy_model_path | str | Path to model checkpoint |
| normalizer_path | str | Path to normalizer checkpoint |
| device | str | Device ("cuda:0" or "cpu") |

### infer()

```python
def infer(self, observation: Dict) -> np.ndarray:
    # Preprocess observation
    # Normalize inputs
    # Run model forward
    # Denormalize outputs
    return action
```

---

## RemoteInferenceEngine

**File:** `controllers/inference_engines/remote_inference_engine.py`

Remote inference via OpenPI WebSocket protocol.

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

### Constructor

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

| Parameter | Type | Description |
| --- | --- | --- |
| host | str | OpenPI server host |
| port | int | OpenPI server port |
| n_obs_steps | int | Observation history length |
| timeout | int | Request timeout (seconds) |
| max_retries | int | Max retry attempts |

### infer()

```python
def infer(self, observation: Dict) -> np.ndarray:
    # Serialize observation to JSON
    # Send via WebSocket
    # Receive response
    # Parse action from response
    return action
```

### Error Handling

```python
try:
    action = engine.infer(observation)
except ConnectionError:
    # Handle connection failure
    action = fallback_action
except TimeoutError:
    # Handle timeout
    action = fallback_action
except ResponseParseError:
    # Handle invalid response
    action = fallback_action
```

---

## Configuration

### Local Inference Config

```yaml
infer:
  type: "local"
  policy_model_path: "outputs/train/checkpoints/latest.ckpt"
  policy_config_path: "outputs/train/.hydra/config.yaml"
  normalizer_path: "outputs/train/checkpoints/normalize.ckpt"
  device: "cuda:0"
```

### Remote Inference Config

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

## Key Files

| File | Description |
| --- | --- |
| controllers/inference_engines/base_inference_engine.py | BaseInferenceEngine |
| controllers/inference_engines/local_model_inference_engine.py | LocalModelInferenceEngine |
| controllers/inference_engines/remote_inference_engine.py | RemoteInferenceEngine |
