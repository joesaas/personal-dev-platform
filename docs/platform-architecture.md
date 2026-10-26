# Web 端个人开发平台：技术架构（已确认版，2026-10-26）

## 1. 确认结论
- 语言：Node + TypeScript。
- 前后端分离：前端 Vue 3 + Vite，后台 Express + TypeScript（轻量 REST API）。
- UI 方向：实验室工作台（方向 A，已确认），见详细设计里的 token。

## 2. 包结构
- `apps/web/`（`@platform/web`）：Vue 前端，只做页面与交互，不直接跑代码、不直接查 GitHub（GitHub 走后端接口）。
- `apps/api/`（`@platform/api`）：Express 后端，只做 REST 接口与沙箱执行，不渲染页面。
- `packages/shared/`（`@platform/shared`）：前后端共用的 API 契约类型（`RunResult`、`RepoInfo`、`GithubResult`），不放业务逻辑。
- 旧的零依赖原生 `apps/web-platform` 已删除，不留两个平台并存。

## 3. 请求流
- 开发：Vite（5173）代理 `/api` 到 Express（3001）；浏览器直接调 OpenRouter，不经过本后端。
- 生产：先构建前端到 `apps/web/dist`，再启动 Express，Express 同时 serve 前端静态产物与 `/api`，代码分离、部署一份。
- 登录：`POST /api/login` 设 HttpOnly 会话 Cookie；`GET /api/me` 校验；`POST /api/logout` 清除；未登录的 `/api/*`（除登录外）返回 401。
- 代码：`POST /api/run-code` 由后端 Node `vm` 沙箱执行，超时 2 秒。
- GitHub：`GET /api/github?repo=owner/repo` 由后端调公开 GitHub API，返回仓库信息与 README 摘要。

## 4. 状态与密钥
- 后端会话在内存 Map，重启失效；口令来自 `DEV_PLATFORM_PASSWORD`，未设置时启动打印一次随机口令。
- OpenRouter Key 只存在浏览器 localStorage，绝不发给后端、不进仓库。
- 无数据库；无 Redis；无新增运行时之外的重依赖（Express、Vue、Vite 为确认的框架依赖）。

## 5. 公开部署前仍须做的事
- 登录换 OAuth 或反向代理鉴权 + HTTPS + Cookie Secure + 持久会话，见部署文档。
- 代码沙箱换容器或进程级隔离，不要接受陌生人提交的代码。
