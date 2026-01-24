#!/bin/bash
# Production Database Setup Script
# This script helps set up the AutoParc database in production

set -e

echo "================================================"
echo "AutoParc Production Database Setup"
echo "================================================"
echo ""

# Check if required tools are installed
if ! command -v psql &> /dev/null; then
    echo "Error: psql is not installed. Please install PostgreSQL client."
    exit 1
fi

if ! command -v migrate &> /dev/null; then
    echo "Error: golang-migrate is not installed."
    echo "Install with: brew install golang-migrate (macOS) or download from https://github.com/golang-migrate/migrate"
    exit 1
fi

# Load environment variables
if [ -f ".env.production" ]; then
    echo "Loading environment variables from .env.production..."
    export $(grep -v '^#' .env.production | xargs)
else
    echo "Error: .env.production file not found."
    echo "Please copy .env.production.example to .env.production and update with production values."
    exit 1
fi

# Validate required environment variables
required_vars=("DB_HOST" "DB_PORT" "DB_USER" "DB_PASSWORD" "DB_NAME")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: Required environment variable $var is not set."
        exit 1
    fi
done

echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
echo ""

# Ask for confirmation
read -p "Do you want to proceed with database setup? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Setup cancelled."
    exit 0
fi

# Test database connection
echo ""
echo "Testing database connection..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT version();" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Database connection successful"
else
    echo "✗ Failed to connect to database. Please check your credentials and network."
    exit 1
fi

# Check if database exists
echo ""
echo "Checking if database exists..."
DB_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$DB_EXISTS" = "1" ]; then
    echo "Database '$DB_NAME' already exists."
    read -p "Do you want to drop and recreate it? (yes/no): " recreate
    if [ "$recreate" = "yes" ]; then
        echo "Dropping database..."
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
        echo "Creating database..."
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
        echo "✓ Database recreated"
    fi
else
    echo "Creating database..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
    echo "✓ Database created"
fi

# Run migrations
echo ""
echo "Running database migrations..."
cd "$(dirname "$0")/.."
MIGRATION_DIR="file://$(pwd)/migrations"
DB_URL="postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=$DB_SSLMODE"

migrate -path ./migrations -database "$DB_URL" up
if [ $? -eq 0 ]; then
    echo "✓ Migrations applied successfully"
else
    echo "✗ Migration failed"
    exit 1
fi

# Verify setup
echo ""
echo "Verifying database setup..."
TABLE_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "✓ Found $TABLE_COUNT tables in database"

echo ""
echo "================================================"
echo "Database setup completed successfully!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Verify seed data is loaded correctly"
echo "2. Test database connectivity from your application"
echo "3. Configure backups for production database"
echo ""
