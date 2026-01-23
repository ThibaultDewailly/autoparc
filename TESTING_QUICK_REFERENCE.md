# Testing Quick Reference Guide

## Quick Commands

### Backend Tests

```bash
# Run all unit tests with coverage
cd backend && go test -v -race -coverprofile=coverage.out ./pkg/...

# View coverage report
go tool cover -html=coverage.out

# Run integration tests (requires database)
docker compose up -d postgres_test
go test -v ./tests/integration/...
```

### Frontend Tests

```bash
cd frontend

# Run all unit tests
npm test -- --run

# Run tests in watch mode
npm test

# Run with coverage
npm run test:coverage -- --run

# Run E2E tests (requires backend API running)
npm run test:e2e

# Run E2E with UI
npm run test:e2e:ui
```

### Full CI Validation

```bash
# From project root - runs all tests
./scripts/validate-ci.sh
```

## Test Coverage Summary

### Backend
- **Coverage**: 89.5%
- **Tests**: 26 unit + 15 integration
- **Framework**: Go testing + pgx

### Frontend
- **Coverage**: 90.35%
- **Tests**: 154 unit + 19 E2E
- **Framework**: Vitest + Playwright

## Common Issues

### E2E Tests Failing
**Problem**: Backend API not running
**Solution**:
```bash
# Terminal 1: Start backend
cd backend
export DB_HOST=localhost DB_PORT=5436 DB_USER=autoparc \
  DB_PASSWORD=autoparc_dev_password DB_NAME=autoparc_dev \
  SERVER_PORT=8080
./bin/api

# Terminal 2: Run E2E tests
cd frontend
npm run test:e2e
```

### Integration Tests Failing
**Problem**: Database not running
**Solution**:
```bash
docker compose up -d postgres_test
```

### TypeScript Errors
**Problem**: Missing type declarations
**Solution**:
```bash
cd frontend
npm install --save-dev @types/node
```

## Test Files Location

```
backend/
  pkg/utils/
    *.test.go          # Unit tests
  tests/integration/
    *_test.go          # Integration tests

frontend/
  src/
    **/*.test.tsx      # Component unit tests
    **/*.test.ts       # Service/utility tests
  e2e/
    *.spec.ts          # E2E tests
```

## Coverage Thresholds

- Minimum required: **80%**
- Backend achieved: **89.5%** ✅
- Frontend achieved: **90.35%** ✅
