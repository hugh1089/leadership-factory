#!/usr/bin/env bash
# This script checks that the app is up and routed by Nginx.
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

if [ -z "${APP_NAME:-}" ] || [ -z "${PORT:-}" ] || [ -z "${HOST:-}" ]; then
  echo "ERROR: APP_NAME, PORT, or HOST missing"
  exit 1
fi

HEALTHCHECK_PATH="${HEALTHCHECK_PATH:-/api/health}"
PUBLIC_CHECK_URL="${PUBLIC_CHECK_URL:-}"

echo "== HEALTH CHECKS =="
pm2 list
echo "Local app check (with retry): http://127.0.0.1:$PORT$HEALTHCHECK_PATH"
LOCAL_OK=0
for i in $(seq 1 20); do
  if curl -fsS "http://127.0.0.1:$PORT$HEALTHCHECK_PATH" >/dev/null; then
    LOCAL_OK=1
    break
  fi
  sleep 2
done

if [ "$LOCAL_OK" -ne 1 ]; then
  echo "ERROR: Local app health check failed after retries"
  exit 1
fi

curl -sS -i "http://127.0.0.1:$PORT$HEALTHCHECK_PATH" | head -n 30

echo "Nginx host check over HTTP: Host=$HOST"
curl -sS -i -H "Host: $HOST" "http://127.0.0.1$HEALTHCHECK_PATH" | head -n 30

if [ -n "$PUBLIC_CHECK_URL" ]; then
  echo "Public URL check: $PUBLIC_CHECK_URL"
  if ! curl -fsS "$PUBLIC_CHECK_URL" >/dev/null; then
    echo "ERROR: Public URL check failed"
    exit 1
  fi
  curl -sS -i "$PUBLIC_CHECK_URL" | head -n 30
fi

pm2 logs "$APP_NAME" --lines 30 --nostream
