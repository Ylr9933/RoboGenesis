# 项目文档部署指南

## 初始化仓库（首次使用）

```bash
git init
git add .
git commit -m "first commit"
git remote add origin git@github.com:username/repository.git
git push

# 部署 v0.1 版本文档
mike deploy v0.1 -p

# 部署 v0.2 并设为最新版
mike deploy v0.2 latest -p

# 设置默认打开 latest
mike set-default latest -p

mike serve
