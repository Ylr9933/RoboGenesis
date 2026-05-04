---
title: OpenPI 集成
---

# OpenPI 集成

## 概览

OpenPI（Open Vocabulary Manipulation）通过 WebSocket 提供远程策略推理。RoboGenesis 与 OpenPI 集成以实现分布式推理。

---

## 系统架构

```
┌─────────────────┐       WebSocket         ┌─────────────────┐
│  RoboGenesis    │ ◄─────────────────────► │  OpenPI Server  │
│  (Inference)    │    remote inference     │  (Policy Model) │
└─────────────────┘                         └─────────────────┘
```

---

## 安装指南

### 1. 克隆 OpenPI

```bash
git clone https://github.com/your-repo/openpi.git
cd openpi
```

### 2. 安装 OpenPI 客户端

```bash
cd packages/openpi-client
pip install -e .
```

---

## OpenPI 服务器设置

### 1. 配置服务器

文件：openpi/config/server.yaml

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

### 2. 启动服务器

```bash
cd openpi
python server.py --config config/server.yaml
```

预期输出：

```
[INFO] Loading model from: path/to/model.ckpt
[INFO] OpenPI server started on 0.0.0.0:8080
[INFO] Waiting for connections...
```

---

## RoboGenesis 配置

### 配置远程推理

文件：config/atomic_skills/pick_remote.yaml

```yaml
mode: "infer"
infer:
  type: "remote"                  # 使用远程推理
  host: "0.0.0.0"               # OpenPI 服务器主机
  port: 8080                     # OpenPI 服务器端口
  n_obs_steps: 3                 # 观测步数
  timeout: 30                    # 请求超时（秒）
  max_retries: 3                # 最大重试次数
```

### 运行远程推理

```bash
python main.py --config-name atomic_skills/pick_remote
```

---

## WebSocket 协议

### 请求格式

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

### 响应格式

```json
{
  "action": [0.0, -0.785, 0.0, -2.356, 0.0, 1.571, 0.785, 0.04, 0.04]
}
```

RoboGenesis 接受任何包含 "action" 键的响应：

- `{"action": [...]}` - 单个动作
- `{"actions": [...]}` - 多个动作

---

## 客户端实现

文件：packages/openpi-client/src/openpi_client/websocket_client_policy.py

```python
from openpi_client.websocket_client_policy import WebSocketClientPolicy

# 初始化客户端
client = WebSocketClientPolicy(
    host="0.0.0.0",
    port=8080,
    n_obs_steps=3,
    timeout=30,
    max_retries=3,
)

# 从观测获取动作
action = client.infer(observation)
```

---

## 错误处理

### 连接失败

```python
try:
    action = client.infer(observation)
except ConnectionError:
    print("Failed to connect to OpenPI server")
    # 回退到本地推理
    action = local_inference(observation)
```

### 超时

```python
try:
    action = client.infer(observation)
except TimeoutError:
    print("Inference timeout, using fallback")
    action = fallback_action
```

### 无效响应

```python
# 客户端验证响应格式
valid, action = client.parse_response(raw_response)
if not valid:
    print("Invalid response format")
    action = fallback_action
```

---

## 部署场景

### 单服务器

```
┌─────────────────┐       WebSocket       ┌─────────────────┐
│  RoboGenesis         │ ◄─────────────────► │  OpenPI Server  │
│  (Local GPU)    │                     │  (Remote GPU)   │
└─────────────────┘                     └─────────────────┘
```

### 分布式

```
┌─────────────────┐       WebSocket       ┌─────────────────┐
│  RoboGenesis         │ ◄─────────────────► │  OpenPI Server 1│
│  Instance 1     │                       └─────────────────┘
└─────────────────┘
┌─────────────────┐       WebSocket       ┌─────────────────┐
│  RoboGenesis         │ ◄─────────────────► │  OpenPI Server 2│
│  Instance 2     │                       └─────────────────┘
└─────────────────┘
```

---

## 性能调优

<div style="text-align: center; margin: 1.5em 0;" markdown>

| 参数 | 描述 | 推荐值 |
| --- | --- | --- |
| n_obs_steps | 观测历史长度 | 3 |
| timeout | 请求超时（秒） | 30 |
| max_retries | 失败时重试次数 | 3 |

</div>

---

## 安全性

### 认证

为 WebSocket 服务器添加认证：

```python
# 在 OpenPI 服务器中
async def authenticate(token):
    # 验证 token
    return user_id
```

### TLS 加密

为生产环境启用 TLS：

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

## 关键文件

<div style="text-align: center; margin: 1.5em 0;" markdown>

| 用途 | 文件 |
| --- | --- |
| OpenPI 客户端 | packages/openpi-client/ |
| 远程推理引擎 | controllers/inference_engines/remote_inference_engine.py |
| OpenPI 服务器 | openpi/ |

</div>

---

## 下一步

<div style="text-align: center; margin: 1.5em 0;" markdown>

| 目标 | 下一步 |
| --- | --- |
| 运行推理 | [推理](./inference.md) |
| 自定义工作流 | [自定义工作流](./custom-workflow.md) |
| 故障排除 | [故障排除](../Getting-Started../../Getting-Started/troubleshooting.md) |

</div>
