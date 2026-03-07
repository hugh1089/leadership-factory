#!/usr/bin/env bash
# Mac/Linux version of 00-all-deploy.ps1
# Run from your local machine to deploy to the server.
set -e

ENV_FILE="${1:-.deploy.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE not found."
  echo "Copy .deploy.env.example to .deploy.env and fill in your values."
  exit 1
fi

export $(grep -v '^#' "$ENV_FILE" | xargs)

DEPLOY_SSH_HOST="${DEPLOY_SSH_HOST:-}"
DEPLOY_SSH_USER="${DEPLOY_SSH_USER:-root}"
DEPLOY_SERVER_DIR="${DEPLOY_SERVER_DIR:-/opt/leadership-factory}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
SSH_TARGET="${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}"

echo "== Deploy target =="
echo "SSH target:  $SSH_TARGET"
echo "Server dir:  $DEPLOY_SERVER_DIR"
echo "Branch:      $DEPLOY_BRANCH"

CMD="set -e; cd $DEPLOY_SERVER_DIR; if [ ! -f .env ]; then echo 'ERROR: .env missing on server'; exit 1; fi; sed -i.bak 's/^DEPLOY_BRANCH=.*/DEPLOY_BRANCH=$DEPLOY_BRANCH/' .env || true; bash ./00-all-deploy.sh"

echo "== Running remote deploy =="
ssh "$SSH_TARGET" "$CMD"

echo "== Done =="
