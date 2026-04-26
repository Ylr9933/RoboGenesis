---
title: Project Overview
---

# Project Overview

---

<div style="text-align: center; margin: 1.5em 0;" markdown>

## RoboGenesis

[![arXiv](https://img.shields.io/badge/arXiv-2401.05999-b31b1b.svg)](#)
[![GitHub](https://img.shields.io/badge/GitHub-Code-181717?logo=github)](#)
[![Conference](https://img.shields.io/badge/Conference-Paper-4b44ce.svg)](#)
[![Docs](https://img.shields.io/badge/Docs-Docs-0099cc.svg)](#)

</div>

---

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

```
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
├── data_collectors/          # HDF5 episode writers
├── scene_factory/            # Procedural asset & scene generation
├── scene_manager/            # Runtime asset injection & physics setup
├── task_designer/            # Gradio web UI for scene/task authoring
├── lab_utils/                 # Shared utilities
├── packages/openpi-client/   # Vendored OpenPI client
├── scripts/                   # Utility scripts
├── tests/                    # Integration tests
├── doc/                      # Architecture docs
└── main.py                   # Simulation entry point
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

!!! WARNING
    Isaac Sim does NOT support A100/A800 GPUs. Please use RTX series GPUs.

---

## Quick Start

### Data Collection

```bash
# Atomic skill (Franka default)
python main.py --config-name atomic_skills/pick

# Atomic skill (specific robot)
python main.py --config-name atomic_skills/rizon4/pick

# Long-horizon workflow
python main.py --config-name workflows/workflow_pick_pour
```

Data saved to：`outputs/collect/date/HH.MM.SS_task_name/`

### Training

```bash
# Diffusion model training
python train.py --config-name=train_diffusion_unet_image_workspace

# ACT model training
python train.py --config-name=train_act_image_workspace
```

Models saved to：`outputs/train/date/time_modelname_taskname/`

### Inference

```bash
# Local inference
python main.py --config-name atomic_skills/pick mode=infer

# Remote inference (OpenPI)
python main.py --config-name workflows/workflow_pick_pour infer.type=remote
```

Results saved to：`outputs/infer/date/time_taskname/`

---

## Acknowledgements

This project builds on several excellent open-source works:

- Isaac Sim from NVIDIA
- RMPFlow / Lula from NVIDIA
- ACT (Action Chunking Transformer)
- Diffusion Policy
- OpenPI (Open Vocabulary Manipulation)

---

## Related Links

- [Paper (arXiv)](#)
- [Project Website](#)
- [HuggingFace Dataset](#)
- [GitHub Repository](#)
