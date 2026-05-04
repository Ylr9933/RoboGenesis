---
title: Project Overview
---

# Project Overview

## What is RoboGenesis?

RoboGenesis is a high-fidelity simulation platform and hierarchical benchmark for scientific embodied agents.

### Core Capabilities

| Capability | Description |
| --- | --- |
| High-Fidelity Simulation | Isaac Sim 5.1 with PhysX |
| Multi-Robot Support | 7 robot platforms |
| Hierarchical Skills | 9 atomic skills + workflows |
| Data Collection | HDF5 episode recording |
| Policy Training | ACT and Diffusion support |
| Scene Generation | Procedural asset generation |

### Key Statistics

| Metric | Value |
| --- | --- |
| Robot Platforms | 7 |
| Atomic Skills | 9 |
| Task Types | 5 |
| Simulation Engine | Isaac Sim 5.1 |
| Python Version | 3.11 |
| Published | NeurIPS 2025 |

---

## Project Structure

```text
RoboGenesis/
├── assets/                     # USD/MDL resource files (git-lfs)
│   ├── chemistry_lab/          # Chemistry lab scenes
│   ├── navigation/            # Navigation task resources
│   └── robots/                 # Robot model resources
├── config/                     # Hydra YAML configs
│   ├── atomic_skills/          # Single-skill configs (top-level + per-robot)
│   ├── workflows/              # Long-horizon multi-skill workflows
│   ├── designer_presets/       # Task Designer presets
│   └── *.yaml                  # Shared configs
├── controllers/               # Controller layer
│   ├── atomic_actions/        # pick/place/pour/press/shake/stir/open/close/move
│   ├── workflow/              # Workflow engine (orchestrates atomic skills)
│   ├── inference_engines/     # Local/remote policy inference
│   ├── robot_controllers/    # Robot-specific wrappers
│   └── robot_configs/         # Per-robot registration
├── robots/                    # Per-robot classes
├── tasks/                     # Task classes
├── factories/                 # Factory pattern (robot/task/controller/collector)
├── data_collectors/           # HDF5 episode writers
├── scene_factory/             # Procedural asset & scene generation
├── scene_manager/             # Runtime asset injection & physics setup
├── task_designer/             # Gradio web UI for scene/task authoring
├── lab_utils/                 # Shared utilities
├── packages/openpi-client/    # Vendored OpenPI client
├── scripts/                   # Utility scripts
├── tests/                     # Integration tests
├── doc/                       # Architecture docs
└── main.py                    # Simulation entry point
```

---

## Technology Stack

| Component | Technology |
| --- | --- |
| Simulation | Isaac Sim 5.1 |
| Physics Engine | PhysX |
| Scene Description | USD |
| Python | 3.11 |
| Config Management | Hydra |
| Deep Learning | PyTorch |
| Data Format | HDF5 |
| Web UI | Gradio |
| Robot Motion | RMPFlow / Lula |

---

## System Requirements

| Requirement | Minimum | Recommended |
| --- | --- | --- |
| GPU | NVIDIA RTX series | RTX 4090 / RTX 3090 |
| CUDA | CUDA 12.6 | CUDA 12.6+ |
| OS | Ubuntu 24.04 | Ubuntu 24.04 |
| Python | 3.11 | 3.11 |
| Conda | Any version | Recent version |

!!! warning "GPU Compatibility"
    Isaac Sim does NOT support A100/A800 GPUs. Please use RTX series GPUs.

---

## Acknowledgements

This project builds on several excellent open-source works:

- NVIDIA Isaac Sim
- NVIDIA RMPFlow / Lula
- ACT (Action Chunking Transformer)
- Diffusion Policy
- OpenPI (Open Vocabulary Manipulation)

---

## Related Links

- [Paper (arXiv)](#)
- [Project Website](#)
- [HuggingFace Dataset](#)
- [GitHub Repository](#)
