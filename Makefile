# AutoParc Backend Makefile

# Database connection strings
DB_DEV_URL := postgresql://autoparc:autoparc_dev_password@localhost:5436/autoparc_dev?sslmode=disable
DB_TEST_URL := postgresql://autoparc_test:autoparc_test_password@localhost:5437/autoparc_test?sslmode=disable

# Migration path
MIGRATIONS_PATH := ./migrations

# Migrate tool
MIGRATE := $(shell which migrate || echo ~/go/bin/migrate)

.PHONY: help
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

.PHONY: migrate-up
migrate-up: ## Run all migrations (up)
	@echo "Running migrations up..."
	@$(MIGRATE) -path $(MIGRATIONS_PATH) -database "$(DB_DEV_URL)" up

.PHONY: migrate-down
migrate-down: ## Rollback one migration (down)
	@echo "Rolling back last migration..."
	@$(MIGRATE) -path $(MIGRATIONS_PATH) -database "$(DB_DEV_URL)" down 1

.PHONY: migrate-down-all
migrate-down-all: ## Rollback all migrations
	@echo "Rolling back all migrations..."
	@$(MIGRATE) -path $(MIGRATIONS_PATH) -database "$(DB_DEV_URL)" down

.PHONY: migrate-force
migrate-force: ## Force migration version (usage: make migrate-force VERSION=1)
	@echo "Forcing migration version $(VERSION)..."
	@$(MIGRATE) -path $(MIGRATIONS_PATH) -database "$(DB_DEV_URL)" force $(VERSION)

.PHONY: migrate-version
migrate-version: ## Show current migration version
	@$(MIGRATE) -path $(MIGRATIONS_PATH) -database "$(DB_DEV_URL)" version

.PHONY: migrate-create
migrate-create: ## Create new migration (usage: make migrate-create NAME=migration_name)
	@$(MIGRATE) create -ext sql -dir $(MIGRATIONS_PATH) -seq $(NAME)

.PHONY: db-reset
db-reset: ## Reset database (down all, then up all)
	@echo "Resetting database..."
	@$(MIGRATE) -path $(MIGRATIONS_PATH) -database "$(DB_DEV_URL)" down -all || true
	@$(MIGRATE) -path $(MIGRATIONS_PATH) -database "$(DB_DEV_URL)" up

.PHONY: db-status
db-status: ## Show database status
	@echo "Checking database status..."
	@docker exec autoparc_postgres psql -U autoparc -d autoparc_dev -c "\dt"
	@echo ""
	@echo "Migration version:"
	@$(MIGRATE) -path $(MIGRATIONS_PATH) -database "$(DB_DEV_URL)" version

.PHONY: db-shell
db-shell: ## Open PostgreSQL shell
	@docker exec -it autoparc_postgres psql -U autoparc -d autoparc_dev

.PHONY: docker-up
docker-up: ## Start Docker containers
	@docker compose up -d

.PHONY: docker-down
docker-down: ## Stop Docker containers
	@docker compose down

.PHONY: docker-logs
docker-logs: ## Show Docker logs
	@docker compose logs -f

.PHONY: run
run: ## Run the API server
	@cd backend && go run cmd/api/main.go

.PHONY: test
test: ## Run tests
	@cd backend && go test -v ./...

.PHONY: test-coverage
test-coverage: ## Run tests with coverage
	@cd backend && go test -v -coverprofile=coverage.out ./...
	@cd backend && go tool cover -html=coverage.out

.PHONY: build
build: ## Build the application
	@cd backend && go build -o ../bin/autoparc cmd/api/main.go

.PHONY: clean
clean: ## Clean build artifacts
	@rm -rf backend/bin
	@rm -rf backend/coverage.out

.PHONY: install-tools
install-tools: ## Install development tools
	@echo "Installing golang-migrate..."
	@go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
	@echo "Done!"
