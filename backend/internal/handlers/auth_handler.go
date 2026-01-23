package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/goldenkiwi/autoparc/internal/config"
	"github.com/goldenkiwi/autoparc/internal/middleware"
	"github.com/goldenkiwi/autoparc/internal/models"
	"github.com/goldenkiwi/autoparc/internal/service"
)

// AuthHandler handles authentication-related HTTP requests
type AuthHandler struct {
	authService   *service.AuthService
	sessionConfig *config.SessionConfig
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(authService *service.AuthService, sessionConfig *config.SessionConfig) *AuthHandler {
	return &AuthHandler{
		authService:   authService,
		sessionConfig: sessionConfig,
	}
}

// Login handles POST /api/v1/auth/login
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	// Get IP and user agent
	ipAddress := r.RemoteAddr
	userAgent := r.UserAgent()

	user, session, err := h.authService.Login(r.Context(), req.Email, req.Password, ipAddress, userAgent)
	if err != nil {
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": err.Error()})
		return
	}

	// Set session cookie
	sameSite := http.SameSiteLaxMode
	if h.sessionConfig.CookieSameSite == "Strict" {
		sameSite = http.SameSiteStrictMode
	} else if h.sessionConfig.CookieSameSite == "None" {
		sameSite = http.SameSiteNoneMode
	}

	http.SetCookie(w, &http.Cookie{
		Name:     h.sessionConfig.CookieName,
		Value:    session.SessionToken,
		Path:     h.sessionConfig.CookiePath,
		MaxAge:   h.sessionConfig.CookieMaxAge,
		HttpOnly: h.sessionConfig.CookieHTTPOnly,
		Secure:   h.sessionConfig.CookieSecure,
		SameSite: sameSite,
	})

	respondJSON(w, http.StatusOK, models.LoginResponse{User: user})
}

// GetMe handles GET /api/v1/auth/me
func (h *AuthHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(middleware.UserContextKey).(*models.AdministrativeEmployee)
	respondJSON(w, http.StatusOK, map[string]interface{}{"user": user})
}

// Logout handles POST /api/v1/auth/logout
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	// Get session cookie
	cookie, err := r.Cookie(h.sessionConfig.CookieName)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "No session found"})
		return
	}

	// Logout
	if err := h.authService.Logout(r.Context(), cookie.Value); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to logout"})
		return
	}

	// Clear cookie
	http.SetCookie(w, &http.Cookie{
		Name:     h.sessionConfig.CookieName,
		Value:    "",
		Path:     h.sessionConfig.CookiePath,
		MaxAge:   -1,
		HttpOnly: h.sessionConfig.CookieHTTPOnly,
		Secure:   h.sessionConfig.CookieSecure,
	})

	respondJSON(w, http.StatusOK, map[string]string{"message": "Logged out successfully"})
}

// respondJSON sends a JSON response
func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}
