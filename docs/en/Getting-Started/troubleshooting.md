---
title: Troubleshooting
---

# Troubleshooting

## Common Issues

---

## Installation Issues

### Issue: isaacsim package not found

**Symptom:** `ModuleNotFoundError: No module named 'isaacsim'`

**Solution:**

```bash
# Verify Isaac Sim is installed
pip show isaacsim

# If not installed, reinstall
pip install isaacsim[all,extscache]==5.1.0 --extra-index-url https://pypi.nvidia.com
```

---

### Issue: GPU not detected

**Symptom:** `RuntimeError: No supported GPU found`

**Solution:**

```bash
# Check NVIDIA driver
nvidia-smi

# Verify CUDA version
nvcc --version

# Ensure you're using RTX series (A100/A800 not supported)
```

!!! warning "GPU Compatibility"
    Isaac Sim does NOT support A100/A800 GPUs. Use RTX series.

---

### Issue: Git LFS files not downloaded

**Symptom:** USD assets appear as pointer files or are very small

**Solution:**

```bash
# Install git-lfs
sudo apt install git-lfs

# Pull large files
git lfs pull

# Verify
git lfs ls-files | head -20
```

---

## Runtime Issues

### Issue: Robot not found in registry

**Symptom:** `KeyError: 'rizon4' not found in ROBOT_CONFIGS`

**Solution:**

```bash
# Check all registered robots
python scripts/check_registrations.py

# If registration is missing, add to:
# 1. controllers/robot_configs/registry.py (ROBOT_CONFIGS)
# 2. factories/robot_factory.py (_CLASS_NAME_MAP)
```

---

### Issue: Scene USD not loading

**Symptom:** `FileNotFoundError: assets/chemistry_lab/.../scene.usd`

**Solution:**

```bash
# Verify assets are downloaded
git lfs pull

# Check file exists
ls -la assets/chemistry_lab/

# Try using absolute path in config
usd_path: "/absolute/path/to/scene.usd"
```

---

### Issue: Data collection stops early

**Symptom:** Episodes end before success, low success rate

**Possible causes:**

- Object position too far from robot
- Physics instability
- Controller parameters not tuned

**Solution:**

```yaml
# Adjust object position range in config
obj_paths:
  - path: "/World/conical_bottle02"
    position_range:
      x: [0.20, 0.32]  # Move closer to robot
      y: [-0.07, 0.03]
      z: [0.80, 0.80]

# Or increase max_steps
task:
  max_steps: 2000  # More steps to complete
```

---

### Issue: Hydra config override not working

**Symptom:** `--override` has no effect

**Solution:**

```bash
# Use correct syntax
python main.py --config-name atomic_skills/pick --override robot.type=rizon4

# For nested keys, use dot notation
python main.py --config-name workflows/workflow_pick_pour --override "robot.position=[0,0,0.71]"

# Verify config is being read
python main.py --config-name atomic_skills/pick --help
```

---

### Issue: Import errors in Python

**Symptom:** `ModuleNotFoundError` for project modules

**Solution:**

```bash
# Ensure you're in the project root
cd /path/to/RoboGenesis

# Add to PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Or use VSCode settings
python -m isaacsim --generate-vscode-settings
```

---

## Performance Issues

### Issue: Slow simulation

**Possible causes:**

- GPU not being used
- Too many cameras
- High rendering resolution

**Solution:**

```yaml
# Reduce camera resolution
cameras:
  - resolution: [128, 128]  # Lower res

# Use headless mode
python main.py --config-name atomic_skills/pick headless=True
```

---

### Issue: Memory issues

**Symptom:** Out of memory errors during collection

**Solution:**

```yaml
# Reduce batch size in training
training:
  batch_size: 32  # Smaller batch

# Reduce number of cameras
cameras_names: ["camera_1"]  # Single camera
```

---

## Debugging Tools

### Check Registrations

```bash
python scripts/check_registrations.py
```

### Debug Replay

```bash
# Replay an episode
python scripts/labgen_replay.py --episode outputs/collect/xxx/episode_000.h5
```

### Verbose Logging

```bash
# Run with verbose output
python main.py --config-name atomic_skills/pick log_level=DEBUG
```

---

## Getting Help

| Resource | Link |
| --- | --- |
| GitHub Issues | https://github.com/your-repo/RoboGenesis/issues |
| GitHub Discussions | https://github.com/your-repo/RoboGenesis/discussions |
| Paper (arXiv) | https://arxiv.org |

---

## Error Code Reference

| Error | Solution |
| --- | --- |
| ROBOT_NOT_FOUND | Add to ROBOT_CONFIGS |
| USD_FILE_NOT_FOUND | Run git lfs pull |
| CONFIG_OVERRIDE_FAILED | Use correct dot notation |
| MODEL_PATH_INVALID | Verify model checkpoint exists |
| CAMERA_INIT_FAILED | Check camera prim paths |

---

## Known Limitations

- **GPU:** A100/A800 not supported (RTX required)
- **OS:** Only Ubuntu 24.04 tested
- **Scene size:** Large scenes may cause memory issues