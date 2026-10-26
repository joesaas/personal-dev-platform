# API 后端（apps/api）

- 包名：`@platform/api`，Express + TypeScript，只做 REST，不渲染页面。
- 启动：根目录 `npm install`、`npm run build` 后 `npm run start -w @platform/api`（默认端口 3001，可用 `PORT` 改）。
- 登录：用户名默认 `li`（`DEV_PLATFORM_USER` 可改），口令来自 `DEV_PLATFORM_PASSWORD`；未设置时启动日志打印一次随机口令，仅当次有效。
- 接口：`POST /api/login`、`GET /api/me`、`POST /api/logout`、`POST /api/run-code`、`GET /api/github?repo=owner/repo`。
- 生产时若 `apps/web/dist` 已构建，Express 会同时 serve 前端静态产物；开发时用 Vite 代理 `/api` 到本服务。
