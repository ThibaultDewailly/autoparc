# CI/CD Quick Reference

## 🚀 Quick Commands

### Local Validation (Recommended before pushing)
```bash
# Run all CI checks locally
./scripts/validate-ci.sh
```

### Backend
```bash
cd backend

# Lint
golangci-lint run

# Unit tests
go test -v ./pkg/...

# Unit tests with coverage
go test -v -coverprofile=coverage.out ./pkg/...
go tool cover -html=coverage.out

# Integration tests (requires Docker)
go test -v ./tests/integration/...

# Build
go build -o ../bin/autoparc cmd/api/main.go
```

### Frontend
```bash
cd frontend

# Lint
npm run lint

# Unit tests
npm test

# Unit tests with coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# Build
npm run build
```

## 📋 GitHub Actions Workflows

| Workflow | Triggers | Purpose |
|----------|----------|---------|
| **CI** | Push/PR to main/develop | Orchestrates all checks |
| **Backend CI** | Backend/migrations changes | Lint, test, build backend |
| **Frontend CI** | Frontend changes | Lint, test, build frontend |
| **E2E Tests** | PRs with backend/frontend changes | End-to-end integration testing |
| **Dependency Review** | Dependabot PRs | Security scanning |

## ✅ Required Checks

### Backend
- ✓ golangci-lint passes
- ✓ Unit tests pass (pkg/)
- ✓ Integration tests pass (tests/integration/)
- ✓ **Coverage ≥ 80%**
- ✓ Build succeeds

### Frontend
- ✓ ESLint passes
- ✓ Unit tests pass
- ✓ **Coverage ≥ 80%**
- ✓ TypeScript compiles
- ✓ Build succeeds

### E2E
- ✓ All Playwright tests pass
- ✓ Authentication flows work
- ✓ CRUD operations work

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Main orchestrator |
| `.github/workflows/backend.yml` | Backend pipeline |
| `.github/workflows/frontend.yml` | Frontend pipeline |
| `.github/workflows/e2e.yml` | E2E test pipeline |
| `backend/.golangci.yml` | Go linting rules |
| `frontend/.eslintrc.json` | ESLint rules |
| `.github/dependabot.yml` | Dependency updates |

## 🐛 Troubleshooting

### Lint fails
```bash
# Backend
cd backend
gofmt -w .
goimports -w .
golangci-lint run

# Frontend
cd frontend
npm run lint -- --fix
```

### Coverage below 80%
```bash
# Backend: View coverage report
go test -v -coverprofile=coverage.out ./...
go tool cover -html=coverage.out

# Frontend: View coverage report
npm run test:coverage
open coverage/index.html
```

### Build fails
```bash
# Backend
cd backend
go mod download
go mod tidy
go build -v ./...

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### E2E tests fail locally
```bash
# Start backend and frontend
docker-compose up -d
make migrate-up
cd backend && go run cmd/api/main.go &
cd frontend && npm run dev &

# Run E2E tests
cd frontend
npx playwright test --ui
```

## 📦 Artifacts

All workflows upload artifacts (30-day retention):

- **backend-unit-coverage** - Unit test coverage
- **backend-integration-coverage** - Integration test coverage
- **backend-binary** - Compiled Go binary
- **frontend-coverage** - HTML coverage report
- **frontend-dist** - Production build
- **playwright-report** - E2E test results
- **playwright-traces** - E2E test traces (on failure)

Download from: Actions → Workflow Run → Artifacts

## 🔒 Branch Protection

### Setup Instructions
1. Go to: Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - Require pull request reviews (1 approver)
   - Require status checks:
     - Backend CI / Lint
     - Backend CI / Unit Tests
     - Backend CI / Integration Tests
     - Backend CI / Build
     - Frontend CI / Lint
     - Frontend CI / Unit Tests
     - Frontend CI / Build
     - E2E Tests / End-to-End Tests
   - Require branches up to date
   - Prevent force pushes
   - Prevent deletions

## 🤝 Contributing

1. Fork and clone
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes
4. Run local validation: `./scripts/validate-ci.sh`
5. Commit: `git commit -m "feat: add feature"`
6. Push: `git push origin feature/my-feature`
7. Create Pull Request
8. Wait for CI checks to pass
9. Request review

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines.

## 📚 Documentation

- [CI/CD Guide](../CI_CD_GUIDE.md) - Complete documentation
- [Contributing Guide](../CONTRIBUTING.md) - Contribution guidelines
- [README](../README.md) - Project overview

## 🆘 Need Help?

- Check workflow logs in GitHub Actions tab
- Review [CI_CD_GUIDE.md](../CI_CD_GUIDE.md) troubleshooting section
- Open an issue with `ci/cd` label
- Ask in pull request comments
