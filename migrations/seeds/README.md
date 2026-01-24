# Seed Data Migrations

This folder contains seed data migrations for development and CI/CD environments only.

**⚠️ IMPORTANT: These migrations should NEVER be run in production!**

## Overview

Seed data migrations populate the database with:
- Default admin user
- Sample insurance companies
- Test data for development

## Usage

### Using Makefile (Recommended)

```bash
# Run seed data migrations
make seed-up

# Rollback seed data
make seed-down
```

### Manual Usage

```bash
# Development database
DB_URL="postgresql://autoparc:autoparc_dev_password@localhost:5436/autoparc_dev?sslmode=disable"
migrate -path ./migrations/seeds -database "$DB_URL" up

# Rollback
migrate -path ./migrations/seeds -database "$DB_URL" down
```

## Default Credentials

After running seed migrations:

- **Admin Email**: admin@autoparc.fr
- **Admin Password**: Admin123!

## When to Use

✅ **Use seed data in:**
- Local development
- CI/CD pipelines
- Testing environments
- Staging environments (optional)

❌ **DO NOT use seed data in:**
- Production environments

## Adding New Seed Data

1. Create a new migration file in this folder:
   ```bash
   make migrate-create-seed NAME=add_sample_users
   ```

2. Edit the `.up.sql` file with your seed data

3. Edit the `.down.sql` file to clean up the seed data

4. Test both up and down migrations
