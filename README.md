# 个人开发平台

只给 li 自己用的开发平台，一个仓库装全部：应用、共享库、工具、文档、部署配置。

## 用的什么 monorepo 口径

按 Google monorepo 的做法改成个人版，不是照搬 Google 的全套重型工具：

- 一个仓库、一条主线：所有代码都在 `main` 上，`main` 随时可发布。
- 按归属分目录，不按技术栈分仓库：应用放 `apps/`，共享代码放 `packages/`，一次性脚本放 `tools/`，部署放 `infra/`。
- 内部依赖走源码，不走发版号：`apps/*` 直接依赖 `packages/*` 的 workspace 版本，不用先 publish 再升级。
- 一次改动一个目的：一个 commit 只做一件事，改动跨应用和共享库时同一次提交一起进，保证仓库整体一致。
- 根目录一条命令跑全量：`npm run build`、`npm test`、`npm run check`。

## 目录

- `apps/`：可独立运行的应用。示例：`apps/example-app`，只证明骨架能跑通；第一个真实应用是 Web 端个人开发平台，前后端分离：`apps/web/`（Vue 前端）+ `apps/api/`（Express 后端），含登录 + 代码实验室 + OpenRouter Guardrails 实验室 + GitHub Demo 实验室，见 `docs/platform-prd.md` 与 `docs/platform-architecture.md`。
- `packages/`：共享库。示例：`packages/shared`，所有应用共用的纯函数和类型。
- `tools/`：仓库级脚本，不发布成包。示例：`tools/check-structure.mjs`，校验目录结构。
- `infra/`：部署与运行配置占位，第一个真实部署进来时再填，不先写死 EC2 或域名。
- `docs/`：架构与决策记录，见 `docs/architecture.md` 和 `docs/decisions/`；平台六份文档见 `docs/platform-*.md`。

## Step 1：本地跑起来

```bash
npm install
npm run build
npm test
npm run check
```

## Step 2：加一个新应用

1. 在 `apps/` 下新建目录，`package.json` 的 `name` 用 `@platform/<名字>`。
2. 共享逻辑先看 `packages/` 有没有现成的，有就直接依赖，没有再新建一个包。
3. 根目录跑 `npm run build && npm test`，全绿再提交。

## Step 3：加一个新共享包

1. 在 `packages/` 下新建目录，同样用 `@platform/<名字>`。
2. 只放多应用共用的东西，单个应用专用的代码留在那个应用里。
3. 在 `docs/decisions/` 补一条简短决策，说明为什么要共用。

## 分支与发布

见 `CONTRIBUTING.md`：短分支、小 PR、CI 全绿才合入 `main`，不留长期开发分支。

## Day 1 故意没做的事

- 没上 Bazel：Google 原生用 Bazel 做 hermetic 构建，个人规模下 npm workspaces + TypeScript 已够用，目录结构不变，后续体量大了可直接在 `apps/`、`packages/` 上加 Bazel，不用重排仓库。详见 `docs/architecture.md`。
- 没发包、没定 license、没接真实部署：等第一个真实应用和仓库名定下来再补，不先编造。
