package integration

import (
	"testing"
	"time"

	"github.com/goldenkiwi/autoparc/internal/repository"
	"github.com/goldenkiwi/autoparc/internal/service"
)

func TestAuthIntegration(t *testing.T) {
	cleanupDB(t)

	userRepo := repository.NewUserRepository(testDB)
	sessionRepo := repository.NewSessionRepository(testDB)
	authService := service.NewAuthService(userRepo, sessionRepo)

	t.Run("Login with valid credentials", func(t *testing.T) {
		ctx := testContext()

		// Use the seeded admin user (check migrations/000006_seed_data.up.sql)
		email := "admin@autoparc.fr"
		password := "Admin123!" // This is the password used in seed data

		user, session, err := authService.Login(ctx, email, password, "127.0.0.1", "test-agent")
		if err != nil {
			t.Fatalf("Login failed: %v", err)
		}

		if user == nil {
			t.Fatal("Expected user, got nil")
		}

		if user.Email != email {
			t.Errorf("Expected email %s, got %s", email, user.Email)
		}

		if session == nil {
			t.Fatal("Expected session, got nil")
		}

		if session.SessionToken == "" {
			t.Error("Expected session token, got empty string")
		}

		if session.ExpiresAt.Before(time.Now()) {
			t.Error("Session already expired")
		}
	})

	t.Run("Login with invalid credentials", func(t *testing.T) {
		ctx := testContext()

		_, _, err := authService.Login(ctx, "admin@autoparc.fr", "WrongPassword123", "127.0.0.1", "test-agent")
		if err == nil {
			t.Error("Expected error for invalid credentials")
		}
	})

	t.Run("Login with non-existent user", func(t *testing.T) {
		ctx := testContext()

		_, _, err := authService.Login(ctx, "nonexistent@autoparc.fr", "password", "127.0.0.1", "test-agent")
		if err == nil {
			t.Error("Expected error for non-existent user")
		}
	})

	t.Run("Validate session", func(t *testing.T) {
		ctx := testContext()

		// Login first
		email := "admin@autoparc.fr"
		password := "Admin123!"
		_, session, err := authService.Login(ctx, email, password, "127.0.0.1", "test-agent")
		if err != nil {
			t.Fatalf("Login failed: %v", err)
		}

		// Validate session
		user, err := authService.ValidateSession(ctx, session.SessionToken)
		if err != nil {
			t.Fatalf("ValidateSession failed: %v", err)
		}

		if user.Email != email {
			t.Errorf("Expected email %s, got %s", email, user.Email)
		}
	})

	t.Run("Logout", func(t *testing.T) {
		ctx := testContext()

		// Login first
		_, session, err := authService.Login(ctx, "admin@autoparc.fr", "Admin123!", "127.0.0.1", "test-agent")
		if err != nil {
			t.Fatalf("Login failed: %v", err)
		}

		// Logout
		err = authService.Logout(ctx, session.SessionToken)
		if err != nil {
			t.Fatalf("Logout failed: %v", err)
		}

		// Try to validate session after logout
		_, err = authService.ValidateSession(ctx, session.SessionToken)
		if err == nil {
			t.Error("Expected error when validating deleted session")
		}
	})

	t.Run("Invalid session token", func(t *testing.T) {
		ctx := testContext()

		_, err := authService.ValidateSession(ctx, "invalid-token")
		if err == nil {
			t.Error("Expected error for invalid session token")
		}
	})
}
