# CI/CD Pipeline Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the AutoParc project.

## Overview

The AutoParc project uses GitHub Actions for automated testing, linting, and building. The pipeline ensures code quality, prevents regressions, and maintains high test coverage.

## Workflows

### 1. Main CI Workflow (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual dispatch

**Purpose:** Orchestrates all CI checks and determines which workflows to run based on file changes.

**Jobs:**
- **changes**: Detects which parts of the codebase changed
- **backend-ci**: Runs backend CI if backend or migration files changed
- **frontend-ci**: Runs frontend CI if frontend files changed
- **e2e-tests**: Runs E2E tests on pull requests when backend/frontend changed
- **status**: Aggregates results and provides final CI status

### 2. Backend CI (`backend.yml`)

**Triggers:**
- Push/PR to `main` or `develop` with changes in:
  - `backend/**`
  - `migrations/**`
  - `.github/workflows/backend.yml`

**Jobs:**

#### Lint
- Runs `golangci-lint` with configuration from `backend/.golangci.yml`
- Checks code style, potential bugs, and best practices
- Fails on any linting errors

#### Unit Tests
- Runs all unit tests in `backend/pkg/`
- Generates code coverage report
- **Enforces 80% coverage threshold**
- Uploads coverage artifact for review

#### Integration Tests
- Starts PostgreSQL 18 service container
- Runs database migrations
- Executes integration tests in `backend/tests/integration/`
- Tests database operations and API handlers
- Uploads integration test coverage

#### Build
- Compiles the Go application
- Creates binary: `bin/autoparc`
- Uploads build artifact
- Only runs if lint and tests pass

### 3. Frontend CI (`frontend.yml`)

**Triggers:**
- Push/PR to `main` or `develop` with changes in:
  - `frontend/**`
  - `.github/workflows/frontend.yml`

**Jobs:**

#### Lint
- Runs ESLint with configuration from `frontend/.eslintrc.json`
- Checks TypeScript/React code quality
- Fails on errors or warnings exceeding max threshold

#### Unit Tests
- Runs Vitest for unit and component tests
- Generates code coverage report with Istanbul
- **Enforces 80% coverage threshold**
- Uploads HTML coverage report

#### Build
- Runs TypeScript compiler
- Builds production bundle with Vite
- Verifies no build errors
- Uploads dist/ artifact
- Only runs if lint and tests pass

### 4. E2E Tests (`e2e.yml`)

**Triggers:**
- Pull requests to `main` or `develop` (when backend/frontend changed)
- Manual dispatch

**Jobs:**

#### E2E Tests
- **Setup:**
  - Starts PostgreSQL 18 service
  - Runs database migrations
  - Builds backend binary
  - Installs frontend dependencies
  - Installs Playwright browsers
- **Execution:**
  - Starts backend server on port 8080
  - Builds and serves frontend on port 5173
  - Runs Playwright E2E tests
- **Reporting:**
  - Uploads Playwright HTML report
  - Uploads test traces on failure
  - Stops servers after tests

**Test Categories:**
- Authentication flows (login/logout)
- Car CRUD operations
- Search and filtering
- Form validations

### 5. Dependency Review (`dependency-review.yml`)

**Triggers:**
- Pull requests to `main` or `develop` from Dependabot

**Purpose:**
- Reviews dependency changes for security vulnerabilities
- Fails on high-severity vulnerabilities
- Posts summary comment on PR

### 6. Dependabot (`dependabot.yml`)

**Configuration:**
- **Go modules** (backend): Weekly updates on Mondays
- **npm packages** (frontend): Weekly updates on Mondays
- **GitHub Actions**: Weekly updates on Mondays

**Features:**
- Automatically creates PRs for dependency updates
- Limits open PRs to prevent spam
- Adds labels for easy filtering
- Follows conventional commit format

## Code Quality Standards

### Backend (Go)

**Linting Rules** (`.golangci.yml`):
- `errcheck` - Check for unchecked errors
- `gosimple` - Simplify code
- `govet` - Reports suspicious constructs
- `staticcheck` - Advanced Go linter
- `gofmt` - Check formatting
- `goimports` - Check import ordering
- `misspell` - Check spelling
- `gocritic` - Opinionated linter
- `revive` - Fast, configurable linter

**Coverage Requirement:** 80% minimum for unit tests

**Test Commands:**
```bash
cd backend

# Run unit tests
go test -v ./pkg/...

# Run with coverage
go test -v -coverprofile=coverage.out ./pkg/...
go tool cover -html=coverage.out

# Run integration tests
go test -v ./tests/integration/...

# Run linter
golangci-lint run
```

### Frontend (React/TypeScript)

**Linting Rules** (`.eslintrc.json`):
- ESLint recommended rules
- React recommended rules
- React Hooks rules
- TypeScript recommended rules
- Custom rules for unused variables and console usage

**Coverage Requirement:** 80% minimum for unit tests

**Test Commands:**
```bash
cd frontend

# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run linter
npm run lint

# Build
npm run build
```

## Branch Protection Rules

### Recommended Settings for `main` Branch

1. **Require pull request reviews before merging**
   - Required approving reviews: 1
   - Dismiss stale pull request approvals when new commits are pushed: ✓

2. **Require status checks to pass before merging**
   - Require branches to be up to date before merging: ✓
   - Status checks that are required:
     - `Backend CI / Lint`
     - `Backend CI / Unit Tests`
     - `Backend CI / Integration Tests`
     - `Backend CI / Build`
     - `Frontend CI / Lint`
     - `Frontend CI / Unit Tests`
     - `Frontend CI / Build`
     - `E2E Tests / End-to-End Tests` (for PRs)

3. **Require conversation resolution before merging**: ✓

4. **Require signed commits**: ✓ (recommended)

5. **Require linear history**: ✓ (recommended)

6. **Include administrators**: ✓ (enforce rules for everyone)

7. **Restrict who can push to matching branches**: ✓
   - Allow only maintainers

8. **Do not allow bypassing the above settings**: ✓

9. **Prevent force pushes**: ✓

10. **Prevent deletions**: ✓

### Setup Instructions

1. Go to repository **Settings** → **Branches**
2. Click **Add branch protection rule**
3. Set **Branch name pattern** to `main`
4. Configure all settings as described above
5. Click **Create** or **Save changes**

## Artifacts

All workflows upload artifacts that are retained for 30 days:

### Backend Artifacts
- `backend-unit-coverage` - Unit test coverage report
- `backend-integration-coverage` - Integration test coverage report
- `backend-binary` - Compiled Go binary

### Frontend Artifacts
- `frontend-coverage` - HTML coverage report
- `frontend-dist` - Production build

### E2E Artifacts
- `playwright-report` - E2E test results (HTML)
- `playwright-traces` - Test traces (on failure)

## Viewing Results

### On GitHub

1. Go to **Actions** tab
2. Select a workflow run
3. View job results and logs
4. Download artifacts for detailed reports

### Locally

Run the same checks locally before pushing:

```bash
# Backend
cd backend
golangci-lint run
go test -v -coverprofile=coverage.out ./...
go tool cover -func=coverage.out

# Frontend
cd frontend
npm run lint
npm run test:coverage
npm run build

# E2E (requires running backend and frontend)
cd frontend
npm run test:e2e
```

## Troubleshooting

### Common Issues

#### Backend lint fails
- Run `golangci-lint run` locally
- Fix reported issues
- Run `gofmt -w .` to format code
- Run `goimports -w .` to organize imports

#### Coverage below 80%
- Identify untested code with coverage report
- Add missing unit tests
- Ensure edge cases are covered

#### Integration tests fail
- Check PostgreSQL connection
- Verify migrations ran successfully
- Check test data setup/cleanup

#### E2E tests fail
- Verify backend and frontend are running
- Check network connectivity
- Review Playwright traces in artifacts
- Run tests locally with UI: `npx playwright test --ui`

#### Build fails
- Check for TypeScript errors
- Verify all dependencies are installed
- Review build logs for specific errors

### Getting Help

1. Check workflow logs in GitHub Actions
2. Review error messages carefully
3. Run checks locally to reproduce
4. Check [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines
5. Open an issue if problem persists

## Continuous Improvement

The CI/CD pipeline is continuously improved based on:
- Developer feedback
- Performance metrics
- New tooling availability
- Project requirements evolution

Suggestions for improvements are always welcome via pull requests or issues!
