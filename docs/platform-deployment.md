# Web 端个人开发平台：项目部署

## 1. 本地部署（已验证）
```bash
cd personal-dev-platform
npm install
npm run build
DEV_PLATFORM_USER=li DEV_PLATFORM_PASSWORD=<你自己的口令> PORT=3000 npm run start -w @platform/web-platform
# 打开 http://localhost:3000 ，用上面口令登录
```
- 未设置 `DEV_PLATFORM_PASSWORD` 时，服务器启动日志会打印一次随机口令，仅当次有效；不要把该口令贴进仓库或文档。
- 停止：Ctrl+C；重启后内存会话失效，需重新登录。

## 2. 自有服务器部署（未实测，按 data-pipeline 的 pm2 口径写）
1. 在服务器上 clone 或拉取本仓，`npm install`、`npm run build`。
2. 用 pm2 常驻（单进程即可，v0.1 无多实例需求）：
```bash
DEV_PLATFORM_USER=li DEV_PLATFORM_PASSWORD=<服务器环境变量里的口令> PORT=3000 pm2 start apps/web-platform/dist/server.js --name web-platform
pm2 save
```
3. 口令与端口一律走服务器环境变量，不要写进代码、不要提交 `.env`。
4. 如需开机自启，按服务器 pm2 文档做 `pm2 startup`，不要把口令写进启动脚本正文。

## 3. 公开部署前必须做的事（v0.1 未做）
- 把登录换成 OAuth 或放在反向代理鉴权后，不要把本版口令登录直接暴露到公网。
- 上 HTTPS（反向代理层做证书），Cookie 需加 Secure 标记（当前代码未加，公开前必须改）。
- 会话从内存换成持久存储（否则重启、多实例都会掉登录）。
- 代码沙箱换成容器或进程级隔离，否则不要接受陌生人提交的代码。

## 4. 推送注意事项（已实证）
- 用 Muse 的 GitHub App 推送本仓时，`.github/workflows/ci.yml` 必须排除在推送清单外，否则整包 403（App 无 Workflows 权限，改公开、All repositories 均无关）。
- CI 文件如需上远端，走用户身份：网页端新建文件，或本地 git 用用户凭据推送；之后凡改 CI 文件的 App 推送也要继续排除它。
- 推送后按快照记录核对远端 blob SHA，不能只看 commit 生成。

## 5. 回滚
- v0.1 是新增应用，不改已有 `apps/example-app` 与 `packages/shared` 的代码；回滚时只需停掉 web-platform 进程、删掉 `apps/web-platform/` 与 docs 里六份平台文档，根构建链改回原来的两包顺序。
