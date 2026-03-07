#!/usr/bin/env bash
# This script always runs safe database update commands.
set -e

STATE_FILE="/tmp/lf-deploy-state"
if [ ! -f "$STATE_FILE" ]; then
  echo "ERROR: deploy state missing, run 01-set-up-environment-deploy.sh first"
  exit 1
fi

set -a
. "$STATE_FILE"
set +a

echo "== LOAD ENV =="
if [ ! -f .env ]; then
  echo "ERROR: .env missing"
  exit 1
fi

set -a
. ./.env
set +a

# Select package manager from lockfile.
detect_package_manager() {
  if [ -f pnpm-lock.yaml ]; then
    echo "pnpm"
    return
  fi
  if [ -f package-lock.json ]; then
    echo "npm"
    return
  fi
  echo "npm"
}

echo "== RUN DB MIGRATIONS =="
PM="$(detect_package_manager)"
echo "Package manager: $PM"

# 必须先安装依赖，确保使用项目内的 Prisma 5.x（npx 会拉取最新 7.x 导致不兼容）
echo "Installing deps (required for Prisma)..."
if [ "$PM" = "pnpm" ]; then
  pnpm install --frozen-lockfile
else
  npm ci
fi

# 使用 node_modules 内的 prisma，避免 npx 拉取最新版
PRISMA_BIN="./node_modules/.bin/prisma"
if [ ! -f "$PRISMA_BIN" ]; then
  echo "ERROR: Prisma not found in node_modules. Run npm ci first."
  exit 1
fi
"$PRISMA_BIN" migrate deploy
"$PRISMA_BIN" generate
