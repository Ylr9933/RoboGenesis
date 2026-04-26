---
title: Home
---

# Home

---

<div style="text-align: center; margin: 1.5em 0;" markdown>

## RoboGenesis

[![arXiv](https://img.shields.io/badge/arXiv-2401.05999-b31b1b.svg)](#)
[![GitHub](https://img.shields.io/badge/GitHub-Code-181717?logo=github)](#)
[![Conference](https://img.shields.io/badge/Conference-Paper-4b44ce.svg)](#)
[![Docs](https://img.shields.io/badge/Docs-Docs-0099cc.svg)](#)

</div>

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Isaac Sim 5.1** | High-fidelity physics simulation with PhysX |
| **7 Robot Platforms** | Franka, FR3, UR5e, UR16e, Festo, Piper, Rizon4 |
| **9 Atomic Skills** | pick, place, pour, shake, stir, press, open, close, move |
| **Hierarchical Benchmark** | Skill → Workflow → Long-horizon protocols |
| **Multi-modal Observation** | RGB, Depth, Point Cloud, Segmentation |
| **HDF5 Data Collection** | Demo collection for ACT, Diffusion policy training |

---

## Quick Start

**1. Clone the repository**

```bash
git clone https://github.com/your-repo/RoboGenesis.git
cd RoboGenesis
git lfs pull
```

**2. Create environment**

```bash
conda create -n RoboGenesis python=3.11 -y
conda activate RoboGenesis
```

**3. Install dependencies**

```bash
pip install torch==2.9.0 torchvision==0.24.0 --index-url https://download.pytorch.org/whl/cu126
pip install isaacsim[all,extscache]==5.1.0 --extra-index-url https://pypi.nvidia.com
pip install -r requirements.txt
```

**4. Run your first episode**

```bash
python main.py --config-name atomic_skills/pick
```

---

## Supported Robots

| Robot | DOF | Gripper Type | Family |
|-------|-----|--------------|--------|
| **Franka** (Panda) | 7 | Prismatic | Franka Robotics |
| **FR3** | 7 | Prismatic | Franka Robotics |
| **UR5e** | 6 | Robotiq 2F-85 | Universal Robots |
| **UR16e** | 6 | Robotiq 2F-85 | Universal Robots |
| **Festo** | 6 | Robotiq 2F-85 | Cobot |
| **Piper** | 6 | Prismatic | AgileX |
| **Rizon4** | 7 | Robotiq 2F-85 | Flexiv |

---

## Documentation

### Getting Started

- [Installation](Getting-Started/installation.md) — System requirements, GPU setup, dependencies
- [Configuration](Getting-Started/configuration.md) — Hydra config system, YAML structure
- [First Episode](Getting-Started/first-episode.md) — Run your first data collection
- [Troubleshooting](Getting-Started/troubleshooting.md) — Common issues and solutions

### Core Concepts

- [Robots](Core-Concepts/robots.md) — Robot base class, 7 platforms, registry system
- [Controllers](Core-Concepts/controllers.md) — BaseController, RMPFlow, inference engines
- [Tasks](Core-Concepts/tasks.md) — Task hierarchy, scene management, observation acquisition
- [Skills](Skills/atomic-skills.md) — 9 atomic skills with state machine controllers

### Tutorials

- [Data Collection](Tutorials/data-collection.md) — Collect demonstrations with scripted controllers
- [Training](Tutorials/training.md) — Train ACT or Diffusion policies with collected data
- [Inference](Tutorials/inference.md) — Deploy trained models for evaluation
- [OpenPI Integration](Tutorials/openpi-integration.md) — Remote inference via OpenPI server

### API Reference

- [Controllers](API-Reference/controllers.md) — BaseController, atomic action controllers
- [Robots](API-Reference/robots.md) — GenericArm, per-robot implementations
- [Tasks](API-Reference/tasks.md) — BaseTask, WorkflowTask, task implementations

---

## Architecture

| Layer | Description |
|-------|-------------|
| **L5 Community** | Documentation, plugin hub |
| **L4 Distribution** | pip install, Docker, GitHub Pages |
| **L3 Observability** | Structured logs, replay, debug |
| **L2 Reliability** | Offline assets, tests, seeds |
| **L1 Core Engine** | Robots, skills, workflow, data |

**Design Philosophy:**

1. **Modular structure** for code organization and maintainability
2. **Scene state and observation** handled in tasks (cameras, robot states, object states)
3. **Robot control and success checking** handled in controllers

---

## Citation

```bibtex
@article{待补充,
    author    = {待补充},
    title     = {待补充},
    journal   = {待补充},
    year      = {待补充},
}
```

---

## License

- **Code**: MIT License
- **Data Assets**: CC BY-NC 4.0 (free for research, not commercial use)
