#!/usr/bin/env bash
# This script updates code and records what changed.
set -e

STATE_FILE="/tmp/lf-deploy-state"
if [ ! -f "$STATE_FILE" ]; then
  echo "ERROR: deploy state missing, run 01-set-up-environment-deploy.sh first"
  exit 1
fi

set -a
. "$STATE_FILE"
set +a

echo "== UPDATE CODE =="
git fetch --prune origin
if ! git diff-index --quiet HEAD --; then
  if [ -t 0 ]; then
    read -r -p "Uncommitted changes found. Continue and discard them? (y/n) " ANSWER
    if [ "$ANSWER" != "y" ] && [ "$ANSWER" != "Y" ]; then
      echo "Stopped to protect local changes."
      exit 1
    fi
  else
    AUTO_DISCARD_NON_INTERACTIVE="${AUTO_DISCARD_NON_INTERACTIVE:-1}"
    if [ "$AUTO_DISCARD_NON_INTERACTIVE" != "1" ]; then
      echo "ERROR: Uncommitted changes found and AUTO_DISCARD_NON_INTERACTIVE!=1"
      exit 1
    fi
    echo "Uncommitted changes found; auto-discarding in non-interactive mode."
  fi
fi
if [ -z "${DEPLOY_BRANCH:-}" ]; then
  echo "ERROR: DEPLOY_BRANCH missing in deploy state"
  exit 1
fi
git reset --hard "origin/$DEPLOY_BRANCH"

AFTER="$(git rev-parse HEAD)"
echo "After:  $AFTER"
git log -1 --oneline

if [ "$BEFORE" = "$AFTER" ]; then
  echo "No new commits (continuing anyway)."
fi

echo "== DETECT WHAT CHANGED =="
CHANGED_DEPS=0
CHANGED_DB=0

git diff --name-only "$BEFORE" "$AFTER" | grep -qE '^(package\.json|package-lock\.json|pnpm-lock\.yaml)$' && CHANGED_DEPS=1 || true
git diff --name-only "$BEFORE" "$AFTER" | grep -qE '^prisma/(schema\.prisma|migrations/)' && CHANGED_DB=1 || true

echo "Deps changed: $CHANGED_DEPS"
echo "DB changed:   $CHANGED_DB"

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

echo "${DATABASE_URL:-}" | sed 's/:[^@]*@/:***@/'

# This updates the saved state for later steps.
cat > "$STATE_FILE" <<STATE
APP_ENV=$APP_ENV
APP_NAME=$APP_NAME
PORT=$PORT
HOST=$HOST
DEPLOY_BRANCH=$DEPLOY_BRANCH
BEFORE=$BEFORE
AFTER=$AFTER
CHANGED_DEPS=$CHANGED_DEPS
CHANGED_DB=$CHANGED_DB
STATE
