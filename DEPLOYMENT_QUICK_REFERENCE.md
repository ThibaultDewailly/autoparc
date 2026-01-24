# AutoParc Deployment Quick Reference

Quick commands and steps for deploying AutoParc to production.

## Quick Deploy Checklist

```bash
# 1. Setup environment variables
cp backend/.env.production.example backend/.env.production
cp frontend/.env.production.example frontend/.env.production
# Edit both files with production values

# 2. Setup database
./scripts/setup-production-db.sh

# 3. Build backend
./scripts/build-backend.sh
# Output: backend/bin/api

# 4. Build frontend
./scripts/build-frontend.sh
# Output: frontend/dist/

# 5. Deploy backend
scp backend/bin/api user@server:/opt/autoparc/
scp backend/.env.production user@server:/opt/autoparc/.env

# 6. Deploy frontend
scp -r frontend/dist/* user@server:/var/www/autoparc/

# 7. Start backend
ssh user@server
cd /opt/autoparc
export $(grep -v '^#' .env | xargs)
./api
```

## Environment Variables

### Backend (.env.production)
```bash
SERVER_PORT=8080
ENVIRONMENT=production
ALLOWED_ORIGIN=https://your-domain.com
DB_HOST=db-server
DB_PASSWORD=your-secure-password
DB_NAME=autoparc
DB_SSLMODE=require
SESSION_COOKIE_SECURE=true
```

### Frontend (.env.production)
```bash
VITE_API_URL=https://api.your-domain.com
```

## Build Commands

```bash
# Backend (produces backend/bin/api)
./scripts/build-backend.sh

# Frontend (produces frontend/dist/)
./scripts/build-frontend.sh

# Database setup
./scripts/setup-production-db.sh
```

## Run Commands

```bash
# Backend (development)
cd backend
export DB_PASSWORD=yourpass
export ALLOWED_ORIGIN=http://localhost:5173
./bin/api

# Frontend (development)
cd frontend
npm run dev

# Frontend preview (production build)
cd frontend
npm run preview
```

## Systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/autoparc-api.service

# Enable and start
sudo systemctl enable autoparc-api
sudo systemctl start autoparc-api

# Check status and logs
sudo systemctl status autoparc-api
sudo journalctl -u autoparc-api -f
```

## Health Checks

```bash
# Backend health
curl http://localhost:8080/health

# Database connection
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT version();"

# Test login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@autoparc.local","password":"admin123"}'
```

## Database Commands

```bash
# Connect to database
psql -h $DB_HOST -U $DB_USER -d $DB_NAME

# Check tables
\dt

# Check admin user
SELECT email FROM administrative_employees;

# Run migrations manually
migrate -path ./migrations -database "postgres://..." up

# Rollback last migration
migrate -path ./migrations -database "postgres://..." down 1
```

## Backup & Restore

```bash
# Backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > backup.sql

# Restore
psql -h $DB_HOST -U $DB_USER -d $DB_NAME < backup.sql
```

## Nginx Configuration

```nginx
# Frontend
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    root /var/www/autoparc;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# API Reverse Proxy (optional)
server {
    listen 443 ssl http2;
    server_name api.your-domain.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Troubleshooting

```bash
# Check backend logs
sudo journalctl -u autoparc-api -n 100 --no-pager

# Check if backend is running
ps aux | grep api
netstat -tlnp | grep 8080

# Check database connection
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1;"

# Check disk space
df -h

# Check memory usage
free -h

# Test API endpoints
curl -v http://localhost:8080/health
curl -v http://localhost:8080/api/v1/cars
```

## Default Credentials

- **Email:** admin@autoparc.local
- **Password:** admin123

⚠️ **Change immediately after first login!**

## Important Files

```
autoparc/
├── backend/
│   ├── bin/api                    # Production binary
│   └── .env.production            # Backend environment
├── frontend/
│   ├── dist/                      # Production build
│   └── .env.production            # Frontend environment
├── migrations/                     # Database migrations
└── scripts/
    ├── build-backend.sh           # Build backend
    ├── build-frontend.sh          # Build frontend
    └── setup-production-db.sh     # Setup database
```

## Port Reference

- **Backend API:** 8080 (configurable via SERVER_PORT)
- **Frontend Dev:** 5173 (Vite default)
- **Frontend Preview:** 4173 (Vite preview)
- **PostgreSQL:** 5432 (standard)

## Quick Tests

```bash
# Test backend build
cd backend && go test ./... -v

# Test frontend build
cd frontend && npm run test:coverage -- --run

# Test E2E (requires running services)
cd frontend && npm run test:e2e
```

---

For detailed instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
