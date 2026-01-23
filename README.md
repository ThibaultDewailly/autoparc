# AutoParc - Fleet Management System

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

- Go 1.22 or higher
- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL 18 (or use Docker)
- golang-migrate tool

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/goldenkiwi/autoparc.git
   cd autoparc
   ```

2. **Start the database**
   ```bash
   docker-compose up -d postgres
   ```

3. **Set up the backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   go mod download
   make migrate-up
   go run cmd/api/main.go
   ```

4. **Set up the frontend**
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with your configuration
   npm install
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080

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

Deployment instructions will be added as the project progresses.

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
