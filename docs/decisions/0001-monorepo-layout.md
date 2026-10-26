# 0001：单仓 + apps / packages / tools / infra 布局

- 日期：2026-10-26
- 状态：已采纳（Day 1 骨架）
- 背景：li 要一个只给自己用的开发平台，之前 MuseMe、ShadowClaw、data-pipeline 各自是独立仓库，跨项目复用要靠复制。
- 决定：一个仓库装全部，`apps/` 放可运行应用，`packages/` 放共享库，`tools/` 放仓库级脚本，`infra/` 放部署配置；主线开发，`main` 随时可发布。
- 构建：Day 1 用 npm workspaces + TypeScript，与 data-pipeline 现有口径一致；Bazel 留作后续升级路径，不在 Day 1 引入。
- 后果：新应用和新共享包都按 README 的 Step 2 / Step 3 加；仓库名、license、真实部署目标待定，不先编造。
