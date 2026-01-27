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

# Default: run all tests
RUN_BACKEND=false
RUN_FRONTEND=false
RUN_E2E=false
RUN_ALL=false

# Parse command-line options
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -b, --backend    Run backend tests (Go)"
    echo "  -f, --frontend   Run frontend tests (unit and integration)"
    echo "  -e, --e2e        Run E2E tests"
    echo "  --all            Run all tests (default if no options specified)"
    echo "  -h, --help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0               # Run all tests"
    echo "  $0 --backend     # Run only backend tests"
    echo "  $0 -f -e         # Run frontend and E2E tests"
    echo "  $0 --all         # Run all tests"
    exit 0
}

# Parse arguments
if [ $# -eq 0 ]; then
    RUN_ALL=true
fi

while [[ $# -gt 0 ]]; do
    case $1 in
        -b|--backend)
            RUN_BACKEND=true
            shift
            ;;
        -f|--frontend)
            RUN_FRONTEND=true
            shift
            ;;
        -e|--e2e)
            RUN_E2E=true
            shift
            ;;
        --all)
            RUN_ALL=true
            shift
            ;;
        -h|--help)
            show_usage
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            ;;
    esac
done

# If --all is specified, enable all tests
if [ "$RUN_ALL" = true ]; then
    RUN_BACKEND=true
    RUN_FRONTEND=true
    RUN_E2E=true
fi

echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     AutoParc CI/CD Local Validation Script              ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Test selection:"
[ "$RUN_BACKEND" = true ] && echo -e "${CYAN}  • Backend tests enabled${NC}"
[ "$RUN_FRONTEND" = true ] && echo -e "${CYAN}  • Frontend tests enabled${NC}"
[ "$RUN_E2E" = true ] && echo -e "${CYAN}  • E2E tests enabled${NC}"
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

if [ "$RUN_BACKEND" = true ]; then
    command -v go >/dev/null 2>&1 && print_success "Go installed" || print_error "Go not found"
fi

if [ "$RUN_FRONTEND" = true ] || [ "$RUN_E2E" = true ]; then
    command -v node >/dev/null 2>&1 && print_success "Node.js installed" || print_error "Node.js not found"
    command -v npm >/dev/null 2>&1 && print_success "npm installed" || print_error "npm not found"
fi

if [ "$RUN_BACKEND" = true ] || [ "$RUN_E2E" = true ]; then
    command -v docker >/dev/null 2>&1 && print_success "Docker installed" || print_error "Docker not found"
fi

# Backend checks
if [ "$RUN_BACKEND" = true ]; then
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

fi # End of Backend checks

# Frontend checks
if [ "$RUN_FRONTEND" = true ]; then
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

fi # End of Frontend checks

# ═══════════════════════════════════════════════════════════
# E2E Tests
# ═══════════════════════════════════════════════════════════
if [ "$RUN_E2E" = true ]; then
print_section "E2E Tests"

echo "Starting Docker Compose services..."
if ! docker compose up -d --build; then
    print_error "Failed to start Docker Compose services"
else
    print_success "Docker Compose services started"
    
    # Wait for backend to be ready
    echo "Waiting for backend to be ready..."
    WAIT_COUNT=0
    MAX_WAIT=60
    while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
        if curl -s http://localhost:8080/health > /dev/null 2>&1; then
            print_success "Backend is ready"
            break
        fi
        echo "Waiting for backend... ($WAIT_COUNT/$MAX_WAIT)"
        sleep 2
        WAIT_COUNT=$((WAIT_COUNT + 1))
    done
    
    if [ $WAIT_COUNT -eq $MAX_WAIT ]; then
        print_error "Backend failed to start within timeout"
        echo "Backend logs:"
        docker compose logs backend
        docker compose down
    else
        # Give backend extra time to complete migrations and seed data
        echo "Waiting for database migrations and seed data..."
        sleep 5
        
        # Verify backend is responding correctly
        echo "Verifying backend API..."
        if curl -s http://localhost:8080/health | grep -q "ok"; then
            print_success "Backend API is responding correctly"
        else
            print_warning "Backend health check returned unexpected response"
            echo "Response:"
            curl -s http://localhost:8080/health
        fi
        
        # Test login endpoint with admin credentials
        echo "Testing login endpoint..."
        LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
            -H "Content-Type: application/json" \
            -d '{"email":"admin@autoparc.fr","password":"Admin123!"}')
        
        if echo "$LOGIN_RESPONSE" | grep -q "admin@autoparc.fr"; then
            print_success "Login endpoint is working"
        else
            print_error "Login endpoint failed"
            echo "Response: $LOGIN_RESPONSE"
            echo ""
            echo "Backend logs:"
            docker compose logs --tail=100 backend
            docker compose down
            exit 1
        fi
        # Wait for frontend to be ready
        echo "Waiting for frontend dev server to be ready..."
        cd frontend
        
        # Check if frontend is already running
        if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
            echo "Starting frontend dev server..."
            npm run dev > /dev/null 2>&1 &
            FRONTEND_PID=$!
            
            WAIT_COUNT=0
            MAX_WAIT=30
            while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
                if curl -s http://localhost:5173 > /dev/null 2>&1; then
                    print_success "Frontend dev server is ready"
                    break
                fi
                echo "Waiting for frontend... ($WAIT_COUNT/$MAX_WAIT)"
                sleep 2
                WAIT_COUNT=$((WAIT_COUNT + 1))
            done
            
            if [ $WAIT_COUNT -eq $MAX_WAIT ]; then
                print_error "Frontend dev server failed to start within timeout"
                kill $FRONTEND_PID 2>/dev/null || true
                cd ..
                docker compose down
                exit 1
            fi
        else
            print_success "Frontend dev server is already running"
            FRONTEND_PID=""
        fi
        
        echo "Installing Playwright browsers..."
        if npx playwright install chromium > /dev/null 2>&1; then
            print_success "Playwright browsers installed"
        else
            print_warning "Failed to install Playwright browsers (may already be installed)"
        fi
        
        # Create auth directory for playwright storage state
        mkdir -p e2e/.auth
        
        echo "Running E2E tests..."
        if npm run test:e2e -- --reporter=list; then
            print_success "E2E tests passed"
        else
            print_error "E2E tests failed"
            
            # Show Playwright report details
            echo ""
            echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${YELLOW}Playwright Test Report${NC}"
            echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo ""
            echo "HTML report available at: frontend/playwright-report/index.html"
            echo ""
            echo "To view the interactive report, run:"
            echo "  cd frontend && npx playwright show-report"
            echo ""
            echo "Backend logs:"
            docker compose logs --tail=50 backend
        fi
        
        # Stop frontend dev server if we started it
        if [ -n "$FRONTEND_PID" ]; then
            echo "Stopping frontend dev server..."
            kill $FRONTEND_PID 2>/dev/null || true
        fi
        
        cd ..
        
        # Stop Docker Compose services
        echo "Stopping Docker Compose services..."
        docker compose down
        print_success "Docker Compose services stopped"
    fi
fi

fi # End of E2E tests

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
