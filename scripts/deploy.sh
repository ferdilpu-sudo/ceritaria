#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/ceritaria/current}"
SERVICE="${SERVICE:-ceritaria}"
cd "$APP_DIR"

git pull --ff-only
npm ci --no-audit --no-fund
npm run lint
npm run typecheck
npm run test
npm run build
sudo systemctl restart "$SERVICE"
sleep 2
curl --fail --silent http://127.0.0.1:3000/api/health >/dev/null
echo "Ceritaria deploy sukses dan health check OK."
