# AutoParc Deployment Guide

This guide provides instructions for deploying the AutoParc application to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying AutoParc, ensure you have:

- **PostgreSQL 18+** database server
- **Linux server** (or compatible OS) for backend
- **Web server** (Nginx, Apache, or CDN) for frontend
- **golang-migrate** tool for database migrations
- **Domain name** with DNS configured (optional but recommended)
- **SSL certificates** (optional but recommended for production)

## Environment Setup

### 1. Backend Environment Variables

Create a `.env.production` file in the backend directory:

```bash
cp backend/.env.production.example backend/.env.production
```

Edit `.env.production` and update the following variables:

```bash
# Server Configuration
SERVER_PORT=8080
ENVIRONMENT=production
ALLOWED_ORIGIN=https://your-production-domain.com
SERVER_READ_TIMEOUT=10s
SERVER_WRITE_TIMEOUT=10s
SERVER_SHUTDOWN_TIMEOUT=30s

# Database Configuration
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USER=autoparc_admin
DB_PASSWORD=YOUR_SECURE_PASSWORD_HERE
DB_NAME=autoparc
DB_SSLMODE=require
DB_MAX_OPEN_CONNS=25
DB_MAX_IDLE_CONNS=5
DB_CONN_MAX_LIFETIME=5m

# Session Configuration
SESSION_COOKIE_NAME=autoparc_session
SESSION_COOKIE_MAX_AGE=86400
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAMESITE=Strict
SESSION_COOKIE_PATH=/
```

**Security Notes:**
- Use a strong, random password for `DB_PASSWORD`
- Set `SESSION_COOKIE_SECURE=true` when using HTTPS
- Set `DB_SSLMODE=require` for production databases
- Update `ALLOWED_ORIGIN` to match your frontend domain

### 2. Frontend Environment Variables

Create a `.env.production` file in the frontend directory:

```bash
cp frontend/.env.production.example frontend/.env.production
```

Edit `.env.production`:

```bash
# API Configuration
VITE_API_URL=https://api.your-production-domain.com
VITE_API_TIMEOUT=10000

# App Configuration
VITE_APP_NAME=AutoParc
VITE_APP_VERSION=1.0.0
```

**Important:** Update `VITE_API_URL` to point to your backend API endpoint.

## Database Setup

### 1. Prepare the Database

The database setup script will create the database, run migrations, and seed initial data.

```bash
# From the project root
cd backend
source .env.production
cd ..
./scripts/setup-production-db.sh
```

The script will:
- Test database connectivity
- Create the `autoparc` database (if it doesn't exist)
- Run all migrations
- Seed initial data (admin user and insurance companies)

### 2. Verify Database Setup

Connect to the database and verify tables exist:

```bash
psql -h $DB_HOST -U $DB_USER -d $DB_NAME

# List all tables
\dt

# Check admin user exists
SELECT email, first_name, last_name FROM administrative_employees;

# Exit
\q
```

You should see:
- `administrative_employees`
- `sessions`
- `insurance_companies`
- `cars`
- `action_logs`

### 3. Default Admin Credentials

The seed data creates a default admin user:

- **Email:** `admin@autoparc.local`
- **Password:** `admin123`

⚠️ **IMPORTANT:** Change this password immediately after first login!

## Backend Deployment

### 1. Build the Backend Binary

```bash
./scripts/build-backend.sh
```

This will:
- Run all tests
- Build an optimized, statically-linked binary
- Output: `backend/bin/api` (~10MB)

### 2. Deploy the Binary

Copy the binary and environment file to your production server:

```bash
# Example using scp
scp backend/bin/api user@your-server:/opt/autoparc/
scp backend/.env.production user@your-server:/opt/autoparc/.env
```

### 3. Run the Backend

On your production server:

```bash
cd /opt/autoparc
export $(grep -v '^#' .env | xargs)
./api
```

The API will start on the port specified in `SERVER_PORT` (default: 8080).

### 4. Setup as a System Service

Create a systemd service file for automatic startup:

```bash
sudo nano /etc/systemd/system/autoparc-api.service
```

```ini
[Unit]
Description=AutoParc API Server
After=network.target postgresql.service

[Service]
Type=simple
User=autoparc
WorkingDirectory=/opt/autoparc
EnvironmentFile=/opt/autoparc/.env
ExecStart=/opt/autoparc/api
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable autoparc-api
sudo systemctl start autoparc-api
sudo systemctl status autoparc-api
```

View logs:

```bash
sudo journalctl -u autoparc-api -f
```

## Frontend Deployment

### 1. Build the Frontend

```bash
./scripts/build-frontend.sh
```

This will:
- Run all tests
- Build an optimized production bundle
- Output: `frontend/dist/` (~1MB)

### 2. Deploy to Web Server

#### Option A: Nginx

Copy files to your web server:

```bash
scp -r frontend/dist/* user@your-server:/var/www/autoparc/
```

Nginx configuration example:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL certificates
    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;
    
    root /var/www/autoparc;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache static assets
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

#### Option B: Static Hosting (Netlify, Vercel, S3)

Most static hosting platforms can serve the frontend:

1. **Netlify/Vercel:** Connect your repository or upload the `dist` folder
2. **AWS S3 + CloudFront:** Upload to S3 bucket and configure CloudFront
3. **GitHub Pages:** Deploy from the `dist` folder

**Important:** Configure the `_redirects` file for SPA routing:

```bash
echo "/*    /index.html   200" > frontend/dist/_redirects
```

## Monitoring and Maintenance

### Health Check Endpoint

The backend provides a health check endpoint:

```bash
curl https://api.your-domain.com/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "AutoParc API is running"
}
```

### Database Backups

Set up automated backups:

```bash
# Create backup script
cat > /opt/autoparc/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/autoparc/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $BACKUP_DIR/autoparc_$DATE.sql
# Keep only last 7 days of backups
find $BACKUP_DIR -name "autoparc_*.sql" -mtime +7 -delete
EOF

chmod +x /opt/autoparc/backup.sh
```

Add to crontab:

```bash
# Backup daily at 2 AM
0 2 * * * /opt/autoparc/backup.sh
```

### Log Rotation

Configure log rotation for the API service:

```bash
sudo nano /etc/logrotate.d/autoparc
```

```
/var/log/autoparc/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 autoparc autoparc
    sharedscripts
    postrotate
        systemctl reload autoparc-api > /dev/null 2>&1 || true
    endscript
}
```

## Troubleshooting

### Backend Won't Start

1. **Check environment variables:**
   ```bash
   systemctl status autoparc-api
   journalctl -u autoparc-api -n 50
   ```

2. **Verify database connectivity:**
   ```bash
   psql -h $DB_HOST -U $DB_USER -d $DB_NAME
   ```

3. **Check port availability:**
   ```bash
   sudo netstat -tlnp | grep 8080
   ```

### Frontend Not Loading

1. **Check browser console** for errors
2. **Verify API URL** in network tab
3. **Check CORS configuration** on backend
4. **Verify web server configuration**

### Database Connection Issues

1. **Check PostgreSQL is running:**
   ```bash
   sudo systemctl status postgresql
   ```

2. **Verify firewall rules:**
   ```bash
   sudo ufw status
   # Allow PostgreSQL port if needed
   sudo ufw allow 5432/tcp
   ```

3. **Check PostgreSQL authentication:**
   ```bash
   sudo nano /etc/postgresql/18/main/pg_hba.conf
   ```

### Session Issues

1. **Verify cookie settings** match your domain
2. **Check HTTPS is enabled** if `SESSION_COOKIE_SECURE=true`
3. **Clear browser cookies** and try again

## Deployment Checklist

Before going live:

- [ ] Update all environment variables with production values
- [ ] Change default admin password
- [ ] Set up database backups
- [ ] Configure SSL/TLS certificates (if using HTTPS)
- [ ] Set up monitoring and alerting
- [ ] Test all CRUD operations
- [ ] Test authentication flow
- [ ] Verify CORS configuration
- [ ] Set up log rotation
- [ ] Document server access credentials
- [ ] Create disaster recovery plan

## Security Best Practices

1. **Use strong passwords** for database and admin accounts
2. **Enable SSL/TLS** for all connections
3. **Keep software updated** (PostgreSQL, OS, dependencies)
4. **Restrict database access** to application server only
5. **Use firewall rules** to limit exposed ports
6. **Monitor logs** for suspicious activity
7. **Regular security audits** and penetration testing
8. **Backup encryption** for sensitive data

## Support

For issues or questions:
- Check the [main README](README.md)
- Review [TESTING_GUIDE.md](TESTING_GUIDE.md)
- Check application logs
- Review CI/CD pipeline results

---

**Version:** 1.0.0  
**Last Updated:** January 23, 2026
