# Web 端个人开发平台：技术详细设计

## 1. 模块与文件
- `src/auth.ts`：`verifyPassword(input, expected)`（恒定时间比较，避免时序泄露）、`createSessionToken()`（`crypto.randomBytes(32)` 转 hex）、`parseSessionCookie(header)`。
- `src/runner.ts`：`runJavaScript(code: string)` 返回 `{ output: string, error: string | null }`；内部用 `vm.createContext({ console: { log: (...args) => push(format(args)) } })`，`vm.runInNewContext(code, context, { timeout: 2000 })`；输出按行拼接，错误取 `message`，不返回堆栈。
- `src/github.ts`：`parseRepo(input)` 支持 `owner/repo` 与 `https://github.com/owner/repo`（去尾斜杠、去 `.git`）；`fetchRepoInfo(fetchFn, owner, repo)` 先调 `https://api.github.com/repos/{owner}/{repo}`，再调 `/readme`（Accept: raw），失败时按 HTTP 码给可读原因（404 仓库不存在、403 限流、其他网络错误）。
- `src/server.ts`：路由表见第 2 节；静态文件只允许 `public/` 下的 `index.html`、`app.js`、`style.css`，其他路径 404；JSON 体上限 200KB，超限 413；所有 `/api/*`（除登录外）先查 Cookie 会话。

## 2. 接口
- `POST /api/login`：体 `{ username, password }`；用户名默认 `li`（可用 `DEV_PLATFORM_USER` 改），口令见架构；成功 `{ ok: true, user }` + Set-Cookie，失败 401 `{ ok: false, error: "用户名或密码不对" }`。
- `GET /api/me`：已登录 `{ ok: true, user }`，未登录 401。
- `POST /api/logout`：删会话，`{ ok: true }`，并以过期 Cookie 覆盖。
- `POST /api/run-code`：体 `{ code }`，code 必须为非空字符串，否则 400；返回 `{ ok: true, output, error }`，执行错误不走 500（错误是业务结果，放在 `error` 字段里）。
- `GET /api/github?repo=owner/repo`：成功 `{ ok: true, repo: { fullName, description, stars, language, defaultBranch, isPrivate }, readme }`，失败按第 1 节原因返回 400/404/502。
- OpenRouter：无本服务器接口；前端 `fetch("https://openrouter.ai/api/v1/chat/completions", { Authorization: "Bearer " + key, body: { model, messages } })`，需在请求头加 `HTTP-Referer` 与 `X-Title`（OpenRouter 建议项，见实现代码注释）。

## 3. 前端结构（public/）
- `index.html`：登录区（`#login-view`）与工作台区（`#app-view`）二选一显示；工作台左侧导航按钮 `data-lab`，右侧三个 `section.lab` 按需显示。
- `app.js`：`checkMe()` 启动时调 `/api/me` 决定显示哪区；`guardrails` 对象含 `checkInput(text, rules)` 与 `checkOutput(text, rules)`，规则字段：`blockedWords[]`、`inputPattern`、`outputPattern`、`maxLength`、`requireJson`；每条规则返回 `{ name, pass, detail }`，界面逐条渲染，不只给总分。
- `style.css`：设计 token：`--bg #EEF1F5`、`--surface #fff`、`--ink #1B2A3A`、`--accent #0F766E`、`--danger #B42318`、`--ok #067647`、`--warn #B54708`；布局：顶栏 + 左导航 200px + 主区，窄屏时导航横排；表单与按钮用 sentence case，不用全大写标签。

## 4. 构建与测试
- 根构建链：根 `package.json` 的 `build` 改为先 `@platform/shared`，再 `@platform/example-app`，再 `@platform/web-platform`（显式顺序，避免工作区并行顺序问题）。
- 各应用 `tsconfig.json` 继承根 `tsconfig.base.json`，`outDir dist`，`rootDir src`。
- 单元测试：`runner.test.ts`（正常输出、错误、超时）、`github.test.ts`（解析格式、404 原因，用注入的假 fetch，不联网）、`auth.test.ts`（正确/错误口令、Cookie 解析）；跑 `node --test dist/*.test.js`。
- 前端 Guardrails 逻辑在 `app.js` 里，v0.1 不单独抽单测，冒烟时在浏览器逻辑里用示例验证（见实现文档）。

## 5. 配置
- `PORT`：默认 3000，可用环境变量改。
- `DEV_PLATFORM_USER`：默认 `li`。
- `DEV_PLATFORM_PASSWORD`：未设置时启动生成随机口令并打印到控制台，仅当次有效。
- 不新增任何运行时依赖；开发依赖只有根已有的 TypeScript 与 `@types/node`。
