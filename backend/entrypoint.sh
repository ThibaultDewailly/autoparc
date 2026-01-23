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

# Run migrations
migrate -path /migrations -database "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable" up

echo "Migrations completed - starting API server"
exec ./api
