#!/usr/bin/env bash
# This script restarts the app in PM2 on the right port.
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

if [ -z "${APP_NAME:-}" ]; then
  echo "ERROR: APP_NAME is missing in .env"
  exit 1
fi

if [ -z "${PORT:-}" ]; then
  echo "ERROR: PORT is missing in .env"
  exit 1
fi

pm2 flush "$APP_NAME" || true
echo "stop as late as possible"
pm2 stop "$APP_NAME" || true

pm2 delete "$APP_NAME" || true
pm2 start npm --name "$APP_NAME" -- run start -- -p "$PORT"
pm2 save
