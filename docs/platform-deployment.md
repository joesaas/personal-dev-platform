# Web 端个人开发平台：项目部署（已确认版，2026-10-26）

## 1. 两步启动（主流程，已验证）
```bash
cp .env.example .env
# 编辑 .env，把 DEV_PLATFORM_PASSWORD 改成你自己的口令
bash deploy/start.sh
# 打开 http://127.0.0.1:3001 ，Express 直接 serve 构建好的 Vue 产物与 /api
```
- 脚本依次做：检查 Node ≥ 22、读 .env、npm install、npm run build、停旧进程、后台启动、健康检查（未登录 `/api/me` 应返回 401）。
- 停止：`bash deploy/stop.sh`；状态：`bash deploy/status.sh`；更新：重新跑 `bash deploy/start.sh` 即可。
- 没 .env 时第一次跑会先从模板生成 .env 并停下来，提示填口令后再跑；口令不能为空、不能是模板占位。
- 本地开发（不需要一键脚本时）仍可用：`npm run start -w @platform/api` + `npm run dev -w @platform/web`（前端 5173，`/api` 代理到 3001）。

## 3. 自有服务器部署（deploy/ 已备好，nginx 语法须在服务器上验）
- 部署文件在 `deploy/`：`start.sh`（一键启动）、`stop.sh`/`status.sh`、`setup-nginx.sh`、`dev-platform.conf`（nginx 站点）、`dev-platform.service`（systemd 模板，进阶替代）、`README.md`。
- 服务器上同样只做两步：`cp .env.example .env` 并填口令 → `bash deploy/start.sh`。
- nginx 可选：`.env` 里设 `NGINX_ENABLED=1`（有域名再填 `DOMAIN`），启动脚本会尝试装配置并 reload；装不上只警告，不影响应用启动。手动装也行，见 `deploy/README.md`。
- 应用只绑 `127.0.0.1:3001`（`HOST` 环境变量，默认 `0.0.0.0`，deploy 脚本与服务模板设为 `127.0.0.1`），对外只放行 80/443。
- pm2 仍可用作替代常驻方式（前端已构建进 `apps/web/dist`，由 API serve，不另起前端进程）：
```bash
DEV_PLATFORM_USER=li DEV_PLATFORM_PASSWORD=<服务器环境变量里的口令> PORT=3001 HOST=127.0.0.1 pm2 start apps/api/dist/server.js --name dev-platform-api
pm2 save
```
- 口令与端口一律走服务器环境变量，不要写进代码、不要提交 `.env`。

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
