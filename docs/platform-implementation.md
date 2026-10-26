# Web 端个人开发平台：项目实现记录（v0.1）

## 1. 交付物清单
- 应用：`apps/web-platform/`（`@platform/web-platform`），含 `src/`（server、runner、github、auth + 三个测试文件）、`public/`（index、app、style）、`README.md`。
- 根改动：根 `package.json` 的 `build` 链加进 `@platform/web-platform`（显式顺序：shared → example-app → web-platform）。
- 文档：`docs/platform-prototype.md`、`platform-prd.md`、`platform-architecture.md`、`platform-detailed-design.md`、本文件、`platform-deployment.md`。
- 未推远端：本轮实现只在本地完成，未经 li 确认前不推送；推送时注意 `.github/workflows/ci.yml` 仍须排除在 App 推送清单外（App 无 Workflows 权限）。

## 2. 实现要点
- 登录：用户名默认 `li`，口令 `DEV_PLATFORM_PASSWORD`，未设置时启动打印一次性随机口令；会话为内存随机 token + HttpOnly Cookie。
- 代码实验室：Node `vm` 沙箱，超时 2 秒；修复过两处实测问题：vm 内 Error 与主 realm 类型不同导致错误信息变成 `Error: boom`（改按 `message` 字段取），以及 `typeof require` 不抛错（测试改按“输出 undefined + 直接调用抛错”断言）。
- OpenRouter 实验室：前端直连 OpenRouter，Key 只存浏览器 localStorage；Guardrails 为本平台实现的前后检查（禁词、正则、最长字数、JSON），不是官方产品，界面与文档里已写明。
- GitHub 实验室：服务器调公开 GitHub API，返回仓库信息与 README 摘要，只展示 clone 与体验清单，不执行陌生代码。

## 3. 默认说明（按执行约定标明）
- UI 未用 impeccable-muse 的 polish 流程重打磨：先按 frontend-design-muse 的方向定了 token 与布局（浅钢灰底、深青主色、左导航工作台），未做截图审计；如需精修，可再跑一次 impeccable polish。
- OpenRouter 模型默认 `openai/gpt-4o-mini`，用户可在界面改；未做模型列表拉取。
- GitHub 查询无鉴权，有公开 API 限流；未接 GitHub Token（留作扩展点）。

## 4. 已知限制
- 代码沙箱是防手滑级别，不是强隔离；不要用它跑不可信第三方代码、Python、Shell。
- 登录与内存会话只适用于个人本地/自有服务器；公开部署前必须换 OAuth 或反向代理鉴权 + HTTPS，见部署文档。
- 前端 Guardrails 逻辑未单独单测，靠冒烟与界面示例验证；抽成共享包后应补单测。

## 5. 验证证据（2026-10-26 本地）
- `npm run build`：shared、example-app、web-platform 三个包编译通过。
- `npm test`：example-app 1 项、web-platform 7 项（runner 3、github 2、auth 2）、shared 1 项，合计 9 项全部通过；`npm run check` 为 structure ok。
- 服务器冒烟（端口 3101，口令 test123，仅测试用）：
  - 未登录调 `/api/me` → 401 未登录；错口令登录 → 401 用户名或密码不对。
  - 正确登录 → 200 `{ ok: true, user: "li" }`，带 Cookie 调 `/api/me` → 同样通过。
  - `/api/run-code` 输入示例 → 输出 `Hello from personal-dev-platform` 与 `3`，error 为 null。
  - `/api/github?repo=joesaas/personal-dev-platform` → 返回该仓信息与 README 前段，语言 JavaScript、默认分支 main、公开。
  - 首页 `/` 返回登录页 HTML。
- OpenRouter 实验室未做真实模型调用验证（需要用户自己的 Key，Key 不应进测试记录）；界面逻辑为：输入 Guardrails 不通过时拦截且不发请求，该路径在代码里可读，不依赖 Key。
