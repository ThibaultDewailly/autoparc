# Contributing to AutoParc

Thank you for your interest in contributing to AutoParc! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Requirements](#testing-requirements)
6. [Commit Messages](#commit-messages)
7. [Pull Request Process](#pull-request-process)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the project's technical standards

## Getting Started

### Prerequisites

Before you start contributing, ensure you have:

1. **Go 1.25.0+** installed
2. **Node.js 20+** and npm
3. **Docker** and Docker Compose
4. **git** for version control
5. Read the [README.md](./README.md) for project setup

### Setup Your Development Environment

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/autoparc.git
   cd autoparc
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/goldenkiwi/autoparc.git
   ```

4. Install dependencies:
   ```bash
   # Backend
   cd backend && go mod download && cd ..
   
   # Frontend
   cd frontend && npm ci && cd ..
   ```

5. Start development databases:
   ```bash
   docker-compose up -d
   make migrate-up
   ```

## Development Workflow

### Creating a Feature Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements

### Keeping Your Branch Updated

Regularly sync with upstream:

```bash
git fetch upstream
git rebase upstream/main
```

## Coding Standards

### Backend (Go)

Follow the project's Go coding instructions from [.github/copilot-instructions.md](.github/copilot-instructions.md):

**Key Principles:**
- Use the standard library's net/http package
- Write idiomatic Go code
- Follow Go naming conventions (PascalCase for exported, camelCase for unexported)
- Use functional, declarative programming
- Handle errors properly - no naked returns
- Write descriptive variable names

**Code Style:**
- Use `gofmt` and `goimports` for formatting
- Pass `golangci-lint` checks (configuration in `backend/.golangci.yml`)
- Add godoc comments for all exported functions, types, and packages

**Example:**
```go
// GetCarByID retrieves a car from the database by its ID.
// Returns an error if the car is not found or if a database error occurs.
func (r *CarRepository) GetCarByID(ctx context.Context, id uuid.UUID) (*models.Car, error) {
    if id == uuid.Nil {
        return nil, ErrInvalidID
    }
    
    // ... implementation
}
```

### Frontend (React/TypeScript)

Follow the React coding instructions from [.github/copilot-instructions.md](.github/copilot-instructions.md):

**Key Principles:**
- Use functional components with TypeScript
- Prefer interfaces over types
- Use declarative JSX
- Implement the RORO pattern (Receive an Object, Return an Object)
- Handle errors at the beginning of functions (early returns)

**Code Style:**
- Use ESLint for linting (configuration in `frontend/.eslintrc.json`)
- Follow React best practices and hooks rules
- Use Tailwind CSS for styling
- Use Next UI components when possible

**Naming Conventions:**
- Components: PascalCase (e.g., `CarCard.tsx`)
- Files/directories: lowercase with dashes (e.g., `car-card/`)
- Functions: camelCase (e.g., `handleSubmit`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- Booleans: auxiliary verbs (e.g., `isLoading`, `hasError`)

**Example:**
```typescript
interface CarCardProps {
  car: Car
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

function CarCard({ car, onEdit, onDelete }: CarCardProps) {
  if (!car) return null
  
  // ... implementation
}
```

### French Language

All user-facing text must be in French:
- UI labels and buttons
- Error messages
- Form validation messages
- Comments for user-facing features

## Testing Requirements

### Backend Tests

**Unit Tests:**
- Write unit tests for all utilities and business logic
- Use table-driven tests when appropriate
- Aim for 80%+ code coverage
- Place tests in the same package as the code

```bash
cd backend
go test -v ./pkg/...
go test -v -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

**Integration Tests:**
- Test database operations and API handlers
- Use dockertest for PostgreSQL setup
- Clean up test data after each test

```bash
cd backend
go test -v ./tests/integration/...
```

### Frontend Tests

**Unit Tests:**
- Test components, hooks, and utilities
- Use React Testing Library
- Aim for 80%+ code coverage

```bash
cd frontend
npm run test
npm run test:coverage
```

**E2E Tests:**
- Test critical user flows
- Use Playwright
- Run against local development environment

```bash
cd frontend
npm run test:e2e
```

### Before Submitting

Run all checks locally:

```bash
# Backend
cd backend
golangci-lint run
go test -v ./...

# Frontend
cd frontend
npm run lint
npm run test
npm run build

# E2E (optional but recommended)
npm run test:e2e
```

## Commit Messages

Follow conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(cars): add license plate validation

Implement regex validation for French license plates (AA-123-BB format)
at both backend and frontend levels.

Closes #42
```

```
fix(auth): prevent session fixation attack

Update session token generation to use crypto/rand instead of math/rand
for better security.
```

## Pull Request Process

### 1. Before Creating a PR

- [ ] All tests pass locally
- [ ] Code follows style guidelines
- [ ] No lint warnings or errors
- [ ] Coverage meets 80% threshold
- [ ] Documentation is updated if needed
- [ ] Commit messages follow conventions

### 2. Create the Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Go to the original repository on GitHub
3. Click "New Pull Request"
4. Select your fork and branch
5. Fill out the PR template:
   - **Title**: Clear, descriptive title
   - **Description**: What changes and why
   - **Testing**: How you tested the changes
   - **Screenshots**: For UI changes
   - **Related Issues**: Reference any related issues

### 3. PR Review Process

- CI/CD checks must pass (automated)
- At least one maintainer approval required
- Address review comments promptly
- Keep the PR focused and reasonably sized
- Update PR based on feedback

### 4. After Approval

- Maintainers will merge your PR
- Your branch will be deleted automatically
- The changes will be included in the next release

## Questions?

If you have questions:
- Check existing issues and discussions
- Open a new issue with the "question" label
- Reach out to maintainers

## Thank You!

Your contributions help make AutoParc better for everyone. We appreciate your time and effort! 🚀
