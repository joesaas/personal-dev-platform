#!/usr/bin/env bash
# 查看个人开发平台状态：bash deploy/status.sh
set -uo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib.sh"
load_env >/dev/null 2>&1 || true
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-3001}"

if is_running; then
  echo "Running, pid $(cat "$PID_FILE")."
else
  echo "Not running."
fi
echo -n "Health check http://$HOST:$PORT/api/me -> "
curl -s -o /dev/null -w "%{http_code}\n" "http://$HOST:$PORT/api/me" 2>/dev/null || echo "unreachable"
echo "--- last 20 log lines ($LOG_FILE) ---"
tail -n 20 "$LOG_FILE" 2>/dev/null || echo "(no log yet)"
