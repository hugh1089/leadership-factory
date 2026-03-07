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

# 必须先安装依赖（04 会用到），且确保 Prisma 在 node_modules
if [ ! -d node_modules ] || [ ! -f node_modules/.bin/prisma ]; then
  echo "Installing deps (required for Prisma)..."
  if [ "$PM" = "pnpm" ]; then
    pnpm install --frozen-lockfile
  else
    npm ci
  fi
fi

# 强制使用 Prisma 5.x（npx prisma 会拉取 7.x 导致 schema 不兼容）
npx prisma@5.22.0 migrate deploy
npx prisma@5.22.0 generate
