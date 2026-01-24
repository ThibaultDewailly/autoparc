# Migrations Guide

This guide explains how to work with schema migrations and seed data in the AutoParc project.

## Overview

The project uses two types of migrations:

1. **Schema Migrations** (`migrations/`) - Database structure (tables, indexes, constraints)
2. **Seed Data** (`migrations/seeds/`) - Sample data for development and CI/CD

## Quick Start

### Development Setup

```bash
# Start database
make docker-up

# Run schema migrations
make migrate-up

# Run seed data (dev only)
make seed-up

# Or do everything in one command
make db-reset-with-seeds
```

### Available Commands

| Command | Description |
|---------|-------------|
| `make migrate-up` | Run schema migrations |
| `make migrate-down` | Rollback one schema migration |
| `make migrate-down-all` | Rollback all schema migrations |
| `make seed-up` | Run seed data migrations |
| `make seed-down` | Rollback all seed data |
| `make db-reset` | Reset database (schema only) |
| `make db-reset-with-seeds` | Reset database with seeds |
| `make migrate-create NAME=xxx` | Create new schema migration |
| `make migrate-create-seed NAME=xxx` | Create new seed migration |

## Schema Migrations

Located in `migrations/` directory.

**Use for:**
- Creating/modifying tables
- Adding/removing columns
- Creating indexes
- Adding constraints
- Schema changes

**Run in:**
- ✅ Development
- ✅ Testing
- ✅ CI/CD
- ✅ Staging
- ✅ Production

### Creating Schema Migrations

```bash
make migrate-create NAME=add_user_address
```

This creates:
- `migrations/000XXX_add_user_address.up.sql`
- `migrations/000XXX_add_user_address.down.sql`

## Seed Data

Located in `migrations/seeds/` directory.

**Use for:**
- Default admin users
- Sample data
- Test data
- Development data

**Run in:**
- ✅ Development
- ✅ Testing
- ✅ CI/CD
- ❌ Production (NEVER!)

### Creating Seed Data

```bash
make migrate-create-seed NAME=add_sample_users
```

This creates:
- `migrations/seeds/000XXX_add_sample_users.up.sql`
- `migrations/seeds/000XXX_add_sample_users.down.sql`

## Environment Behavior

### Docker Compose (Local Development)

When you run `docker compose up`, the backend entrypoint automatically:
1. Runs schema migrations
2. Runs seed data (if `ENVIRONMENT=development`)

### CI/CD Pipelines

GitHub Actions workflows automatically:
1. Run schema migrations
2. Run seed data for tests

### Production Deployment

⚠️ **Important:** Production should ONLY run schema migrations, never seed data.

```bash
# Production - schema only
migrate -path ./migrations -database "$PROD_DB_URL" up
```

## Default Credentials (After Seeds)

- **Email**: admin@autoparc.fr
- **Password**: Admin123!

## Troubleshooting

### Seed data in production?

If you accidentally ran seeds in production:

```bash
# Rollback seed data
make seed-down
```

### Migration version conflict?

```bash
# Check version
make migrate-version

# Force version (use carefully!)
make migrate-force VERSION=5
```

### Complete reset needed?

```bash
# Nuclear option - destroys all data
make docker-down
docker volume rm autoparc_postgres_data
make docker-up
make db-reset-with-seeds
```

## Best Practices

1. ✅ Always test both `.up.sql` and `.down.sql` files
2. ✅ Keep schema and seed data separate
3. ✅ Use meaningful migration names
4. ✅ Add comments in complex SQL
5. ✅ Test migrations before committing
6. ❌ Never modify existing migrations in production
7. ❌ Never run seed data in production
8. ❌ Never commit database credentials

## File Structure

```
migrations/
├── README.md
├── 000001_create_administrative_employees_table.up.sql
├── 000001_create_administrative_employees_table.down.sql
├── 000002_create_sessions_table.up.sql
├── 000002_create_sessions_table.down.sql
├── ...
└── seeds/
    ├── README.md
    ├── 000006_seed_data.up.sql
    └── 000006_seed_data.down.sql
```

## See Also

- [migrations/README.md](./migrations/README.md) - Detailed schema migration docs
- [migrations/seeds/README.md](./migrations/seeds/README.md) - Seed data details
- [Makefile](./Makefile) - All available commands
