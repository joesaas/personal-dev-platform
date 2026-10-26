# deploy/ 说明：一键启动，只做两件事

## 两步启动（主流程）
```bash
# 第 1 步：配 .env
cp .env.example .env
# 编辑 .env，把 DEV_PLATFORM_PASSWORD 改成你自己的口令（其他项有默认值，可不改）

# 第 2 步：执行启动脚本
bash deploy/start.sh
```
脚本会依次做：检查 Node ≥ 22、读 .env、npm install、npm run build、停旧进程、后台启动、等健康检查通过后打印访问地址。重复跑就是更新：会重新构建并重启，不用先手动停。

- 访问地址：默认 http://127.0.0.1:3001（本机用 http://localhost:3001）。
- 日志：`deploy/logs/dev-platform.log`；进程号：`deploy/.run/dev-platform.pid`（这两个目录不进仓库）。
- 停止：`bash deploy/stop.sh`；状态：`bash deploy/status.sh`。
- 健康检查：未登录调 `/api/me` 应返回 401，说明服务在跑且鉴权在工作。
- 没 .env 时第一次跑会先从模板生成 .env 并停下来，提示你填口令后再跑一次。
- 口令不能为空、不能还是模板占位，否则脚本直接报错退出，不会悄悄生成随机口令让你找不到。

## 文件清单
- `start.sh`：一键启动（主入口）。
- `stop.sh` / `status.sh`：停止 / 状态。
- `lib.sh`：共用函数（找 .env、进程号、日志路径），只被其他脚本 source。
- `setup-nginx.sh`：装 nginx 配置（由 start.sh 在 `NGINX_ENABLED=1` 时调用，也可单独跑）。
- `dev-platform.conf`：nginx 站点配置，代理到 `127.0.0.1:3001`。
- `dev-platform.service`：systemd 用户服务模板（进阶替代方案，见下）。
- `dev-platform.env.example`：旧的口令文件模板（兼容 `~/.config/dev-platform/dev-platform.env` 旧路径，新流程优先用仓库根 `.env`）。

## nginx 怎么开（可选，不开也能跑）
- 默认 `NGINX_ENABLED=0`：只起应用，直接访问 3001 端口。
- 想走 nginx 时，在 `.env` 里设 `NGINX_ENABLED=1`，有域名再填 `DOMAIN=你的域名`，再跑 `bash deploy/start.sh`；脚本会尝试装配置并 reload，装不上只警告，不影响应用启动。
- 手动装也行：`sudo cp deploy/dev-platform.conf /etc/nginx/sites-enabled/dev-platform.conf`（conf.d 布局改拷到 conf.d），再 `sudo nginx -t` 通过后 reload。

## 本地开发（不需要一键脚本时）
```bash
npm install
npm run build
DEV_PLATFORM_USER=li DEV_PLATFORM_PASSWORD=<你自己的口令> PORT=3001 npm run start -w @platform/api &
npm run dev -w @platform/web
# 前端 http://localhost:5173 ，/api 代理到 3001
```

## 进阶：systemd 常驻（可选）
如果不想用 nohup 后台进程，改用 systemd 用户服务：按 `dev-platform.service` 里的注释，把仓库路径和 node 路径改成你的实际路径，`systemctl --user enable --now dev-platform` + `loginctl enable-linger`。一键脚本和 systemd 不要同时起同一个端口，会冲突。

## 注意
- 应用默认只绑 `127.0.0.1:3001`，对外只放行 80/443，不要把 3001 直接暴露到公网。
- 本机 VM 没有 nginx，`dev-platform.conf` 的语法未在本机跑 `nginx -t`，必须在服务器上跑通过后再 reload。
- 公开部署前仍须做：OAuth 或反向代理鉴权 + HTTPS + Cookie Secure + 持久会话，见 `docs/platform-deployment.md`。
- git 推送不保留可执行位，所以脚本一律用 `bash deploy/start.sh` 调用，不要直接 `./deploy/start.sh`。
