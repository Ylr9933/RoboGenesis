---
title: 贡献指南
---

# 贡献指南

## 概览

我们欢迎社区贡献！本指南将介绍如何为 RoboGenesis 做出贡献。

---

## 贡献方式

| 类型 | 说明 |
| --- | --- |
| 问题反馈 | 提交使用过程中发现的程序漏洞 |
| 功能建议 | 提出全新功能与优化需求 |
| 代码贡献 | 提交代码合并请求 |
| 文档完善 | 优化与补充项目文档 |
| 示例拓展 | 分享实际使用案例与示例 |

---

## 入门指南

### 1. Fork 仓库


```

git clone #
cd RoboGenesis

git remote add upstream #

```


### 2. 创建分支


```

git checkout -b feature/my-new-feature
# 或

git checkout -b fix/bug-description

```


### 3. 进行修改


```

# 进行您的修改

git add changed_file.py
git commit -m "Add feature: description"

```


### 4. 推送并创建 Pull Request


```

git push origin feature/my-new-feature

```


然后在 GitHub 上创建 Pull Request。

---

## 代码规范

### Python

遵循 PEP 8 规范

尽可能使用类型提示

为公共函数添加文档字符串


```

def my_function(arg1: str, arg2: int) -> bool:
"""
函数的简要描述。
参数:
arg1: 参数1的描述
arg2: 参数2的描述
返回值:
返回值的描述
"""
pass

```


### YAML

使用 2 空格缩进

在键上方添加有意义的注释

将相关键分组放在一起

---

## Pull Request 指南

### 描述

清晰明确的标题和描述

关联相关 Issue

解释做了什么以及为什么

### 测试

本地测试您的修改

运行现有测试确保没有回归

为新功能添加测试


```

# 运行测试

python -m pytest tests/
# 运行特定测试

python -m pytest tests/test_single_config.py

```


### 文档

更新相关文档

为新代码添加文档字符串

更新配置示例

---

## 开发工作流

### 1. 设置环境


```

conda create -n RoboGenesis python=3.11 -y
conda activate RoboGenesis
pip install -r requirements.txt

```


### 2. 本地运行


```

# 测试原子技能

python main.py --config-name atomic_skills/pick
# 运行测试

python -m pytest tests/

```


### 3. 验证注册


```

python scripts/check_registrations.py

```


---

## Issue 模板

### Bug 报告


```

## Bug 描述

描述这个 bug。
## 复现步骤

1. 进入 '...'
2. 运行 '...'
3. 看到错误
## 预期行为

应该发生的事情。
## 环境

- 操作系统: Ubuntu 24.04
- GPU: RTX 3090
- Isaac Sim: 5.1.0

```


### 功能请求


```

## 功能描述

描述这个功能。
## 使用场景

这个功能如何使用？
## 实现思路

可选: 实现的想法。

```


---

## 社区准则

### 保持尊重

使用包容性语言

建设性地提供反馈

关注工作本身，而非个人

### 乐于助人

尽可能回答问题

分享知识和资源

欢迎新成员

---

## 致谢

贡献者将会在以下位置得到认可:

README 致谢部分

GitHub 贡献者列表

论文致谢（针对重要贡献）

---

## 关键文件

| 文件 |
| --- |
| .github/CONTRIBUTING.md |
| tests/ |
| scripts/check_registrations.py |