# AutoParc - Fleet Management System

[![CI](https://github.com/goldenkiwi/autoparc/actions/workflows/ci.yml/badge.svg)](https://github.com/goldenkiwi/autoparc/actions/workflows/ci.yml)
[![Backend CI](https://github.com/goldenkiwi/autoparc/actions/workflows/backend.yml/badge.svg)](https://github.com/goldenkiwi/autoparc/actions/workflows/backend.yml)
[![Frontend CI](https://github.com/goldenkiwi/autoparc/actions/workflows/frontend.yml/badge.svg)](https://github.com/goldenkiwi/autoparc/actions/workflows/frontend.yml)
[![E2E Tests](https://github.com/goldenkiwi/autoparc/actions/workflows/e2e.yml/badge.svg)](https://github.com/goldenkiwi/autoparc/actions/workflows/e2e.yml)

AutoParc is a comprehensive web-based fleet management system designed for managing company vehicles, insurance, operators, and maintenance operations.

## 🎯 Project Overview

AutoParc helps administrative employees efficiently manage:
- **Vehicle Fleet**: Track cars with license plates, insurance, and maintenance status
- **Insurance Management**: Manage insurance companies and policies
- **Operators**: Assign vehicles to operators (company employees)
- **Accident Tracking**: Record and manage vehicle accidents with photo documentation
- **Maintenance & Repairs**: Schedule and track vehicle repairs and inspections
- **Notifications**: Automated alerts for insurance renewals, inspection deadlines, etc.

## 🏗️ Architecture

### Tech Stack

**Backend**
- Go 1.22+ (Standard library net/http with new ServeMux)
- PostgreSQL 18
- golang-migrate for database migrations
- bcrypt for password hashing
- Session-based authentication with HTTP-only cookies

**Frontend**
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Next UI (component library)
- React Router (navigation)
- TanStack Query (data fetching & caching)
- React Hook Form (form management)

**Infrastructure**
- Docker & Docker Compose (local development)
- GitHub Actions (CI/CD)
- Automated testing pipeline

### Project Structure

```
autoparc/
├── backend/           # Go API server
│   ├── cmd/api/       # Application entry point
│   ├── internal/      # Private application code
│   └── pkg/           # Public utilities
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── services/
│   └── public/
├── migrations/        # Database migration files
└── .github/workflows/ # CI/CD pipelines
```

## 🚀 Getting Started

### Prerequisites

- **Go 1.22 or higher**: [Download Go](https://go.golang.org/dl/)
- **Node.js 18+ and npm**: [Download Node.js](https://nodejs.org/)
- **Docker and Docker Compose**: [Download Docker](https://docs.docker.com/get-docker/)
- **golang-migrate tool** (optional, for manual migrations): 
  ```bash
  # macOS
  brew install golang-migrate
  
  # Linux
  curl -L https://github.com/golang-migrate/migrate/releases/download/v4.17.0/migrate.linux-amd64.tar.gz | tar xvz
  sudo mv migrate /usr/local/bin/
  
  # Or use Docker (no installation needed)
  # See database setup instructions below
  ```

### Quick Start

Follow these steps to get AutoParc running locally:

#### 1. Clone the Repository
```bash
git clone https://github.com/goldenkiwi/autoparc.git
cd autoparc
```

#### 2. Start the Databases

Start both development and test PostgreSQL databases using Docker Compose:

```bash
docker-compose up -d
```

This will start:
- **Development database** on `localhost:5432`
  - Database: `autoparc_dev`
  - User: `autoparc`
  - Password: `autoparc_dev_password`
  
- **Test database** on `localhost:5433`
  - Database: `autoparc_test`
  - User: `autoparc_test`
  - Password: `autoparc_test_password`

Verify the databases are running:
```bash
docker-compose ps
```

Check database health:
```bash
# Development database
docker exec -it autoparc_postgres pg_isready -U autoparc -d autoparc_dev

# Test database
docker exec -it autoparc_postgres_test pg_isready -U autoparc_test -d autoparc_test
```

#### 3. Set Up the Backend

```bash
cd backend

# Copy environment configuration
cp .env.example .env

# Review and edit .env if needed (default values should work for local development)
# nano .env  # or use your preferred editor

# Download Go dependencies
go mod download

# Run database migrations (when available)
# make migrate-up

# Start the API server
go run cmd/api/main.go
```

The backend API will be available at `http://localhost:8080`

#### 4. Set Up the Frontend

Open a new terminal window:

```bash
cd frontend

# Copy environment configuration
cp .env.example .env

# Review .env (default values should work for local development)
# nano .env  # or use your preferred editor

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

#### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **API Health Check**: http://localhost:8080/health (when implemented)

### Environment Configuration

#### Backend (.env)

The backend uses the following environment variables (see `backend/.env.example`):

- **Database**: Connection settings for PostgreSQL
- **Server**: Port, host, and CORS configuration
- **Session**: Cookie settings for authentication
- **Environment**: Development/production mode

Default values in `.env.example` are configured to work with the Docker Compose setup.

#### Frontend (.env)

The frontend uses these environment variables (see `frontend/.env.example`):

- **VITE_API_URL**: Backend API base URL (default: `http://localhost:8080`)
- **VITE_API_BASE_PATH**: API version path (default: `/api/v1`)

### Stopping the Development Environment

```bash
# Stop the databases (keeps data)
docker-compose stop

# Stop and remove containers (keeps data in volumes)
docker-compose down

# Stop and remove everything including volumes (⚠️ deletes all data)
docker-compose down -v
```

## 🧪 Testing

AutoParc has comprehensive test coverage for both frontend and backend.

### Frontend Tests

**Unit Tests**: 56 tests covering utilities and components
- Validators (22 tests, 100% coverage)
- Formatters (11 tests, 100% coverage)
- LoginForm (7 tests, 96.7% coverage)
- Pagination (9 tests, 100% coverage)
- SearchBar (4 tests, 100% coverage)
- FilterPanel (3 tests, 100% coverage)

**E2E Tests**: 16 Playwright tests covering critical user workflows
- Authentication flow (login, logout, protected routes)
- Car CRUD operations
- Search and filtering
- Form validation

#### Running Frontend Tests

```bash
cd frontend

# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests (requires backend running)
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e -- --ui
```

#### Test Documentation

For detailed testing information, see:
- **[TESTING_SUMMARY.md](TESTING_SUMMARY.md)**: Comprehensive testing overview and coverage reports
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)**: Quick start guide with common commands and troubleshooting

### Backend Tests

Backend test coverage details coming soon.

```bash
cd backend

# Run unit tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run integration tests
make test-integration
```

## 🎯 MVP Status

**Current Phase**: Phase 4 - Frontend Development ✅

**Completed**:
- ✅ Project setup and infrastructure
- ✅ Database design and migrations
- ✅ Backend API (all CRUD endpoints)
- ✅ Frontend UI (all pages and components)
- ✅ Authentication flow
- ✅ Unit tests (56 tests passing)
- ✅ E2E test infrastructure (16 tests ready)

**Next Steps**:
- CI/CD pipeline refinement
- Final documentation
- Production deployment preparation

See [todo_MVP](todo_MVP) for complete task breakdown.

# Stop and remove containers + volumes (deletes all data)
docker-compose down -v
```

### Troubleshooting

**Database connection issues:**
```bash
# Check if containers are running
docker-compose ps

# View database logs
docker-compose logs postgres
docker-compose logs postgres_test

# Restart databases
docker-compose restart postgres postgres_test
```

**Port conflicts:**
- If port 5432 is already in use, modify `docker-compose.yml` to use different ports
- If port 8080 is in use, change `SERVER_PORT` in `backend/.env`
- If port 5173 is in use, Vite will automatically try the next available port

**Go module issues:**
```bash
cd backend
go mod tidy
go mod download
```

**Node module issues:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 📝 Development

### Running Tests

**Backend**
```bash
cd backend
go test ./... -v
go test ./... -cover
```

**Frontend**
```bash
cd frontend
npm run test
npm run test:coverage
```

### Database Migrations

```bash
# Create a new migration
make migrate-create name=create_users_table

# Run migrations
make migrate-up

# Rollback migrations
make migrate-down
```

### Code Quality

- **Backend**: Follow Go idioms and standard practices
- **Frontend**: Use TypeScript, follow React best practices, use functional components
- **Testing**: Maintain 80%+ test coverage
- **Commits**: Use conventional commit messages

## 🔒 Security

- Session-based authentication with HTTP-only cookies
- CSRF protection with SameSite cookies
- XSS protection
- SQL injection prevention with parameterized queries
- Bcrypt password hashing
- Environment-based configuration (no secrets in code)

## 📦 Deployment

AutoParc can be deployed to any server or cloud platform that supports Go binaries and static file hosting.

### Quick Deployment

```bash
# 1. Build backend
./scripts/build-backend.sh

# 2. Build frontend
./scripts/build-frontend.sh

# 3. Setup production database
./scripts/setup-production-db.sh
```

### Detailed Documentation

- **[Deployment Guide](DEPLOYMENT_GUIDE.md)**: Complete production deployment instructions
- **[Quick Reference](DEPLOYMENT_QUICK_REFERENCE.md)**: Commands and cheat sheet for deployment

### What's Included

- ✅ Production-ready backend binary (statically linked)
- ✅ Optimized frontend bundle (Vite production build)
- ✅ Database migration scripts
- ✅ Environment variable templates
- ✅ Systemd service configuration
- ✅ Nginx configuration examples
- ✅ Health check endpoints
- ✅ Backup and monitoring guidelines

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes with tests
3. Ensure all tests pass
4. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Team

Developed and maintained by the AutoParc team.

---

**Current Status**: 🚧 MVP Development in Progress

See [todo_MVP](./todo_MVP) for detailed implementation checklist.
