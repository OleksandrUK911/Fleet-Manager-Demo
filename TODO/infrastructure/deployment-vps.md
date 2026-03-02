# VPS Deployment

> Provisioning, Nginx, systemd, SSL, backups.
> Scripts: `deploy/setup-vps.sh`, `deploy/nginx-ssl.conf`

---

## Planned

_(nothing pending)_

---

## In Progress

- 🔄 Obtain SSL certificate via Certbot Let's Encrypt on VPS (depends on domain DNS propagation)

---

## Done

### Web Server
- ✅ Nginx config: serves React static files + proxies `/api/` to FastAPI
- ✅ HTTP → HTTPS redirect in `deploy/nginx-ssl.conf`
- ✅ TLS 1.2 / 1.3 only (`ssl_protocols TLSv1.2 TLSv1.3`)
- ✅ SSL certificate auto-renewal via Certbot systemd timer (installed by `setup-vps.sh`)

### Process Management
- ✅ systemd unit file for Gunicorn + Uvicorn
- ✅ `start_backend.sh` for local and production startup
- ✅ `deploy/fleet-generator.service` — generator as separate systemd service
- ✅ `deploy/setup-vps.sh` — full VPS provisioning automation

### Firewall
- ✅ UFW rules: allow ports 80, 443 only; port 7767 blocked for external traffic

### Backups
- ✅ `deploy/backup-db.sh` — gzip database backup, 7-day retention, cron-compatible
