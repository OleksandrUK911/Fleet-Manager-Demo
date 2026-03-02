#!/bin/bash
# start_backend.sh — Start the FastAPI backend with Gunicorn + Uvicorn workers
#
# Usage:
#   chmod +x start_backend.sh
#   ./start_backend.sh
#
# This script should be run from the /backend directory.
# For production, use a systemd service instead (see README.md).

# Navigate to the backend directory (change this path if needed)
cd "$(dirname "$0")/backend"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Number of Gunicorn worker processes
# Rule of thumb: (2 × CPU cores) + 1
WORKERS=${GUNICORN_WORKERS:-3}

echo "Starting Fleet Manager API with $WORKERS workers..."

gunicorn app.main:app \
    --workers "$WORKERS" \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 127.0.0.1:7767 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info
