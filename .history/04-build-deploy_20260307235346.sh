#!/usr/bin/env bash
# This script installs deps if needed and builds the app.
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

NPM_REGISTRY="${NPM_REGISTRY:-https://registry.npmjs.org}"

# This picks npm or pnpm based on the lockfile in the repo.
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

# This installs dependencies with the selected package manager.
install_deps() {
  PM="$1"
  if [ "$PM" = "pnpm" ]; then
    pnpm install --frozen-lockfile --registry "$NPM_REGISTRY"
    return
  fi
  npm ci --registry "$NPM_REGISTRY"
}

# This runs the app build command with the selected package manager.
build_app() {
  PM="$1"
  if [ "$PM" = "pnpm" ]; then
    pnpm build
    return
  fi
  npm run build
}

PM="$(detect_package_manager)"
echo "Package manager: $PM"

# If this is a fresh server, node_modules may not exist yet.
if [ "${CHANGED_DEPS:-0}" -eq 1 ] || [ ! -d node_modules ]; then
  echo "Deps changed (or node_modules missing) -> installing"
  install_deps "$PM"
else
  echo "Deps unchanged -> skipping install"
fi

rm -rf .next
build_app "$PM"

if [ -d .next/standalone ]; then
  mkdir -p .next/standalone/.next
  rm -rf .next/standalone/.next/static
  cp -R .next/static .next/standalone/.next/static

  if [ -d public ]; then
    rm -rf .next/standalone/public
    cp -R public .next/standalone/public
  fi
fi
