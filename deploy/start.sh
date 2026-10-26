#!/usr/bin/env bash
# 个人开发平台一键启动脚本（两步启动的第 2 步）
# 用法只有两步：
#   1. cp .env.example .env，并把 .env 里的 DEV_PLATFORM_PASSWORD 改成你自己的口令
#   2. bash deploy/start.sh
# 脚本会依次做：检查 Node、读 .env、npm install、npm run build、
# 停掉旧进程（如果在跑）、后台启动新进程、等健康检查通过后打印访问地址。
# 重复跑就是更新：会重新构建并重启，不用先手动停。
# 用 bash 调用，不要依赖可执行位：git 推送不保留可执行位。
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib.sh"
cd "$ROOT_DIR"

# Step 0：没 .env 时，先从模板生成一个并停下来让用户填口令
if ! load_env; then
  if [ -f "$ROOT_DIR/.env.example" ]; then
    cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
    echo "已从 .env.example 生成 .env，请先编辑 .env，把 DEV_PLATFORM_PASSWORD 改成你自己的口令，再重新跑 bash deploy/start.sh。"
  else
    echo "找不到 .env，也找不到 .env.example，请先创建 .env 并填 DEV_PLATFORM_PASSWORD。"
  fi
  exit 1
fi

# Step 1：校验
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "错误：找不到 node 或 npm，请先装 Node >= 22，再重新跑。"
  exit 1
fi
NODE_MAJOR="$(node -v | sed 's/^v//; s/\..*//')"
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "错误：Node 版本为 $(node -v)，需要 >= 22，请升级后再跑。"
  exit 1
fi
if [ -z "${DEV_PLATFORM_PASSWORD:-}" ] || [ "$DEV_PLATFORM_PASSWORD" = "换成你自己的口令" ]; then
  echo "错误：.env 里的 DEV_PLATFORM_PASSWORD 还没填（或还是模板占位），请先填好再跑。"
  exit 1
fi
export HOST="${HOST:-127.0.0.1}"
export PORT="${PORT:-3001}"
export DEV_PLATFORM_USER="${DEV_PLATFORM_USER:-li}"
export DEV_PLATFORM_PASSWORD
echo "Starting personal dev platform as user $DEV_PLATFORM_USER on http://$HOST:$PORT ..."

# Step 2：安装 + 构建（每次跑都构建，避免只重启不编译导致跑旧代码）
echo "Installing dependencies..."
npm install --no-audit --no-fund
echo "Building..."
npm run build

# Step 3：停旧进程（如果在跑）
if is_running; then
  echo "Stopping old process (pid $(cat "$PID_FILE"))..."
  kill "$(cat "$PID_FILE")" 2>/dev/null || true
  for _ in $(seq 1 10); do
    is_running || break
    sleep 1
  done
  if is_running; then kill -9 "$(cat "$PID_FILE")" 2>/dev/null || true; fi
  rm -f "$PID_FILE"
fi
mkdir -p "$DEPLOY_DIR/logs" "$DEPLOY_DIR/.run"

# Step 4：后台启动
echo "Starting server (log: $LOG_FILE)..."
nohup node apps/api/dist/server.js >> "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
echo "Server pid: $(cat "$PID_FILE")"

# Step 5：健康检查：未登录调 /api/me 应返回 401，说明服务在跑且鉴权在工作
HEALTH_OK=0
for _ in $(seq 1 30); do
  if curl -s -o /dev/null -w "%{http_code}" "http://$HOST:$PORT/api/me" 2>/dev/null | grep -q "401"; then
    HEALTH_OK=1
    break
  fi
  sleep 1
done
if [ "$HEALTH_OK" -ne 1 ]; then
  echo "错误：30 秒内健康检查未通过，请看日志最后 50 行："
  tail -n 50 "$LOG_FILE" || true
  rm -f "$PID_FILE"
  exit 1
fi

# Step 6（可选）：nginx，失败只警告，不影响应用启动
if [ "${NGINX_ENABLED:-0}" = "1" ]; then
  echo "NGINX_ENABLED=1，尝试装 nginx 配置..."
  bash "$SCRIPT_DIR/setup-nginx.sh" || echo "警告：nginx 配置未完成，应用本身已在 http://$HOST:$PORT 跑起来，手动按 deploy/README.md 装 nginx。"
fi

echo ""
echo "启动成功！"
echo "  访问地址：http://$HOST:$PORT"
if [ "$HOST" = "127.0.0.1" ]; then echo "  本机访问：http://localhost:$PORT"; fi
echo "  日志：$LOG_FILE"
echo "  停止：bash deploy/stop.sh"
echo "  状态：bash deploy/status.sh"
echo "  更新：改完代码或 .env 后重新跑 bash deploy/start.sh 即可（会重新构建并重启）"
