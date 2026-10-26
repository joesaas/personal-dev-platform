# Web 端个人开发平台：项目部署（已确认版，2026-10-26）

## 1. 本地开发
```bash
cd personal-dev-platform
npm install
npm run build
DEV_PLATFORM_USER=li DEV_PLATFORM_PASSWORD=<你自己的口令> PORT=3001 npm run start -w @platform/api &
npm run dev -w @platform/web
# 前端 http://localhost:5173 ，/api 代理到 3001
```

## 2. 本地生产验证（已验证）
```bash
npm run build
DEV_PLATFORM_USER=li DEV_PLATFORM_PASSWORD=<你自己的口令> PORT=3001 npm run start -w @platform/api
# 打开 http://localhost:3001 ，Express 直接 serve 构建好的 Vue 产物与 /api
```
- 未设置 `DEV_PLATFORM_PASSWORD` 时，启动日志打印一次随机口令，仅当次有效；不要把口令贴进仓库或文档。

## 3. 自有服务器部署（未实测，按 pm2 口径写）
1. 在服务器上拉取本仓，`npm install`、`npm run build`。
2. 用 pm2 常驻 API 进程（前端已构建进 `apps/web/dist`，由 API serve，不另起前端进程）：
```bash
DEV_PLATFORM_USER=li DEV_PLATFORM_PASSWORD=<服务器环境变量里的口令> PORT=3001 pm2 start apps/api/dist/server.js --name dev-platform-api
pm2 save
```
3. 口令与端口一律走服务器环境变量，不要写进代码、不要提交 `.env`。

## 4. 公开部署前必须做的事（v0.2 未做）
- 把登录换成 OAuth 或放在反向代理鉴权后，不要把本版口令登录直接暴露到公网。
- 上 HTTPS（反向代理层做证书），Cookie 需加 Secure 标记（当前代码未加，公开前必须改）。
- 会话从内存换成持久存储（否则重启、多实例都会掉登录）。
- 代码沙箱换成容器或进程级隔离，否则不要接受陌生人提交的代码。

## 5. 推送注意事项（已实证）
- 用 Muse 的 GitHub App 推送本仓时，`.github/workflows/ci.yml` 必须排除在推送清单外，否则整包 403（App 无 Workflows 权限）。
- CI 文件如需上远端，走用户身份；之后凡改 CI 文件的 App 推送也要继续排除它。
- 推送后按快照记录核对远端 blob SHA，不能只看 commit 生成。

## 6. 回滚
- 本版是替换旧版 `apps/web-platform` 的重构；回滚到旧版需恢复旧目录与旧构建链，不建议与新版并存。
