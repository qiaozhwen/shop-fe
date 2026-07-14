#!/usr/bin/env bash
# 服务器端手动部署脚本（GitHub Actions SSH 步骤的兜底/手动版）
#
# 用法：
#   1) 首次：复制本脚本到服务器 ~/deploy.sh
#      chmod +x ~/deploy.sh
#   2) 编辑下面的 REGISTRY / NAMESPACE / IMAGE / 用户名 等
#   3) 执行：./deploy.sh           # 拉 latest 并重启
#           ./deploy.sh <sha7>     # 回滚到某个历史版本

set -euo pipefail

# ====== 按需修改 ======
REGISTRY="${REGISTRY:-registry.cn-hangzhou.aliyuncs.com}"
NAMESPACE="${NAMESPACE:-qz-shop}"
IMAGE_NAME="${IMAGE_NAME:-shop-fe}"
CONTAINER_NAME="${CONTAINER_NAME:-shop-fe}"
HOST_PORT="${HOST_PORT:-80}"
# 凭证：建议用环境变量传入，避免落盘
#   export REGISTRY_USERNAME=xxx REGISTRY_PASSWORD=xxx
# ======================

TAG="${1:-latest}"
IMAGE="${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${TAG}"

echo "==> 登录镜像仓库 ${REGISTRY}"
if [[ -n "${REGISTRY_PASSWORD:-}" ]]; then
  echo "${REGISTRY_PASSWORD}" | docker login "${REGISTRY}" -u "${REGISTRY_USERNAME}" --password-stdin
else
  docker login "${REGISTRY}"
fi

echo "==> 拉取镜像 ${IMAGE}"
docker pull "${IMAGE}"

echo "==> 停止并移除旧容器 ${CONTAINER_NAME}（若存在）"
docker rm -f "${CONTAINER_NAME}" 2>/dev/null || true

docker network inspect shop-network >/dev/null 2>&1 || docker network create shop-network

echo "==> 启动新容器"
docker run -d \
  --name "${CONTAINER_NAME}" \
  --network shop-network \
  --restart unless-stopped \
  -p "${HOST_PORT}:80" \
  "${IMAGE}"

echo "==> 清理悬挂镜像"
docker image prune -f

echo "==> 当前运行容器："
docker ps --filter "name=${CONTAINER_NAME}"

echo "==> 完成，访问 http://<服务器IP>:${HOST_PORT}"
