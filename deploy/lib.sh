#!/usr/bin/env bash
# 部署脚本共用函数：只被其他脚本 source，不直接执行。
# 用 bash 调用，不要依赖可执行位。
DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$DEPLOY_DIR/.." && pwd)"
PID_FILE="$DEPLOY_DIR/.run/dev-platform.pid"
LOG_FILE="$DEPLOY_DIR/logs/dev-platform.log"

# 找 .env：优先仓库根 .env，其次 deploy/.env，最后 ~/.config/dev-platform/dev-platform.env
find_env_file() {
  if [ -f "$ROOT_DIR/.env" ]; then echo "$ROOT_DIR/.env"; return 0; fi
  if [ -f "$DEPLOY_DIR/.env" ]; then echo "$DEPLOY_DIR/.env"; return 0; fi
  if [ -f "$HOME/.config/dev-platform/dev-platform.env" ]; then echo "$HOME/.config/dev-platform/dev-platform.env"; return 0; fi
  return 1
}

load_env() {
  local env_file
  if env_file="$(find_env_file)"; then
    echo "Using env file: $env_file"
    set -a
    # shellcheck disable=SC1090
    . "$env_file"
    set +a
  else
    echo "No .env found."
    return 1
  fi
}

is_running() {
  [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null
}
