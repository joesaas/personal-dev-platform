# Web 端个人开发平台：技术详细设计（已确认版，2026-10-26）

## 1. 后端 `apps/api/src/`
- `auth.ts`：`verifyPassword`（timing-safe）、`createSessionToken`（`randomBytes(32)`）、`parseSessionCookie`。
- `runner.ts`：`runJavaScript(code)` → `{ output, error }`，`vm` 沙箱 + 捕获 console，超时 2000 ms；vm 内 Error 按 `message` 字段取（不只用 instanceof）。
- `github.ts`：`parseRepo`（`owner/repo` 与完整链接，去尾斜杠与 `.git`）、`fetchRepoInfo`（注入 fetch，404/403/其他分别给可读错误）。
- `server.ts`：Express，`express.json({ limit: "200kb" })`；登录、登出、`/api/me`、`/api/run-code`（空代码 400，执行错误放 `error` 字段不 500）、`/api/github`；若 `apps/web/dist` 存在则 serve 静态产物并回退到 `index.html`。
- 端口：默认 3001（`PORT` 可改）；用户名默认 `li`（`DEV_PLATFORM_USER` 可改）。

## 2. 前端 `apps/web/src/`
- `App.vue`：登录视图与实验室导航（代码 / OpenRouter / GitHub），登录后调 `/api/me` 恢复会话。
- `components/CodeLab.vue`：代码输入 + 运行 + 输出/错误，调 `/api/run-code`。
- `components/OpenRouterLab.vue`：Key（localStorage）、模型、系统/用户提示、禁词、正则、最长字数、JSON 校验；输入检查不通过直接拦截不发请求；通过后前端直连 `https://openrouter.ai/api/v1/chat/completions`，带 `HTTP-Referer` 与 `X-Title`。
- `components/GitHubLab.vue`：输入仓库，调 `/api/github`，展示信息、README 摘要与 clone 清单（只展示不执行）。
- `lib/guardrails.ts`：`checkRules`，输入/输出分别返回逐条 `{ name, pass, detail }`。
- `lib/api.ts`：统一 fetch，`!res.ok` 时抛可读错误。
- 不上 Router/Pinia：单用户工作台，导航用组件切换即可，后续需要再加。

## 3. UI token（方向 A：实验室工作台，已确认）
- `--bg #EDF1F5`，`--ink #16232E`，`--accent #0F766E`，`--ok #067647`，`--danger #B42318`，`--warn #B54708`，代码控制台 `--console #12202F`。
- 界面系统字体，代码与输出等宽字体；左侧 200px 导航，窄屏换行；无 hero、无营销数字、无一模一样的 SaaS 卡片。

## 4. 构建与测试
- 根构建链：shared → example-app → api → web；web 构建为 `vue-tsc --noEmit && vite build`。
- 测试：后端 `node --test dist/*.test.js`（runner、github、auth），前端本轮无单测，靠构建 + 冒烟验证。
