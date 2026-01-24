#!/bin/sh
set -e

echo "Waiting for database to be ready..."
until wget --quiet --tries=1 --spider "http://${DB_HOST}:${DB_PORT}" 2>/dev/null || pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" 2>/dev/null; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is up - running migrations"

# Install migrate tool if not present
if ! command -v migrate &> /dev/null; then
    echo "Installing golang-migrate..."
    wget -qO- https://github.com/golang-migrate/migrate/releases/download/v4.17.0/migrate.linux-amd64.tar.gz | tar xvz -C /usr/local/bin
fi

# Run migrations (force version if there's a mismatch)
migrate -path /migrations -database "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable" up || {
    echo "Migration error detected, forcing to latest version..."
    LATEST_VERSION=$(ls /migrations/*_*.up.sql 2>/dev/null | sed 's/.*\/\([0-9]*\)_.*/\1/' | sort -n | tail -1)
    if [ ! -z "$LATEST_VERSION" ]; then
        migrate -path /migrations -database "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable" force $LATEST_VERSION
        migrate -path /migrations -database "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable" up
    fi
}

# Run seed data for development environments
if [ "${ENVIRONMENT}" = "development" ] || [ "${ENVIRONMENT}" = "dev" ] || [ "${ENVIRONMENT}" = "test" ]; then
    echo "Running seed data migrations (environment: ${ENVIRONMENT})..."
    # Use separate migrations table for seeds to avoid version conflicts
    migrate -path /migrations/seeds -database "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable&x-migrations-table=schema_migrations_seeds" up || {
        echo "Seed migration error detected, forcing to latest version..."
        LATEST_SEED_VERSION=$(ls /migrations/seeds/*_*.up.sql 2>/dev/null | sed 's/.*\/0*\([0-9]*\)_.*/\1/' | sort -n | tail -1)
        if [ ! -z "$LATEST_SEED_VERSION" ]; then
            migrate -path /migrations/seeds -database "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable&x-migrations-table=schema_migrations_seeds" force $LATEST_SEED_VERSION
            migrate -path /migrations/seeds -database "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable&x-migrations-table=schema_migrations_seeds" up
        fi
    }
fi

echo "Migrations completed - starting API server"
exec ./api
