#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "=========================================="
echo "  🛑 正在停止 FocusCabin Docker 服務...   "
echo "=========================================="

if docker compose version >/dev/null 2>&1; then
    docker compose down
elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose down
else
    echo "❌ 找不到 Docker 指令"
    exit 1
fi

echo "✅ FocusCabin 容器已停止！"
