#!/usr/bin/env bash
# This script runs all deploy steps in order on the server.
set -e

bash ./01-set-up-environment-deploy.sh
bash ./02-update-code-deploy.sh
bash ./03-update-db-deploy.sh
bash ./04-build-deploy.sh
bash ./05-start-app-deploy.sh
bash ./06-health-checks-deploy.sh
