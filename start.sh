#!/bin/sh
# start.sh — Railway startup script
# Starts vehicle data generator in background, then API server in foreground.

set -e

echo "==> Starting Fleet Manager Demo"
echo "==> PORT=${PORT:-8000}"

# Start data generator in background (sh-compatible redirect)
python -m app.generator >/tmp/generator.log 2>&1 &
GENERATOR_PID=$!
echo "==> Generator started (PID $GENERATOR_PID)"

# Start FastAPI — this keeps the container alive
exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}" \
  --workers 1
