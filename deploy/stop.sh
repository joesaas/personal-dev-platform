#!/usr/bin/env bash
# 停止个人开发平台：bash deploy/stop.sh
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib.sh"

if ! is_running; then
  echo "Not running (no live pid file)."
  rm -f "$PID_FILE"
  exit 0
fi
PID="$(cat "$PID_FILE")"
echo "Stopping pid $PID..."
kill "$PID" 2>/dev/null || true
for _ in $(seq 1 10); do
  is_running || break
  sleep 1
done
if is_running; then kill -9 "$PID" 2>/dev/null || true; fi
rm -f "$PID_FILE"
echo "Stopped."
