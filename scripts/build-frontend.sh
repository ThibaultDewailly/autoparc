#!/bin/bash
# Production Build Script for Frontend
# Builds an optimized production bundle for the AutoParc React app

set -e

echo "================================================"
echo "Building AutoParc Frontend for Production"
echo "================================================"
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")/../frontend"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "Warning: .env.production file not found."
    echo "Creating from .env.production.example..."
    if [ -f ".env.production.example" ]; then
        cp .env.production.example .env.production
        echo "⚠ Please update .env.production with your production values before deploying!"
    else
        echo "Error: .env.production.example not found."
        exit 1
    fi
fi

# Display environment configuration
echo "Environment Configuration:"
if [ -f ".env.production" ]; then
    grep -v "^#" .env.production | grep -v "^$" || true
fi
echo ""

# Install dependencies
echo "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm ci
else
    echo "✓ Dependencies already installed"
fi

# Run tests
echo ""
echo "Running tests..."
npm run test:coverage -- --run
if [ $? -ne 0 ]; then
    echo "✗ Tests failed. Aborting build."
    exit 1
fi
echo "✓ All tests passed"

# Run linter
echo ""
echo "Running linter..."
npm run lint
if [ $? -ne 0 ]; then
    echo "⚠ Linter found issues (continuing anyway)"
fi

# Clean previous builds
echo ""
echo "Cleaning previous builds..."
rm -rf dist

# Build for production
echo ""
echo "Building production bundle..."
npm run build

if [ $? -eq 0 ]; then
    echo "✓ Build successful"
else
    echo "✗ Build failed"
    exit 1
fi

# Display build stats
echo ""
echo "Build Statistics:"
du -sh dist
echo ""
echo "Top 10 largest files:"
find dist -type f -exec ls -lh {} \; | sort -k5 -hr | head -10

echo ""
echo "================================================"
echo "Build completed successfully!"
echo "================================================"
echo ""
echo "Build output: dist/"
echo ""
echo "To preview the production build locally:"
echo "  npm run preview"
echo ""
echo "To deploy, upload the contents of the 'dist' folder to your web server."
echo ""
