# 架构：Google monorepo 的个人版

## 借鉴 Google 的部分

- 单仓：所有自用代码一个仓库，不按项目拆多个仓库，避免跨仓改动对不上版本。
- 主线开发：`main` 是唯一长期分支，随时可发布；开发分支短命，改完即合入。
- 源码级共享：内部包互相依赖源码，不经过 publish 流程，改动一次提交可同时覆盖调用方和被调用方。
- 目录即归属：`apps/`、`packages/`、`tools/`、`infra/` 的位置就是代码的归属，找代码先看目录，不靠记忆。

## 个人版刻意简化的部分

- 构建：Google 用 Bazel 做 hermetic、可复现构建和远程缓存。个人规模下 npm workspaces + TypeScript 已够用，且与 li 现有 data-pipeline 的 npm workspaces 口径一致。
- 测试与 CI：GitHub Actions 在每次 push 和 PR 上跑 `npm run build`、`npm test`、`npm run check`，不先做 affected-only 增量和远程缓存。
- 版本：内部包不发版、不写 semver 升级流程；对外发布的应用单独定版本时再补。

## 以后升级的路径

仓库变大、变多语言或构建变慢时，不用重排目录：

1. 在 `apps/`、`packages/` 上加 Bazel 的 `BUILD` 文件，npm workspaces 的目录结构原样保留。
2. 或改用 Nx / Turborepo 做 affected-only 任务编排，同样不改目录归属。
3. 升级前先在 `docs/decisions/` 记一条决策，说明触发条件和回退办法。
