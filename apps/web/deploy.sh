#!/usr/bin/env bash
#
# 一键部署 @reno/web 到 1Panel 静态站点
# 流程: 构建 → tar 打包(正斜杠)→ scp 上传 → ssh 远程解压覆盖 → 清理
#
# 用法:
#   bash deploy.sh                      # 用默认 SSH 别名 aliyun 部署
#   DEPLOY_SSH=other-host bash deploy.sh   # 临时换一个 SSH 别名/主机
#
# 前提:本机已配置好 SSH 别名 aliyun(能 `ssh aliyun` 直连服务器)。
# 用户、端口、密钥等都在 ~/.ssh/config 的 aliyun 段里统一管理。

set -euo pipefail

# ====== 配置(按需修改,也可用同名环境变量覆盖)======
# SSH 别名或 user@host;走 ~/.ssh/config 里的别名最省事
REMOTE_SSH="aliyun"
REMOTE_DIR="/opt/1panel/www/sites/reno.lijiakai.com/index"
SITE_URL="https://reno.lijiakai.com/"
# =====================================================

REMOTE_SSH="${DEPLOY_SSH:-$REMOTE_SSH}"
REMOTE_DIR="${DEPLOY_DIR:-$REMOTE_DIR}"
SITE_URL="${DEPLOY_URL:-$SITE_URL}"

# 安全检查:目标目录不能为空,防止误删
if [ -z "$REMOTE_DIR" ] || [ "$REMOTE_DIR" = "/" ]; then
  echo "✗ REMOTE_DIR 配置异常($REMOTE_DIR),已中止。"; exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

TAR_NAME="reno-web-dist.tar"
REMOTE_TMP="/tmp/${TAR_NAME}"

echo "==> 1/4  构建生产产物 (vp run build)"
vp run build

echo "==> 2/4  打包 dist (tar, 正斜杠路径, 兼容 Linux)"
# --exclude 防止把 tar 自身打进去;-C dist . 让包内路径从根开始
tar -cf "$TAR_NAME" --exclude="$TAR_NAME" -C dist .

echo "==> 3/4  上传到服务器 (scp -> $REMOTE_TMP)"
scp -q "$TAR_NAME" "$REMOTE_SSH:$REMOTE_TMP"

echo "==> 4/4  服务器端解压覆盖并清理"
# heredoc 中的 $REMOTE_DIR / $REMOTE_TMP / $FILE_OWNER 在本地展开后传给远程执行
FILE_OWNER="${DEPLOY_OWNER:-root}"
ssh "$REMOTE_SSH" bash -s <<EOF
set -euo pipefail
# 清空目标目录旧文件(保留目录本身)
find "$REMOTE_DIR" -mindepth 1 -delete
# 解压新产物到目标目录
tar -xf "$REMOTE_TMP" -C "$REMOTE_DIR"
# 统一文件所有者(OpenResty 以 root 运行;scp 上传的文件所有者是 Windows UID,这里修正)
chown -R "$FILE_OWNER":"$FILE_OWNER" "$REMOTE_DIR"
# 删除服务器临时 tar
rm -f "$REMOTE_TMP"
echo "   服务器端部署完成"
EOF

# 清理本地 tar
rm -f "$TAR_NAME"

echo ""
echo "✅ 部署成功!访问: $SITE_URL"
echo "   (浏览器请 Ctrl+F5 强制刷新以跳过缓存)"
