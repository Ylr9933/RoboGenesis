---
title: Installation
---

# Installation

## System Requirements

| Requirement | Minimum | Recommended |
| --- | --- | --- |
| GPU | NVIDIA RTX series | RTX 4090 / RTX 3090 |
| CUDA | 12.6 | 12.6+ |
| OS | Ubuntu 24.04 | Ubuntu 24.04 |
| Python | 3.11 | 3.11 |
| Conda | Any version | Recent version |
| Isaac Sim | 5.1.0 | 5.1.0 |

!!! warning "GPU Compatibility"
    Isaac Sim does NOT support A100/A800 GPUs. Please use RTX series GPUs.

---

## Step 1: Code Download

```bash
# Clone the repository
git clone https://github.com/your-repo/RoboGenesis.git
cd RoboGenesis

# Install git-lfs if not already installed
sudo apt install git-lfs

# Pull large asset files (USD models, textures)
git lfs pull
```

!!! note "Large File Support"
    Asset files (USD, MDL, textures) are stored via Git LFS. Always run `git lfs pull` after cloning.

---

## Step 2: Environment Creation

```bash
# Create new conda environment with Python 3.11
conda create -n RoboGenesis python=3.11 -y

# Activate the environment
conda activate RoboGenesis
```

---

## Step 3: Dependency Installation

### 3.1 Install PyTorch

```bash
pip install torch==2.9.0 torchvision==0.24.0 torchaudio==2.9.0 --index-url https://download.pytorch.org/whl/cu126
```

### 3.2 Install Isaac Sim

```bash
pip install isaacsim[all,extscache]==5.1.0 --extra-index-url https://pypi.nvidia.com
```

!!! note "Isaac Sim Installation"
    This requires NVIDIA Isaac Sim to be installed on your system. See NVIDIA Isaac Sim documentation for installation instructions.

### 3.3 Install Other Dependencies

```bash
pip install -r requirements.txt
```

### 3.4 Setup VSCode Settings

```bash
python -m isaacsim --generate-vscode-settings
```

This creates `.vscode/settings.json` for proper Isaac Sim IntelliSense support.

---

## Step 4: Verify Installation

Run the registration check script to verify all components are properly installed:

```bash
python scripts/check_registrations.py
```

**Expected output:**

```
OK: 8 robots in _CLASS_NAME_MAP, 8 in ROBOT_CONFIGS — all mappings resolve
```

---

## Directory Structure

After installation, you should see:

```
RoboGenesis/
├── assets/                  # USD/MDL resource files
├── config/                  # Hydra YAML configs
├── controllers/             # Controller layer
├── robots/                  # Robot implementations
├── tasks/                   # Task definitions
├── factories/               # Factory pattern
├── data_collectors/         # HDF5 writers
├── scene_factory/           # Asset generation
├── scene_manager/           # Runtime injection
├── task_designer/           # Gradio web UI
├── lab_utils/               # Utilities
├── scripts/                 # Helper scripts
├── tests/                   # Unit tests
├── doc/                     # Docs
├── main.py                  # Entry point
├── requirements.txt         # Python deps
└── README.md
```

---

## Optional: Data Download

Pre-collected datasets are available on HuggingFace:

```bash
# Download from HuggingFace
git clone https://huggingface.co/datasets/your-repo/RoboGenesis-Dataset
```

Or use the conversion script to convert RoboGenesis format to LeRobot format:

```bash
python scripts/convert_labsim_data_to_lerobot.py \
    --data_dir outputs/collect/xxx/dataset \
    --num_processes 8 \
    --fps 60 \
    --repo_name RoboGenesis/level3-pick
```

---

## Next Steps

| Goal | Next Step |
| --- | --- |
| Understand config system | [Configuration](./configuration.md) |
| Run first episode | [First Episode](./first-episode.md) |
| Learn core concepts | [Core Concepts](../Core-Concepts/robots.md) |
| Troubleshooting | [Troubleshooting](./troubleshooting.md) |
