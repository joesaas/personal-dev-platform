# CONTRIBUTING

## 主线规则

- 唯一长期分支是 `main`，`main` 随时可发布。
- 开发用短分支，名字如 `feat/<名字>`、`fix/<名字>`，改完尽快合入，不留长期分支。
- 一个 PR 一个目的，改动尽量小；跨应用和共享库的联动改动同一次提交进，保证整体一致。
- 合入前必须全绿：`npm run build`、`npm test`、`npm run check`，以及 GitHub Actions 的 CI。

## 提交

- 一个 commit 只做一件事，信息写清改了什么、为什么。
- 不提交 `node_modules/`、`dist/`、`.env`、密钥和本地日志，见 `.gitignore`。

## 加代码的位置

- 能跑起来的东西进 `apps/`，多应用共用的东西进 `packages/`，仓库级脚本进 `tools/`，部署配置进 `infra/`。
- 不确定放哪时先放应用里，等第二个应用也要用时再抽成共享包。
