#!/usr/bin/env bash
# One-shot deploy/update for the FlowCast API server. Run on the VPS:
#   cd deploy && ./deploy.sh
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "ERROR: deploy/.env not found. Create it first:" >&2
  echo "  cd deploy && cp .env.example .env && nano .env" >&2
  exit 1
fi

docker compose up -d --build

echo -n "Waiting for backend"
for _ in $(seq 1 30); do
  if docker compose exec -T backend python -c \
      "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=2)" \
      >/dev/null 2>&1; then
    echo " — healthy"
    docker compose ps
    exit 0
  fi
  echo -n "."
  sleep 2
done

echo "" >&2
echo "Backend did not become healthy in 60s. Logs:" >&2
docker compose logs --tail=50 backend >&2
exit 1
