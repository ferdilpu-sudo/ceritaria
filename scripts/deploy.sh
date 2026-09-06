#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/ceritaria/current}"
SERVICE="${SERVICE:-ceritaria}"
ENV_FILE="${ENV_FILE:-/etc/ceritaria/ceritaria.env}"
cd "$APP_DIR"

git pull --ff-only
npm ci --no-audit --no-fund

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

npm run lint
npm run typecheck
npm run test
npm run build
sudo systemctl restart "$SERVICE"
sleep 2
curl --fail --silent http://127.0.0.1:3100/api/health >/dev/null
echo "Ceritaria deploy sukses dan health check OK."
