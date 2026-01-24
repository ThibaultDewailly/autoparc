#!/bin/bash

################################################################################
# AutoParc Infrastructure Bootstrap Script
# VM: 192.168.1.22
# 
# This script automates the setup of the AutoParc infrastructure.
# Must be run as root.
#
# Usage: bash bootstrap_system.sh
################################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    log_error "This script must be run as root"
    exit 1
fi

log_info "Starting AutoParc infrastructure bootstrap..."

################################################################################
# Phase 1: Initial VM Setup
################################################################################
log_info "Phase 1: Initial VM Setup"

log_info "Updating system packages..."
apt update && apt upgrade -y

log_info "Installing essential tools..."
apt install -y curl wget vim git htop net-tools build-essential pwgen

log_info "Generating secure passwords..."
DB_PASSWORD=$(pwgen -s 10)
SESSION_SECRET=$(pwgen -s 10)

log_info "Saving credentials to /root/.autoparc_credentials (KEEP THIS SECURE!)..."
cat > /root/.autoparc_credentials <<EOF
# AutoParc Generated Credentials
# Generated: $(date)
# KEEP THIS FILE SECURE - Contains sensitive passwords

DB_PASSWORD=$DB_PASSWORD
SESSION_SECRET=$SESSION_SECRET

# PostgreSQL Connection String:
# postgresql://autoparc_user:$DB_PASSWORD@localhost:5432/autoparc_prod
EOF
chmod 600 /root/.autoparc_credentials
log_info "Credentials saved to /root/.autoparc_credentials"

log_info "Setting timezone to Europe/Paris..."
timedatectl set-timezone Europe/Paris

log_info "System info:"
cat /etc/os-release
uname -a

################################################################################
# Phase 1.2: Create Application Users
################################################################################
log_info "Creating application users..."

# Create autoparc user (service account, no login)
if id "autoparc" &>/dev/null; then
    log_warn "User 'autoparc' already exists"
else
    adduser --shell /bin/false --disabled-password --gecos "" autoparc
    log_info "Created autoparc user (service account)"
fi

# Create dockerdev user (development/testing)
if id "dockerdev" &>/dev/null; then
    log_warn "User 'dockerdev' already exists"
else
    adduser --disabled-password --gecos "" dockerdev
    log_info "Created dockerdev user"
fi

# Setup SSH directory for dockerdev
su - dockerdev -c "mkdir -p /home/dockerdev/.ssh"
su - dockerdev -c "chmod 700 /home/dockerdev/.ssh"
log_info "SSH directory created for dockerdev (add your public key to /home/dockerdev/.ssh/authorized_keys)"

################################################################################
# Phase 2: Docker Installation
################################################################################
log_info "Phase 2: Docker Installation"

log_info "Removing old Docker versions (if any)..."
apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

log_info "Installing Docker prerequisites..."
apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

log_info "Adding Docker GPG key..."
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

log_info "Setting up Docker repository..."
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list

log_info "Installing Docker..."
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

log_info "Verifying Docker installation..."
docker --version
docker compose version

log_info "Adding dockerdev to docker group..."
usermod -aG docker dockerdev

log_info "Configuring Docker daemon..."
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

log_info "Enabling and starting Docker..."
systemctl restart docker
systemctl enable docker

log_info "Testing Docker (run 'docker run hello-world' as dockerdev user manually)"

################################################################################
# Phase 3: PostgreSQL 18 Installation
################################################################################
log_info "Phase 3: PostgreSQL 18 Installation"

log_info "Adding PostgreSQL APT repository..."
apt install -y postgresql-common
/usr/share/postgresql-common/pgdg/apt.postgresql.org.sh -y

log_info "Installing PostgreSQL 18..."
apt install -y postgresql-18 postgresql-contrib-18

log_info "Verifying PostgreSQL installation..."
psql --version
systemctl status postgresql --no-pager

log_info "Configuring PostgreSQL databases and user..."
su - postgres -c "psql" <<EOF
CREATE DATABASE autoparc_prod;
CREATE USER autoparc_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE autoparc_prod TO autoparc_user;
ALTER DATABASE autoparc_prod OWNER TO autoparc_user;
CREATE DATABASE autoparc_test;
GRANT ALL PRIVILEGES ON DATABASE autoparc_test TO autoparc_user;
ALTER DATABASE autoparc_test OWNER TO autoparc_user;
\q
EOF

log_info "PostgreSQL databases and user configured successfully"
log_warn "Manual steps required:"
log_warn "1. Edit /etc/postgresql/18/main/postgresql.conf - set listen_addresses = 'localhost, 192.168.1.22'"
log_warn "2. Edit /etc/postgresql/18/main/pg_hba.conf - add:"
log_warn "   host    autoparc_prod    autoparc_user    127.0.0.1/32    scram-sha-256"
log_warn "   host    autoparc_prod    autoparc_user    192.168.1.22/32    scram-sha-256"
log_warn "3. Restart: systemctl restart postgresql"

################################################################################
# Phase 4: Development Tools Installation
################################################################################
log_info "Phase 4: Development Tools Installation"

log_info "Downloading and installing Go 1.25..."
cd /tmp
wget -q https://go.dev/dl/go1.25.0.linux-amd64.tar.gz
rm -rf /usr/local/go
tar -C /usr/local -xzf go1.25.0.linux-amd64.tar.gz

log_info "Setting up Go PATH..."
echo 'export PATH=$PATH:/usr/local/go/bin' > /etc/profile.d/go.sh
source /etc/profile.d/go.sh

log_info "Verifying Go installation..."
/usr/local/go/bin/go version

log_info "Installing golang-migrate..."
export PATH=$PATH:/usr/local/go/bin
export GOPATH=/root/go
/usr/local/go/bin/go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

log_info "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

log_info "Verifying Node.js installation..."
node --version
npm --version

log_info "Installing PM2..."
npm install -g pm2

################################################################################
# Phase 5: Web Server Setup (Nginx)
################################################################################
log_info "Phase 5: Web Server Setup (Nginx)"

log_info "Installing Nginx..."
apt install -y nginx

log_info "Verifying Nginx installation..."
nginx -v

log_info "Installing SSL snakeoil certificates..."
apt install -y ssl-cert

log_info "Creating Nginx configuration for AutoParc with SSL..."
cat > /etc/nginx/sites-available/autoparc <<'EOF'
# HTTP server - redirect to HTTPS
server {
    listen 80;
    server_name 192.168.1.22;
    
    # Keep port 80 accessible for initial setup and redirects
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS server with SSL
server {
    listen 443 ssl;
    server_name 192.168.1.22;

    # SSL configuration using snakeoil certificates
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
    
    # SSL protocols and ciphers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Frontend
    location / {
        root /var/www/autoparc/frontend;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

log_info "Enabling AutoParc site..."
ln -sf /etc/nginx/sites-available/autoparc /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

log_info "Testing Nginx configuration..."
nginx -t

log_info "Reloading Nginx..."
systemctl reload nginx
systemctl enable nginx

################################################################################
# Phase 5.3: Create Application Directories
################################################################################
log_info "Creating application directories..."
mkdir -p /var/www/autoparc/{frontend,backend}
chown -R autoparc:autoparc /var/www/autoparc
log_info "Application directories created at /var/www/autoparc"

################################################################################
# Phase 6: SSL/TLS Setup (Optional - Skipped for MVP)
################################################################################
log_info "Phase 6: SSL/TLS Setup"
log_info "Installing Certbot (skipping configuration for MVP)..."
apt install -y certbot python3-certbot-nginx
log_warn "SSL/TLS not configured. For production, run: certbot --nginx -d yourdomain.com"

################################################################################
# Phase 7: Application Deployment Setup
################################################################################
log_info "Phase 7: Application Deployment Setup"

log_info "Creating systemd service for AutoParc API..."
cat > /etc/systemd/system/autoparc-api.service <<'EOF'
[Unit]
Description=AutoParc API Server
After=network.target postgresql.service

[Service]
Type=simple
User=autoparc
WorkingDirectory=/var/www/autoparc/backend
ExecStart=/var/www/autoparc/backend/autoparc-api
Restart=on-failure
RestartSec=5s
Environment="DATABASE_URL=postgresql://autoparc_user:$DB_PASSWORD@localhost:5432/autoparc_prod?sslmode=disable"
Environment="PORT=8080"
Environment="SESSION_SECRET=$SESSION_SECRET"
Environment="SESSION_MAX_AGE=604800"
Environment="CORS_ORIGIN=http://192.168.1.22"
Environment="ENV=production"

[Install]
WantedBy=multi-user.target
EOF

log_info "Reloading systemd..."
systemctl daemon-reload

log_info "Enabling autoparc-api service..."
systemctl enable autoparc-api
log_warn "Service will not start until binary is deployed"

################################################################################
# Phase 8: Monitoring & Logging
################################################################################
log_info "Phase 8: Monitoring & Logging"

log_info "Creating log directory..."
mkdir -p /var/log/autoparc
chown autoparc:autoparc /var/log/autoparc

log_info "Setting up log rotation..."
cat > /etc/logrotate.d/autoparc <<'EOF'
/var/log/autoparc/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
EOF

log_info "Installing monitoring tools..."
apt install -y htop iotop

################################################################################
# Phase 9: Backup Setup
################################################################################
log_info "Phase 9: Backup Setup"

log_info "Creating backup directory..."
mkdir -p /var/backups/autoparc
chown autoparc:autoparc /var/backups/autoparc

log_info "Creating backup script..."
cat > /root/backup-autoparc.sh <<'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/autoparc"

# Backup database
PGPASSWORD='$DB_PASSWORD' pg_dump -h localhost -U autoparc_user -d autoparc_prod | gzip > "$BACKUP_DIR/autoparc_prod_$DATE.sql.gz"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "autoparc_prod_*.sql.gz" -mtime +7 -delete

echo "Backup completed: autoparc_prod_$DATE.sql.gz"
EOF

chmod +x /root/backup-autoparc.sh
log_info "Backup script created at /root/backup-autoparc.sh"
log_warn "Add to crontab: 0 2 * * * /root/backup-autoparc.sh >> /var/log/autoparc/backup.log 2>&1"

################################################################################
# Phase 10: Security Hardening
################################################################################
log_info "Phase 10: Security Hardening"

log_info "Installing fail2ban..."
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban

log_info "Setting up unattended upgrades..."
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

log_warn "SSH hardening: Edit /etc/ssh/sshd_config manually to:"
log_warn "  - Set PermitRootLogin no"
log_warn "  - Set PasswordAuthentication no"
log_warn "  - Then restart: systemctl restart sshd"

################################################################################
# Phase 11: Deployment Script
################################################################################
log_info "Phase 11: Creating Deployment Script"

cat > /root/deploy-autoparc.sh <<'EOF'
#!/bin/bash
set -e

echo "Starting AutoParc deployment..."

# Variables (adjust as needed)
REPO_DIR="/home/dockerdev/autoparc-repo"
DATABASE_URL="postgresql://autoparc_user:$DB_PASSWORD@localhost:5432/autoparc_prod?sslmode=disable"

# Pull latest code
echo "Pulling latest code..."
cd $REPO_DIR
git pull origin main

# Build backend
echo "Building backend..."
cd backend
/usr/local/go/bin/go build -o autoparc-api ./cmd/api

# Run migrations
echo "Running database migrations..."
~/go/bin/migrate -path ./migrations -database "$DATABASE_URL" up

# Copy backend binary
echo "Deploying backend..."
cp autoparc-api /var/www/autoparc/backend/
chown autoparc:autoparc /var/www/autoparc/backend/autoparc-api
chmod +x /var/www/autoparc/backend/autoparc-api

# Build frontend
echo "Building frontend..."
cd ../frontend
npm ci
npm run build

# Copy frontend files
echo "Deploying frontend..."
rm -rf /var/www/autoparc/frontend/*
cp -r dist/* /var/www/autoparc/frontend/
chown -R autoparc:autoparc /var/www/autoparc/frontend

# Restart backend service
echo "Restarting backend service..."
systemctl restart autoparc-api

# Reload Nginx
echo "Reloading Nginx..."
systemctl reload nginx

echo "Deployment completed successfully!"
echo "Backend status:"
systemctl status autoparc-api --no-pager
EOF

chmod +x /root/deploy-autoparc.sh
log_info "Deployment script created at /root/deploy-autoparc.sh"

################################################################################
# Bootstrap Complete
################################################################################
log_info "================================================================"
log_info "AutoParc Infrastructure Bootstrap Complete!"
log_info "================================================================"
echo ""
log_info "Next Manual Steps:"
echo ""
log_warn "1. Complete PostgreSQL configuration (see Phase 3 warnings above)"
log_warn "2. Add SSH public key to /home/dockerdev/.ssh/authorized_keys"
log_warn "3. Set up cron job for backups: 0 2 * * * /root/backup-autoparc.sh >> /var/log/autoparc/backup.log 2>&1"
log_warn "4. Harden SSH configuration in /etc/ssh/sshd_config"
log_warn "5. Reboot the system: reboot"
echo ""
log_info "IMPORTANT: Credentials saved to /root/.autoparc_credentials"
log_warn "Review this file and store passwords securely, then consider deleting it."
echo ""
log_info "After reboot, verify with:"
log_info "  systemctl status postgresql nginx docker"
log_info "  docker ps (as dockerdev user)"
echo ""
log_info "Ready to proceed with MVP development!"
