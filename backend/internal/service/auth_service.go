package service

import (
	"context"
	"fmt"
	"time"

	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/goldenkiwi/autoparc/internal/repository"
	"github.com/goldenkiwi/autoparc/pkg/utils"
	"github.com/google/uuid"
)

// AuthService handles authentication business logic
type AuthService struct {
	userRepo    *repository.UserRepository
	sessionRepo *repository.SessionRepository
}

// NewAuthService creates a new auth service
func NewAuthService(userRepo *repository.UserRepository, sessionRepo *repository.SessionRepository) *AuthService {
	return &AuthService{
		userRepo:    userRepo,
		sessionRepo: sessionRepo,
	}
}

// Login authenticates a user and creates a session
func (s *AuthService) Login(ctx context.Context, email, password, ipAddress, userAgent string) (*models.AdministrativeEmployee, *models.Session, error) {
	// Validate input
	if !utils.ValidateEmail(email) {
		return nil, nil, fmt.Errorf("invalid email format")
	}

	if !utils.ValidateRequired(password) {
		return nil, nil, fmt.Errorf("password is required")
	}

	// Find user by email
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, nil, fmt.Errorf("invalid credentials")
	}

	// Check password
	if !utils.CheckPassword(user.PasswordHash, password) {
		return nil, nil, fmt.Errorf("invalid credentials")
	}

	// Generate session token
	token, err := utils.GenerateSessionToken()
	if err != nil {
		return nil, nil, fmt.Errorf("failed to generate session token: %w", err)
	}

	// Create session
	session := &models.Session{
		ID:           uuid.New().String(),
		UserID:       user.ID,
		SessionToken: token,
		ExpiresAt:    time.Now().Add(24 * time.Hour),
		IPAddress:    ipAddress,
		UserAgent:    userAgent,
		CreatedAt:    time.Now(),
	}

	if err := s.sessionRepo.Create(ctx, session); err != nil {
		return nil, nil, fmt.Errorf("failed to create session: %w", err)
	}

	// Update last login
	if err := s.userRepo.UpdateLastLogin(ctx, user.ID); err != nil {
		// Log error but don't fail the login
		// In production, you would use a proper logger here
	}

	return user, session, nil
}

// Logout invalidates a user session
func (s *AuthService) Logout(ctx context.Context, token string) error {
	if token == "" {
		return fmt.Errorf("session token is required")
	}

	if err := s.sessionRepo.Delete(ctx, token); err != nil {
		return fmt.Errorf("failed to logout: %w", err)
	}

	return nil
}

// ValidateSession validates a session token and returns the user
func (s *AuthService) ValidateSession(ctx context.Context, token string) (*models.AdministrativeEmployee, error) {
	if token == "" {
		return nil, fmt.Errorf("session token is required")
	}

	// Find session
	session, err := s.sessionRepo.FindByToken(ctx, token)
	if err != nil {
		return nil, fmt.Errorf("invalid or expired session")
	}

	// Get user
	user, err := s.userRepo.FindByID(ctx, session.UserID)
	if err != nil {
		return nil, fmt.Errorf("user not found")
	}

	return user, nil
}
