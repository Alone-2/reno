#!/usr/bin/env bash
# 本地部署示例：
# DEPLOY_SSH=aliyun \
# DEPLOY_DIR=/opt/1panel/www/sites/reno.lijiakai.com/index \
# DEPLOY_URL=https://reno.lijiakai.com/ \
# bash scripts/deploy-web.sh
#
# CI 已提前构建时可额外设置 SKIP_BUILD=1。

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WEB_DIR="$REPO_ROOT/apps/web"
LOCAL_ARCHIVE="$WEB_DIR/reno-web-dist.tar"

DEPLOY_SSH="${DEPLOY_SSH:-}"
DEPLOY_DIR="${DEPLOY_DIR:-}"
DEPLOY_ROOT="${DEPLOY_ROOT:-/opt/1panel/www/sites}"
DEPLOY_OWNER="${DEPLOY_OWNER:-root}"
DEPLOY_URL="${DEPLOY_URL:-}"
SKIP_BUILD="${SKIP_BUILD:-0}"
RELEASE_ID="${DEPLOY_RELEASE:-${GITHUB_SHA:-$(date -u +%Y%m%d%H%M%S)}}"

fail() {
  echo "✗ $*" >&2
  exit 1
}

[[ -n "$DEPLOY_SSH" ]] || fail "必须设置 DEPLOY_SSH"
[[ -n "$DEPLOY_DIR" ]] || fail "必须设置 DEPLOY_DIR"
[[ "$DEPLOY_DIR" == /* && "$DEPLOY_DIR" != "/" ]] || fail "DEPLOY_DIR 必须是非根绝对路径"
[[ "$DEPLOY_ROOT" == /* && "$DEPLOY_ROOT" != "/" ]] || fail "DEPLOY_ROOT 必须是非根绝对路径"
[[ "$DEPLOY_DIR" == "$DEPLOY_ROOT"/* ]] || fail "DEPLOY_DIR 必须位于 $DEPLOY_ROOT 下"
[[ "$DEPLOY_DIR" =~ ^[A-Za-z0-9._/-]+$ ]] || fail "DEPLOY_DIR 包含不支持的字符"
[[ "$DEPLOY_ROOT" =~ ^[A-Za-z0-9._/-]+$ ]] || fail "DEPLOY_ROOT 包含不支持的字符"
[[ "$DEPLOY_OWNER" =~ ^[A-Za-z0-9._-]+$ ]] || fail "DEPLOY_OWNER 格式不合法"
[[ "$RELEASE_ID" =~ ^[A-Za-z0-9._-]+$ ]] || fail "DEPLOY_RELEASE 格式不合法"
[[ "$SKIP_BUILD" == "0" || "$SKIP_BUILD" == "1" ]] || fail "SKIP_BUILD 只能是 0 或 1"

REMOTE_ARCHIVE="/tmp/reno-web-dist-${RELEASE_ID}.tar"

cleanup_local() {
  rm -f "$LOCAL_ARCHIVE"
}
trap cleanup_local EXIT

if [[ "$SKIP_BUILD" == "0" ]]; then
  echo "==> 1/4 构建 Web"
  (cd "$REPO_ROOT" && vp run web#build)
else
  echo "==> 1/4 使用现有 Web 构建产物"
fi

[[ -f "$WEB_DIR/dist/index.html" ]] || fail "未找到 apps/web/dist/index.html"

echo "==> 2/4 打包 Web 产物"
tar -cf "$LOCAL_ARCHIVE" -C "$WEB_DIR/dist" .

echo "==> 3/4 上传发布包"
scp -q "$LOCAL_ARCHIVE" "$DEPLOY_SSH:$REMOTE_ARCHIVE"

echo "==> 4/4 切换线上版本"
ssh "$DEPLOY_SSH" bash -s -- \
  "$DEPLOY_DIR" \
  "$DEPLOY_ROOT" \
  "$DEPLOY_OWNER" \
  "$RELEASE_ID" \
  "$REMOTE_ARCHIVE" <<'REMOTE'
set -Eeuo pipefail

DEPLOY_DIR="$1"
DEPLOY_ROOT="$2"
DEPLOY_OWNER="$3"
RELEASE_ID="$4"
REMOTE_ARCHIVE="$5"
STAGE_DIR="${DEPLOY_DIR}.release-${RELEASE_ID}"
BACKUP_DIR="${DEPLOY_DIR}.backup-${RELEASE_ID}"

[[ "$DEPLOY_DIR" == /* && "$DEPLOY_DIR" != "/" ]] || exit 20
[[ "$DEPLOY_ROOT" == /* && "$DEPLOY_ROOT" != "/" ]] || exit 21
[[ "$DEPLOY_DIR" == "$DEPLOY_ROOT"/* ]] || exit 22
[[ "$STAGE_DIR" == "${DEPLOY_DIR}.release-"* ]] || exit 23
[[ "$BACKUP_DIR" == "${DEPLOY_DIR}.backup-"* ]] || exit 24
[[ "$RELEASE_ID" =~ ^[A-Za-z0-9._-]+$ ]] || exit 25
[[ "$REMOTE_ARCHIVE" == "/tmp/reno-web-dist-${RELEASE_ID}.tar" ]] || exit 26
test -f "$REMOTE_ARCHIVE" || exit 27

cleanup_remote() {
  rm -f "$REMOTE_ARCHIVE"
}
trap cleanup_remote EXIT

rm -rf "$STAGE_DIR" "$BACKUP_DIR"
mkdir -p "$STAGE_DIR"
tar -xf "$REMOTE_ARCHIVE" -C "$STAGE_DIR"
test -f "$STAGE_DIR/index.html"
chown -R "$DEPLOY_OWNER:$DEPLOY_OWNER" "$STAGE_DIR"

if [[ -e "$DEPLOY_DIR" || -L "$DEPLOY_DIR" ]]; then
  mv "$DEPLOY_DIR" "$BACKUP_DIR"
fi

if mv "$STAGE_DIR" "$DEPLOY_DIR"; then
  rm -rf "$BACKUP_DIR"
else
  if [[ -e "$BACKUP_DIR" || -L "$BACKUP_DIR" ]]; then
    mv "$BACKUP_DIR" "$DEPLOY_DIR"
  fi
  exit 28
fi

echo "服务器端部署完成"
REMOTE

echo "✅ 部署成功${DEPLOY_URL:+：$DEPLOY_URL}"
