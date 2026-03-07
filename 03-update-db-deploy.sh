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

if [ "$PM" = "pnpm" ]; then
  pnpm exec prisma migrate deploy
  pnpm exec prisma generate
else
  npx prisma migrate deploy
  npx prisma generate
fi
