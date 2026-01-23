package integration

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

	log.Println("Connecting to database on url: ", databaseURL)

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

	// Migrations are in project root
	migrationsPath := "file://../../../migrations"
	m1, err := migrate.NewWithDatabaseInstance(migrationsPath, "postgres", driver)
	if err != nil {
		log.Fatalf("Could not create migrate instance: %s", err)
	}

	if err := m1.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatalf("Could not run migrations: %s", err)
	}

	log.Println("Migrations completed successfully")

	// Run tests
	code := m.Run()

	// Clean up
	if err := pool.Purge(resource); err != nil {
		log.Fatalf("Could not purge resource: %s", err)
	}

	os.Exit(code)
}

func cleanupDB(t *testing.T) {
	// Delete in order to respect foreign key constraints
	_, _ = testDB.Exec("DELETE FROM action_logs")
	_, _ = testDB.Exec("DELETE FROM sessions")
	_, _ = testDB.Exec("DELETE FROM cars WHERE created_by != '00000000-0000-0000-0000-000000000001'")
	// Don't delete seed insurance companies
}

// Helper function to get a test context
func testContext() context.Context {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	_ = cancel // Will be used by the test
	return ctx
}
