# Database Migrations

This folder contains all database migrations for the AutoParc application.

## Migrations Overview

1. **000001_create_administrative_employees_table**: Creates the administrative employees table with authentication fields
2. **000002_create_sessions_table**: Creates the sessions table for session-based authentication
3. **000003_create_insurance_companies_table**: Creates the insurance companies table
4. **000004_create_cars_table**: Creates the cars table with license plate validation
5. **000005_create_action_logs_table**: Creates the audit logging table

## Seed Data

**⚠️ Seed data has been moved to `migrations/seeds/` folder.**

Seed data migrations are separate from schema migrations and should only be run in development and CI/CD environments. See [migrations/seeds/README.md](./seeds/README.md) for details.

## Prerequisites

Install golang-migrate tool:
```bash
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
```

## Usage

### Using Makefile (Recommended)

```bash
# Start the database
make docker-up

# Run schema migrations
make migrate-up

# Run seed data (development/CI only)
make seed-up

# Or reset database with seeds in one command
make db-reset-with-seeds

# Rollback last migration
make migrate-down

# Rollback all migrations
make migrate-down-all

# Check migration status
make migrate-version

# View database status
make db-status

# Reset database (down all + up all)
make db-reset

# Create a new migration
make migrate-create NAME=add_some_feature

# Create a new seed migration
make migrate-create-seed NAME=add_sample_data

# Open database shell
make db-shell
```

### Using migrate CLI directly

```bash
# Database URL
DB_URL="postgresql://autoparc:autoparc_dev_password@localhost:5436/autoparc_dev?sslmode=disable"

# Run migrations up
migrate -path ./migrations -database "$DB_URL" up

# Rollback one migration
migrate -path ./migrations -database "$DB_URL" down 1

# Rollback all migrations
migrate -path ./migrations -database "$DB_URL" down

# Check current version
migrate -path ./migrations -database "$DB_URL" version

# Run seed data (dev/CI only)
DB_URL="postgresql://autoparc:autoparc_dev_password@localhost:5436/autoparc_dev?sslmode=disable"
migrate -path ./migrations/seeds -database "$DB_URL" up

# Force version (use with caution!)
migrate -path ./migrations -database "$DB_URL" force VERSION_NUMBER
```

## Default Credentials

After running seed data migrations (`make seed-up`):

- **Admin Email**: admin@autoparc.fr
- **Admin Password**: Admin123!

**Note:** Seed data is only for development and CI/CD environments. Do not use in production.

## Database Schema

### Tables Created

- `administrative_employees`: System users (admin employees)
- `sessions`: Active user sessions
- `insurance_companies`: Insurance provider information
- `cars`: Vehicle fleet information
- `action_logs`: Audit trail for all operations
- `schema_migrations`: Migration version tracking (created automatically)

### Indexes

All tables include appropriate indexes for performance:
- Primary keys (UUID)
- Foreign keys
- Frequently queried fields (email, license_plate, session_token, etc.)
- Timestamp fields for audit queries

### Constraints

- **License Plate Format**: `^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$` (e.g., AB-123-CD)
- **Car Status**: Must be one of: `active`, `maintenance`, `retired`
- **Unique Constraints**: email, license_plate, session_token

### Triggers

- **updated_at**: Automatically updates the `updated_at` timestamp on all relevant tables

## Development Workflow

1. Start the database: `make docker-up`
2. Run schema migrations: `make migrate-up`
3. Run seed data (dev only): `make seed-up`
4. Make changes to your application
5. When schema changes are needed:
   - Create new migration: `make migrate-create NAME=descriptive_name`
   - Edit the generated `.up.sql` and `.down.sql` files
   - Test: `make migrate-up` and `make migrate-down`
6. When seed data changes are needed:
   - Create new seed: `make migrate-create-seed NAME=seed_description`
   - Edit files in `migrations/seeds/`
   - Test: `make seed-up` and `make seed-down`
7. Commit the migration files to version control

## Troubleshooting

### Migration fails with "dirty database"

If a migration fails midway, the database may be in a "dirty" state. Check the version:

```bash
make migrate-version
```

If it shows a dirty version (e.g., `1 (dirty)`), you can force it to a clean state:

```bash
make migrate-force VERSION=X
```

Then fix the problematic migration and try again.

### Reset everything

To completely reset the database:

```bash
make docker-down
docker volume rm autoparc_postgres_data
make docker-up
make migrate-up
```

## Best Practices

1. **Never modify existing migrations** that have been deployed
2. **Always create new migrations** for schema changes
3. **Test both up and down migrations** before committing
4. **Keep migrations small and focused** on a single change
5. **Write descriptive migration names**
6. **Include comments** in complex SQL statements
7. **Backup production data** before running migrations
