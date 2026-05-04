---
title: OpenPI Integration
---

# OpenPI Integration

## Overview

OpenPI (Open Vocabulary Manipulation) provides remote policy inference via WebSocket. RoboGenesis integrates with OpenPI for distributed inference.

---

## Architecture

```
┌─────────────────┐       WebSocket         ┌─────────────────┐
│    RoboGenesis  │ ◄─────────────────────► │  OpenPI Server  │
│   (Inference)   │      remote inference   │  (Policy Model) │
└─────────────────┘                         └─────────────────┘
```

---

## Installation

### 1. Clone OpenPI

```bash
git clone https://github.com/your-repo/openpi.git
cd openpi
```

### 2. Install OpenPI Client

```bash
cd packages/openpi-client
pip install -e .
```

---

## OpenPI Server Setup

### 1. Configure Server

**File:** `openpi/config/server.yaml`

```yaml
model:
  checkpoint_path: "path/to/model.ckpt"
  config_path: "path/to/config.yaml"
  normalizer_path: "path/to/normalize.ckpt"

server:
  host: "0.0.0.0"
  port: 8080
  max_connections: 10
```

### 2. Start Server

```bash
cd openpi
python server.py --config config/server.yaml
```

**Expected output:**

```
[INFO] Loading model from: path/to/model.ckpt
[INFO] OpenPI server started on 0.0.0.0:8080
[INFO] Waiting for connections...
```

---

## RoboGenesis Configuration

### Configure Remote Inference

**File:** `config/atomic_skills/pick_remote.yaml`

```yaml
mode: "infer"
infer:
  type: "remote"                  # Use remote inference
  host: "0.0.0.0"               # OpenPI server host
  port: 8080                     # OpenPI server port
  n_obs_steps: 3                 # Observation steps
  timeout: 30                    # Request timeout (seconds)
  max_retries: 3                # Max retry attempts
```

### Run Remote Inference

```bash
python main.py --config-name atomic_skills/pick_remote
```

---

## WebSocket Protocol

### Request Format

```json
{
  "observation": {
    "images": {
      "camera_1_rgb": "base64_encoded_image",
      "camera_2_rgb": "base64_encoded_image"
    },
    "robot_state": {
      "joint_positions": [0.0, -0.785, ...],
      "gripper_state": [0.04, 0.04]
    }
  }
}
```

### Response Format

```json
{
  "action": [0.0, -0.785, 0.0, -2.356, 0.0, 1.571, 0.785, 0.04, 0.04]
}
```

RoboGenesis accepts any response containing "action" key:

- `{"action": [...]}` - single action
- `{"actions": [...]}` - multiple actions

---

## Client Implementation

**File:** `packages/openpi-client/src/openpi_client/websocket_client_policy.py`

```python
from openpi_client.websocket_client_policy import WebSocketClientPolicy

# Initialize client
client = WebSocketClientPolicy(
    host="0.0.0.0",
    port=8080,
    n_obs_steps=3,
    timeout=30,
    max_retries=3,
)

# Get action from observation
action = client.infer(observation)
```

---

## Error Handling

### Connection Failed

```python
try:
    action = client.infer(observation)
except ConnectionError:
    print("Failed to connect to OpenPI server")
    # Fallback to local inference
    action = local_inference(observation)
```

### Timeout

```python
try:
    action = client.infer(observation)
except TimeoutError:
    print("Inference timeout, using fallback")
    action = fallback_action
```

### Invalid Response

```python
# Client validates response format
valid, action = client.parse_response(raw_response)
if not valid:
    print("Invalid response format")
    action = fallback_action
```

---

## Deployment Scenarios

### Single Server

```
┌─────────────────┐       WebSocket       ┌─────────────────┐
│     RoboGenesis      │ ◄────────────────────► │  OpenPI Server   │
│    (Local GPU)  │                       │   (Remote GPU)   │
└─────────────────┘                       └─────────────────┘
```

### Distributed

```
┌─────────────────┐       WebSocket       ┌─────────────────┐
│     RoboGenesis      │ ◄────────────────────► │  OpenPI Server 1│
│    Instance 1   │                       └─────────────────┘
└─────────────────┘
┌─────────────────┐       WebSocket       ┌─────────────────┐
│     RoboGenesis      │ ◄────────────────────► │  OpenPI Server 2│
│    Instance 2   │                       └─────────────────┘
```

---

## Performance Tuning

<div style="text-align: center; margin: 1.5em 0;" markdown>

| Parameter | Description | Default |
| --- | --- | --- |
| n_obs_steps | Observation history length | 3 |
| max_retries | Retry attempts on failure | 3 |
| timeout | Request timeout (seconds) | 30 |

</div>

---

## Security

### Authentication

Add authentication to WebSocket server:

```python
# In OpenPI server
async def authenticate(token):
    # Validate token
    return user_id
```

### TLS Encryption

Enable TLS for production:

```yaml
server:
  host: "0.0.0.0"
  port: 8080
  tls:
    enabled: true
    cert_path: "path/to/cert.pem"
    key_path: "path/to/key.pem"
```

---

## Key Files

<div style="text-align: center; margin: 1.5em 0;" markdown>

| Purpose | File |
| --- | --- |
| OpenPI client | packages/openpi-client/src/openpi_client/websocket_client_policy.py |
| Remote inference engine | controllers/inference_engines/remote_inference_engine.py |
| OpenPI server | openpi/server.py |

</div>

---

## Next Steps

<div style="text-align: center; margin: 1.5em 0;" markdown>

| Goal | Next Tutorial |
| --- | --- |
| Run inference | [Inference](./inference.md) |
| Custom workflow | [Custom Workflow](./custom-workflow.md) |
| Troubleshooting | [Troubleshooting](../../Getting-Started/troubleshooting.md) |

</div>
