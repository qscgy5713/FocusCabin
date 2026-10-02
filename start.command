#!/bin/bash
set -e

# 切換到腳本所在目錄
cd "$(dirname "$0")"

echo "=========================================="
echo "  🚀 正在啟動 FocusCabin (Docker Compose) "
echo "=========================================="
echo ""

# 檢查 docker compose 指令可用性
if docker compose version >/dev/null 2>&1; then
    DOCKER_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
    DOCKER_CMD="docker-compose"
else
    echo "❌ 找不到 docker compose 或 docker-compose 指令，請先啟動 Docker Desktop！"
    exit 1
fi

echo "📦 正在以無快取模式編譯最新程式碼..."
$DOCKER_CMD down >/dev/null 2>&1 || true
$DOCKER_CMD build --no-cache
$DOCKER_CMD up -d --force-recreate

echo ""
echo "✅ 服務啟動成功！"
echo "🌐 服務網址：http://localhost:3000"
echo ""

# 自動開啟預設瀏覽器造訪網頁
if command -v open >/dev/null 2>&1; then
    echo "👉 正在為您開啟瀏覽器..."
    open "http://localhost:3000"
fi
