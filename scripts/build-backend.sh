#!/bin/bash
# Production Build Script for Backend
# Builds an optimized production binary for the AutoParc API

set -e

echo "================================================"
echo "Building AutoParc Backend for Production"
echo "================================================"
echo ""

# Configuration
BUILD_DIR="./bin"
BINARY_NAME="api"
BUILD_TIME=$(date -u '+%Y-%m-%d_%H:%M:%S')
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
VERSION="1.0.0"

# Navigate to backend directory
cd "$(dirname "$0")/../backend"

echo "Build Configuration:"
echo "  Binary Name: $BINARY_NAME"
echo "  Version: $VERSION"
echo "  Git Commit: $GIT_COMMIT"
echo "  Build Time: $BUILD_TIME"
echo ""

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR

# Run tests first
echo ""
echo "Running tests..."
go test ./... -v
if [ $? -ne 0 ]; then
    echo "✗ Tests failed. Aborting build."
    exit 1
fi
echo "✓ All tests passed"

# Build the binary with optimizations
echo ""
echo "Building production binary..."
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s -X main.Version=$VERSION -X main.GitCommit=$GIT_COMMIT -X main.BuildTime=$BUILD_TIME" \
    -trimpath \
    -o $BUILD_DIR/$BINARY_NAME \
    ./cmd/api

if [ $? -eq 0 ]; then
    echo "✓ Build successful"
else
    echo "✗ Build failed"
    exit 1
fi

# Display binary info
echo ""
echo "Binary Information:"
ls -lh $BUILD_DIR/$BINARY_NAME
echo ""
file $BUILD_DIR/$BINARY_NAME

echo ""
echo "================================================"
echo "Build completed successfully!"
echo "================================================"
echo ""
echo "Binary location: $BUILD_DIR/$BINARY_NAME"
echo ""
echo "To run the binary:"
echo "  export DB_PASSWORD=your-password"
echo "  export ALLOWED_ORIGIN=your-origin"
echo "  ./$BUILD_DIR/$BINARY_NAME"
echo ""
