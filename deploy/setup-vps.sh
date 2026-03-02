#!/usr/bin/env bash
# deploy/setup-vps.sh
#
# One-shot VPS provisioning script for Fleet Manager Demo.
# Tested on Ubuntu 22.04 LTS.
# Run as a non-root user with sudo privileges:
#
#   chmod +x deploy/setup-vps.sh
#   DOMAIN=fleet.yourdomain.com EMAIL=admin@yourdomain.com ./deploy/setup-vps.sh

set -euo pipefail

DOMAIN="${DOMAIN:-fleet-manager-demo.skakun-ml.com}"
EMAIL="${EMAIL:-admin@yourdomain.com}"
APP_DIR="${APP_DIR:-/var/www/fleet-manager}"
VENV_DIR="$APP_DIR/backend/.venv"
DB_PATH="${DB_PATH:-$APP_DIR/backend/fleet.db}"

echo "================================================"
echo " Fleet Manager VPS Setup"
echo " Domain : $DOMAIN"
echo " App dir: $APP_DIR"
echo "================================================"

# ── 1. System packages ────────────────────────────────────────────────────────
echo "[1/7] Installing system packages..."
sudo apt-get update -y
sudo apt-get install -y \
  nginx \
  certbot python3-certbot-nginx \
  python3.12 python3.12-venv python3-pip \
  nodejs npm \
  git curl ufw sqlite3

# ── 2. Firewall ───────────────────────────────────────────────────────────────
echo "[2/7] Configuring UFW firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
# Explicitly block direct access to backend port from outside
sudo ufw deny 7767/tcp
sudo ufw --force enable

# ── 3. Clone / update repository ─────────────────────────────────────────────
echo "[3/7] Deploying application files..."
if [ -d "$APP_DIR/.git" ]; then
  sudo git -C "$APP_DIR" pull --ff-only
else
  sudo git clone https://github.com/OleksandrUK911/Fleet-Manager-Demo "$APP_DIR"
fi
sudo chown -R "$USER:$USER" "$APP_DIR"

# ── 4. Python backend ─────────────────────────────────────────────────────────
echo "[4/7] Setting up Python environment..."
python3.12 -m venv "$VENV_DIR"
"$VENV_DIR/bin/pip" install --upgrade pip
"$VENV_DIR/bin/pip" install -r "$APP_DIR/backend/requirements.txt"

# Apply Alembic migrations
cd "$APP_DIR/backend"
"$VENV_DIR/bin/alembic" upgrade head

# ── 5. React frontend + Landing page ─────────────────────────────────────────
echo "[5/7] Building React admin frontend..."
cd "$APP_DIR/frontend"
npm ci --legacy-peer-deps
CREATE_REACT_APP_ENV=production npm run build

echo "[5b/7] Building landing page (Vite)..."
cd "$APP_DIR/website"
npm ci
npm run build

# ── 6. Nginx + SSL (Let's Encrypt) ───────────────────────────────────────────
echo "[6/7] Configuring Nginx and SSL..."
# Replace placeholder domain in config (already filled in, kept for flexibility)
sed "s/fleet-manager-demo.skakun-ml.com/$DOMAIN/g" \
  "$APP_DIR/deploy/nginx-ssl.conf" \
  | sudo tee /etc/nginx/sites-available/fleet-manager > /dev/null

# Swap the root path too
sudo sed -i "s|/var/www/fleet-manager|$APP_DIR|g" \
  /etc/nginx/sites-available/fleet-manager

sudo ln -sf \
  /etc/nginx/sites-available/fleet-manager \
  /etc/nginx/sites-enabled/fleet-manager
sudo rm -f /etc/nginx/sites-enabled/default

# Obtain SSL certificate
sudo certbot --nginx \
  -d "$DOMAIN" \
  --non-interactive \
  --agree-tos \
  --email "$EMAIL" \
  --redirect

sudo nginx -t && sudo systemctl reload nginx

# ── 7. Systemd services ───────────────────────────────────────────────────────
echo "[7/7] Installing systemd services..."

# Backend (FastAPI via uvicorn)
sudo tee /etc/systemd/system/fleet-backend.service > /dev/null <<EOF
[Unit]
Description=Fleet Manager Backend (FastAPI + Uvicorn)
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR/backend
EnvironmentFile=$APP_DIR/backend/.env
ExecStart=$VENV_DIR/bin/uvicorn app.main:app --host 127.0.0.1 --port 7767 --workers 2
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Data generator
sed "s|/path/to/app|$APP_DIR|g; s|/path/to/venv|$VENV_DIR|g; s|your-user|$USER|g" \
  "$APP_DIR/deploy/fleet-generator.service" \
  | sudo tee /etc/systemd/system/fleet-generator.service > /dev/null

sudo systemctl daemon-reload
sudo systemctl enable --now fleet-backend fleet-generator

echo ""
echo "✅ Setup complete!"
echo "   Backend : systemctl status fleet-backend"
echo "   Generator: systemctl status fleet-generator"
echo "   SSL auto-renewal is handled by certbot timer: systemctl status certbot.timer"
echo "   App URL : https://$DOMAIN"
