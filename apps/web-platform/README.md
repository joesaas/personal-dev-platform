# Web 端个人开发平台（apps/web-platform）

- 包名：`@platform/web-platform`，private。
- 启动：根目录 `npm install` 后 `npm run build -w @platform/web-platform`，再 `npm run start -w @platform/web-platform`（默认端口 3000，可用 `PORT` 改）。
- 登录：用户名默认 `li`（`DEV_PLATFORM_USER` 可改），口令来自 `DEV_PLATFORM_PASSWORD`；未设置时启动日志里会打印一次随机口令，仅当次有效。
- 实验室：代码实验室（Node vm 沙箱）、OpenRouter Guardrails 实验室（Key 只存浏览器，不发服务器）、GitHub Demo 实验室（只查询展示，不自动运行陌生代码）。
- 详细设计见 `../../docs/platform-detailed-design.md`，部署见 `../../docs/platform-deployment.md`。
