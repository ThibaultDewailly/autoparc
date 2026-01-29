package repository

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"testing"
	"time"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/ory/dockertest/v3"
	"github.com/ory/dockertest/v3/docker"
)

var (
	testDB   *sql.DB
	pool     *dockertest.Pool
	resource *dockertest.Resource
)

func TestMain(m *testing.M) {
	var err error

	// Create dockertest pool
	pool, err = dockertest.NewPool("")
	if err != nil {
		log.Fatalf("Could not construct pool: %s", err)
	}

	err = pool.Client.Ping()
	if err != nil {
		log.Fatalf("Could not connect to Docker: %s", err)
	}

	// Start PostgreSQL container
	resource, err = pool.RunWithOptions(&dockertest.RunOptions{
		Repository: "postgres",
		Tag:        "18-alpine",
		Env: []string{
			"POSTGRES_PASSWORD=testpass",
			"POSTGRES_USER=testuser",
			"POSTGRES_DB=testdb",
			"listen_addresses = '*'",
		},
	}, func(config *docker.HostConfig) {
		config.AutoRemove = true
		config.RestartPolicy = docker.RestartPolicy{Name: "no"}
	})
	if err != nil {
		log.Fatalf("Could not start resource: %s", err)
	}

	hostAndPort := resource.GetHostPort("5432/tcp")
	databaseURL := fmt.Sprintf("postgres://testuser:testpass@%s/testdb?sslmode=disable", hostAndPort)

	log.Println("Connecting to repository test database on url:", databaseURL)

	// Wait for container to be ready
	resource.Expire(120)
	if err = pool.Retry(func() error {
		testDB, err = sql.Open("pgx", databaseURL)
		if err != nil {
			return err
		}
		return testDB.Ping()
	}); err != nil {
		log.Fatalf("Could not connect to docker: %s", err)
	}

	// Run migrations
	driver, err := postgres.WithInstance(testDB, &postgres.Config{})
	if err != nil {
		log.Fatalf("Could not create migration driver: %s", err)
	}

	// Migrations are relative to repository package (go up to backend, then to project root)
	migrationsPath := "file://../../../migrations"
	m1, err := migrate.NewWithDatabaseInstance(migrationsPath, "postgres", driver)
	if err != nil {
		log.Fatalf("Could not create migrate instance: %s", err)
	}

	if err := m1.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatalf("Could not run migrations: %s", err)
	}

	log.Println("Repository test migrations completed successfully")

	// Run tests
	code := m.Run()

	// Clean up
	if err := pool.Purge(resource); err != nil {
		log.Fatalf("Could not purge resource: %s", err)
	}

	os.Exit(code)
}

func testContext() context.Context {
	ctx, _ := context.WithTimeout(context.Background(), 30*time.Second)
	return ctx
}

func cleanupDB(t *testing.T) {
	// Clean all tables except migrations
	tables := []string{
		"accident_photos",
		"repairs",
		"accidents",
		"car_operator_assignments",
		"car_operators",
		"action_logs",
		"cars",
		"garages",
		"sessions",
		"administrative_employees",
		"insurance_companies",
	}

	for _, table := range tables {
		_, err := testDB.Exec(fmt.Sprintf("DELETE FROM %s", table))
		if err != nil {
			t.Logf("Warning: could not clean table %s: %v", table, err)
		}
	}
}
