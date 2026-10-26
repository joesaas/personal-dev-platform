# Web 端个人开发平台：项目实现记录（已确认版 v0.2，2026-10-26）

## 1. 变更说明
- 2026-10-26 20:33 li 纠正：架构、包结构、框架、UI 风格须先确认，不能擅自决定。
- 2026-10-26 20:40 li 定下方向：Node TS + Express + Vue，前后端分离，UI 走 frontend-design 并交互确认。
- 2026-10-26 20:45 li 确认方案：架构按提案走，UI 选方向 A 实验室工作台。
- 本版据此重构：删除未确认的零依赖原生 `apps/web-platform`，新建 `apps/api`（Express）与 `apps/web`（Vue + Vite），`packages/shared` 增加 API 契约类型。旧版 v0.1 的文档与实现已被本版取代，不再作为定稿引用。

## 2. 交付物清单
- `apps/api/`：Express 后端（server、runner、github、auth + 三个测试文件、README）。
- `apps/web/`：Vue 前端（App、CodeLab、OpenRouterLab、GitHubLab、api/guardrails 工具、Vite 配置、README）。
- `packages/shared/src/api-contract.ts`：`RunResult`、`RepoInfo`、`GithubResult`。
- 根改动：`package.json` 构建链改为 shared → example-app → api → web；`package-lock.json` 随 npm install 更新（Express、Vue、Vite 等）。
- 文档：本文件与架构、详细设计、部署文档已按确认版重写；原型与 PRD 的功能范围不变，技术栈以本文件与架构文档为准。

## 3. 验证证据（2026-10-26 本地）
- `npm install`：新增 130 个包，安装成功。
- `npm run build`：shared、example-app、api、web 四个包全部通过，web 含 `vue-tsc --noEmit` 与 `vite build`（产物 `dist/assets/index-*.js/css`）。
- `npm test`：api 7 项、example-app 1 项、shared 1 项，合计 9 项全部通过；`npm run check` 为 structure ok。
- 后端冒烟（端口 3001，口令 test123，仅测试用）：
  - 未登录调 `/api/me` → 401 未登录；错口令登录 → 401 用户名或密码不对。
  - 正确登录 → 200 `{ ok: true, user: "li" }`，带 Cookie 调 `/api/me` 通过。
  - `/api/run-code` 示例 → 输出 `Hello from personal-dev-platform` 与 `3`，error 为 null。
  - `/api/github?repo=joesaas/personal-dev-platform` → 返回该仓信息与 README 前段，语言 TypeScript、默认分支 main、公开。
  - `/` 返回 Vue 构建后的 `index.html`（Express 已 serve 前端产物）。
- OpenRouter 真实模型调用仍未验证（需 li 自己的 Key）；前端开发服务器（Vite 5173 + 代理）未单独冒烟，生产路径（Express serve 构建产物）已验证。

## 4. 已知限制
- 代码沙箱是防手滑级别，不是强隔离；不要跑不可信第三方代码、Python、Shell。
- 登录与内存会话只适用于个人本地/自有服务器；公开部署前必须换 OAuth 或反向代理鉴权 + HTTPS，见部署文档。
- 前端无单测；Router/Pinia 未引入，后续需要再加。
