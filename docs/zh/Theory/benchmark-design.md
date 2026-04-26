---
title: Benchmark Design
---

# Benchmark Design

## 概览

RoboGenesis 提供了一个面向科学具身智能体的分层基准测试体系。本页面介绍基准测试的设计原理。

---

## 分层结构


```

Level 1: Atomic Skills (single manipulation)
├── pick, place, pour, stir, shake
├── press, open, close, move
│
Level 2: Skill Compositions (two-object operations)
├── pick + place (object transport)
├── pick + pour (liquid transfer)
├── stir + shake (mixing)
│
Level 3: Workflows (multi-step protocols)
├── heat + stir reaction
├── clean + rinse protocol
├── reagent preparation
│
Level 4: Long-Horizon Protocols (full lab procedures)
└── full_lab_protocol

```


---

## 层级定义

### Level 1: 原子技能

单一操作基元。

pick: 抓取物体

place: 释放物体

pour: 转移液体

stir: 用搅拌棒混合

shake: 摇动容器

press: 激活设备

open/close: 操作门/容器

评估方式: 按技能统计成功率

### Level 2: 技能组合

需要物体跟踪的双技能组合。

pick + place: 物体搬运

pick + pour: 液体转移

stir + shake: 混合协议

评估方式: 端到端成功率

### Level 3: 工作流

多步骤协议（3-5步）。

heat + stir: 化学反应

clean + rinse: 烧杯清洗

reagent prep: 溶液配制

评估方式: 所有步骤均成功

### Level 4: 长时程任务

完整实验流程（6步以上）。

full_lab_protocol: 完整实验工作流

评估方式: 全流程成功

---

## 评估指标

### 成功率


```

success_rate = successful_episodes / total_episodes

```


### 步骤成功率


```

step_success = successful_steps / total_steps

```


### 任务长度


```

avg_horizon = sum(episode_lengths) / num_episodes

```


---

## 任务复杂度

| 等级 |
| --- |
| 1 |
| 固定 |
| 2 |
| 动态 |
| 3 |
| 动态 |
| 4 |
| 动态+关系 |

---

## 泛化性

### 位置泛化

物体在指定范围内随机放置。


```

position_range:
x: [0.20, 0.32]  # Random X in range

y: [-0.07, 0.03]  # Random Y in range

z: [0.80, 0.80]   # Fixed Z

```


### 材质泛化

使用随机材质的物体以增强分布外鲁棒性。


```

materials: ["plastic", "metal", "glass"]

```


---

## 基准测试任务

### 化学实验室任务

| 任务 |
| --- |
| pick |
| pick |
| pour |
| pick + pour |
| heat_stir |
| pick + press + stir |
| full_protocol |
| All |

---

## 关键文件

| 文件 |
| --- |
| config/atomic_skills/ |
| config/workflows/ |
| controllers/workflow/success_conditions/ |

---

## 引用

详细基准测试方法请参阅:


```bibtex
@article{待补充,
    author    = {待补充},
    title     = {待补充},
    journal   = {待补充},
    year      = {待补充},
}
```