# Dockerfile (root) — Fleet Manager Demo — Railway deployment
#
# Stage 1: Build the React admin SPA
# Stage 2: Python FastAPI backend + built frontend served at /app/

# ── Stage 1: Node — build admin frontend ─────────────────────────────────────
FROM node:20-slim AS frontend-build

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ ./
ENV CI=false
RUN npm run build

# ── Stage 2: Python — FastAPI backend ────────────────────────────────────────
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ .

# Copy built React app into the location FastAPI serves from /app/
COPY --from=frontend-build /frontend/build ./static/frontend
# manifest.json must be accessible at /manifest.json (CRA PWA requirement)
COPY --from=frontend-build /frontend/build/manifest.json ./static/frontend/manifest.json

# Startup script (sh-compatible: no bash-isms like &>)
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Railway injects $PORT at runtime; default 8000 for local docker run
EXPOSE 8000

CMD ["/start.sh"]
