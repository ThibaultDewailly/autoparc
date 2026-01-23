#!/bin/bash

# CI/CD Local Validation Script
# This script runs the same checks that GitHub Actions will run
# Run this before pushing to catch issues early

set -e  # Exit on error

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     AutoParc CI/CD Local Validation Script              ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Track failures
FAILURES=0

# Function to print section headers
print_section() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
    echo ""
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
    FAILURES=$((FAILURES + 1))
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if required tools are installed
print_section "Checking Prerequisites"

command -v go >/dev/null 2>&1 && print_success "Go installed" || print_error "Go not found"
command -v node >/dev/null 2>&1 && print_success "Node.js installed" || print_error "Node.js not found"
command -v npm >/dev/null 2>&1 && print_success "npm installed" || print_error "npm not found"
command -v docker >/dev/null 2>&1 && print_success "Docker installed" || print_error "Docker not found"

# Backend checks
print_section "Backend Checks"

cd backend

# Check if golangci-lint is installed
if ! command -v golangci-lint >/dev/null 2>&1; then
    print_warning "golangci-lint not found. Install: curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b \$(go env GOPATH)/bin"
else
    print_success "golangci-lint installed"
    
    # Run linter
    echo "Running golangci-lint..."
    if golangci-lint run --timeout=5m; then
        print_success "Backend linting passed"
    else
        print_error "Backend linting failed"
    fi
fi

# Run unit tests
echo "Running backend unit tests..."
if go test -v -race ./pkg/...; then
    print_success "Backend unit tests passed"
else
    print_error "Backend unit tests failed"
fi

# Check coverage
echo "Checking backend coverage..."
go test -v -coverprofile=coverage.out ./pkg/... > /dev/null 2>&1
COVERAGE=$(go tool cover -func=coverage.out | grep total | awk '{print substr($3, 1, length($3)-1)}')
echo "Backend coverage: ${COVERAGE}%"

if (( $(echo "$COVERAGE >= 80" | bc -l) )); then
    print_success "Backend coverage ${COVERAGE}% meets 80% threshold"
else
    print_error "Backend coverage ${COVERAGE}% is below 80% threshold"
fi

# Clean up coverage file
rm -f coverage.out

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_warning "Docker is not running. Skipping integration tests."
else
    # Run integration tests (requires database)
    if docker ps | grep -q autoparc_postgres; then
        echo "Running backend integration tests..."
        if go test -v -race ./tests/integration/...; then
            print_success "Backend integration tests passed"
        else
            print_error "Backend integration tests failed"
        fi
    else
        print_warning "PostgreSQL container not running. Start with: docker-compose up -d"
    fi
fi

# Build backend
echo "Building backend..."
if go build -o ../bin/autoparc cmd/api/main.go; then
    print_success "Backend build successful"
    rm -f ../bin/autoparc
else
    print_error "Backend build failed"
fi

cd ..

# Frontend checks
print_section "Frontend Checks"

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm ci
fi

# Run ESLint
echo "Running ESLint..."
if npm run lint; then
    print_success "Frontend linting passed"
else
    print_error "Frontend linting failed"
fi

# Run unit tests
echo "Running frontend unit tests..."
if npm test -- --run; then
    print_success "Frontend unit tests passed"
else
    print_error "Frontend unit tests failed"
fi

# Check coverage
echo "Checking frontend coverage..."
COVERAGE_OUTPUT=$(npm run test:coverage -- --run --reporter=json --reporter=default 2>&1)

# Try to get coverage from JSON file first
if [ -f "coverage/coverage-summary.json" ]; then
    COVERAGE=$(node -pe "JSON.parse(require('fs').readFileSync('coverage/coverage-summary.json')).total.lines.pct" 2>/dev/null || echo "0")
    echo "Frontend coverage: ${COVERAGE}%"
    
    if (( $(echo "$COVERAGE >= 80" | bc -l) )); then
        print_success "Frontend coverage ${COVERAGE}% meets 80% threshold"
    else
        print_error "Frontend coverage ${COVERAGE}% is below 80% threshold"
    fi
else
    # Fallback: Parse from output text
    COVERAGE=$(echo "$COVERAGE_OUTPUT" | grep "All files" | awk '{print $4}' | head -1)
    if [ -n "$COVERAGE" ]; then
        echo "Frontend coverage: ${COVERAGE}%"
        if (( $(echo "$COVERAGE >= 80" | bc -l) )); then
            print_success "Frontend coverage ${COVERAGE}% meets 80% threshold"
        else
            print_error "Frontend coverage ${COVERAGE}% is below 80% threshold"
        fi
    else
        print_warning "Could not determine coverage percentage"
    fi
fi

# Build frontend
echo "Building frontend..."
if npm run build; then
    print_success "Frontend build successful"
else
    print_error "Frontend build failed"
fi

cd ..

# Summary
print_section "Summary"

if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ All checks passed! Ready to push.                    ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ $FAILURES check(s) failed. Fix issues before pushing.     ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
