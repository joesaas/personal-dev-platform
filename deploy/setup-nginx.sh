#!/usr/bin/env bash
# 装 nginx 配置（由 start.sh 在 NGINX_ENABLED=1 时调用，也可单独跑：bash deploy/setup-nginx.sh）
# 失败只打印手动命令，不让应用启动失败；本机没有 nginx 时直接警告退出。
set -uo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib.sh"
load_env >/dev/null 2>&1 || true
DOMAIN="${DOMAIN:-}"

if ! command -v nginx >/dev/null 2>&1; then
  echo "警告：本机找不到 nginx，跳过 nginx 配置；应用本身已在跑，装好 nginx 后再跑 bash deploy/setup-nginx.sh。"
  exit 0
fi

TMP_CONF="$(mktemp)"
trap 'rm -f "$TMP_CONF"' EXIT
if [ -n "$DOMAIN" ]; then
  sed "s/server_name _;/server_name $DOMAIN;/" "$SCRIPT_DIR/dev-platform.conf" > "$TMP_CONF"
else
  cp "$SCRIPT_DIR/dev-platform.conf" "$TMP_CONF"
fi

TARGET=""
if [ -d /etc/nginx/sites-enabled ]; then
  TARGET="/etc/nginx/sites-enabled/dev-platform.conf"
elif [ -d /etc/nginx/conf.d ]; then
  TARGET="/etc/nginx/conf.d/dev-platform.conf"
else
  echo "警告：找不到 /etc/nginx/sites-enabled 或 conf.d，请手动把 deploy/dev-platform.conf 拷到你的 nginx 配置目录，再跑 nginx -t 并 reload。"
  exit 0
fi

if ! sudo cp "$TMP_CONF" "$TARGET" 2>/dev/null && ! cp "$TMP_CONF" "$TARGET" 2>/dev/null; then
  echo "警告：拷 nginx 配置到 $TARGET 失败（可能需要 sudo），请手动跑："
  echo "  sudo cp deploy/dev-platform.conf $TARGET && sudo nginx -t && sudo systemctl reload nginx"
  exit 0
fi

if sudo nginx -t 2>/dev/null || nginx -t 2>/dev/null; then
  if sudo systemctl reload nginx 2>/dev/null || sudo nginx -s reload 2>/dev/null; then
    echo "nginx 已装好并 reload：$TARGET"
  else
    echo "警告：nginx -t 通过但 reload 失败，请手动 reload nginx。"
  fi
else
  echo "警告：nginx -t 未通过，请手动检查 $TARGET 后再 reload（应用本身不受影响）。"
fi
