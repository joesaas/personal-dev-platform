# Web 端个人开发平台：技术架构

## 1. 总体结构
```
apps/web-platform/
  src/
    server.ts      # HTTP 服务器、路由、会话、静态文件
    runner.ts      # 代码沙箱执行（纯函数，可单测）
    github.ts      # GitHub 仓库查询（纯函数 + fetch 注入，可单测）
    auth.ts        # 口令校验与会话 token（纯函数）
  public/
    index.html     # 登录 + 三个实验室的单页
    app.js         # 前端交互、Guardrails 检查、OpenRouter 直连调用
    style.css      # 设计 token 与布局
  package.json     # @platform/web-platform，private
  tsconfig.json
```

- 不引入框架和数据库：服务器用 Node `http` 标准库，前端用原生 HTML/CSS/JS，状态只在内存会话 + 浏览器 localStorage（仅 OpenRouter Key）。
- 与 monorepo 的关系：根 `package.json` 的 workspaces 已含 `apps/*`，根构建脚本需把新应用加进显式构建链（见详细设计），不改共享包。
- 部署形态：一个 Node 进程即一台服务器，静态文件随编译产物一起走，不单独部署前端。

## 2. 请求流
```
浏览器
  ├─ 未登录 → GET / → index.html（含登录框），/api/me → 401
  ├─ POST /api/login → 校验口令 → Set-Cookie: dev-platform-session=<随机 token>，HttpOnly
  ├─ 登录后：
  │   ├─ POST /api/run-code → runner.ts vm 沙箱 → { output, error }
  │   ├─ GET  /api/github?repo=owner/repo → github.ts fetch api.github.com → { repo, readme }
  │   └─ OpenRouter：浏览器直连 https://openrouter.ai/api/v1/chat/completions，不经过本服务器
  └─ POST /api/logout → 删除内存会话 → 清 Cookie
```

## 3. 安全模型（v0.1，个人使用）
- 会话：随机 32 字节 token，内存 Map 存储，HttpOnly Cookie，SameSite=Lax，Path=/；重启即失效。
- 口令：环境变量优先，未设置则启动时生成随机口令并只打印到服务器控制台，不写文件、不入库。
- 代码沙箱：Node `vm.runInNewContext`，上下文只给一个会收集输出的 `console`，不给 `require`、`process`、`Buffer`、全局 fetch；超时 2000ms；这是“防手滑”级别，不是防恶意逃逸的强沙箱，不得用于执行不可信第三方代码。
- OpenRouter Key：绝不经过本服务器；前端 localStorage 只在用户自己浏览器里。
- GitHub 查询：服务器用无鉴权公开 API，有速率限制，失败时原样返回可读原因。
- 公开部署警告：本登录 + 内存会话不适用于公开互联网；公开前必须换 OAuth / 反向代理鉴权 + HTTPS + 持久会话，见部署文档。

## 4. 数据与状态
- 无数据库，无持久化表。
- 服务器内存：会话 Map（token → 用户名、创建时间）。
- 浏览器：localStorage 仅存 OpenRouter Key、模型名、Guardrails 规则草稿；退出登录不清除 Key（用户可手动清除），文档里写明这一点。

## 5. 扩展点（不做，但留口子）
- 代码实验室：把 `runner.ts` 换成容器/进程级沙箱，即可支持 Python、Shell；接口 `{ code, language }` 不变。
- Guardrails 实验室：把前端规则抽成 `packages/guardrails` 共享包，前后端共用同一套规则；OpenRouter 官方 Guardrails 接口有文档后再接服务端版。
- GitHub 实验室：加 GitHub Token 环境变量可提限流；加 clone + 沙箱运行即是“自动 Demo”阶段，须另做安全评审。
- 登录：把 `auth.ts` 的口令校验换成 OAuth 回调，接口 `/api/me`、`/api/logout` 不变。
