---
title: 快速入门
---

# 快速入门

## 一分钟运行项目

```bash
# 数据采集（默认 Franka）
python main.py --config-name atomic_skills/pick

# 指定机器人
python main.py --config-name atomic_skills/rizon4/pick

# 多步骤工作流
python main.py --config-name workflows/workflow_pick_pour

# 模型推理
python main.py --config-name atomic_skills/pick mode=infer
```

预期输出：

```text
[INFO] Loading scene from assets/chemistry_lab/...
[INFO] Robot initialized: franka
[INFO] Starting data collection...
[INFO] Episode 1/100 completed, success: True
[INFO] Episode 2/100 completed, success: True
...
```

详细步骤请参考 [首次运行](Getting-Started/first-episode.md)。
