---
title: Contributing
---

# Contributing

## Overview

We welcome contributions from the community! This guide explains how to contribute to RoboGenesis.

---

## Ways to Contribute

| Type | Description |
| --- | --- |
| Bug Reports | Report issues you find |
| Feature Requests | Suggest new features |
| Code Contributions | Submit pull requests |
| Documentation | Improve docs |
| Examples | Share usage examples |

---

## Getting Started

### 1. Fork the Repository

```bash
git clone https://github.com/your-repo/RoboGenesis.git
cd RoboGenesis
git remote add upstream https://github.com/original-repo/RoboGenesis.git
```

### 2. Create a Branch

```bash
git checkout -b feature/my-new-feature
# or
git checkout -b fix/bug-description
```

### 3. Make Changes

```bash
# Make your changes
git add changed_file.py
git commit -m "Add feature: description"
```

### 4. Push and Create PR

```bash
git push origin feature/my-new-feature
```

Then create a Pull Request on GitHub.

---

## Code Style

### Python

Follow PEP 8. Use type hints where possible. Add docstrings for public functions.

```python
def my_function(arg1: str, arg2: int) -> bool:
    """
    Brief description of function.
    Args:
        arg1: Description of arg1
        arg2: Description of arg2
    Returns:
        Description of return value
    """
    pass
```

### YAML

- Use 2-space indentation
- Comment above keys when helpful
- Group related keys together

---

## Pull Request Guidelines

### Description

- Clear title and description
- Reference related issues
- Explain what and why

### Testing

Test your changes locally. Run existing tests to ensure no regression. Add tests for new features.

```bash
# Run tests
python -m pytest tests/

# Run specific test
python -m pytest tests/test_single_config.py
```

### Documentation

- Update relevant docs
- Add docstrings for new code
- Update config examples

---

## Development Workflow

### 1. Set Up Environment

```bash
conda create -n RoboGenesis python=3.11 -y
conda activate RoboGenesis
pip install -r requirements.txt
```

### 2. Run Locally

```bash
# Test atomic skill
python main.py --config-name atomic_skills/pick

# Run tests
python -m pytest tests/
```

### 3. Verify Registration

```bash
python scripts/check_registrations.py
```

---

## Issue Templates

### Bug Report

```markdown
## Bug Description

Describe the bug.

## Steps to Reproduce

1. Go to '...'
2. Run '...'
3. See error

## Expected Behavior

What should happen.

## Environment

- OS: Ubuntu 24.04
- GPU: RTX 3090
- Isaac Sim: 5.1.0
```

### Feature Request

```markdown
## Feature Description

Describe the feature.

## Use Case

How would this feature be used?

## Implementation Ideas

Optional: Ideas for implementation.
```

---

## Community Guidelines

### Be Respectful

- Use inclusive language
- Be constructive in feedback
- Focus on the work, not the person

### Be Helpful

- Answer questions when possible
- Share knowledge and resources
- Welcome newcomers

---

## Recognition

Contributors will be recognized in:

- README acknowledgements
- GitHub contributor list
- Paper acknowledgements (for significant contributions)

---

## Key Files

<div style="text-align: center; margin: 1.5em 0;" markdown>

| Purpose | File |
| --- | --- |
| Contribution Guidelines | .github/CONTRIBUTING.md |
| Test Directory | tests/ |
| Registration Check Script | scripts/check_registrations.py |

</div>