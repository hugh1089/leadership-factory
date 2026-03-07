#!/usr/bin/env bash
# This script checks the repo and saves basic deploy settings.
set -e

STATE_FILE="/tmp/lf-deploy-state"

echo "== LOAD ENV =="
if [ ! -f .env ]; then
  echo "ERROR: .env missing"
  exit 1
fi

set -a
. ./.env
set +a

APP_ENV="${APP_ENV:-production}"
APP_NAME="${APP_NAME:-leadership-factory-${APP_ENV}}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"

if [ -z "${PORT:-}" ]; then
  echo "ERROR: PORT is missing in .env"
  exit 1
fi

if [ -z "${HOST:-}" ]; then
  if [ "$APP_ENV" = "staging" ]; then
    HOST="staging.leadership-factory.cn"
  else
    HOST="assessment-platform.leadership-factory.cn"
  fi
fi

echo "== PRECHECK: repo + branch =="
git remote -v
echo "Deploy branch: $DEPLOY_BRANCH"
if ! git show-ref --verify --quiet "refs/remotes/origin/$DEPLOY_BRANCH"; then
  echo "ERROR: remote branch origin/$DEPLOY_BRANCH does not exist"
  exit 1
fi

BEFORE="$(git rev-parse HEAD)"
echo "Before: $BEFORE"

# This saves values so later steps can read them.
cat > "$STATE_FILE" <<STATE
APP_ENV=$APP_ENV
APP_NAME=$APP_NAME
PORT=$PORT
HOST=$HOST
DEPLOY_BRANCH=$DEPLOY_BRANCH
BEFORE=$BEFORE
STATE

echo "Saved deploy state to $STATE_FILE"
