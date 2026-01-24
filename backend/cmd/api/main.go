package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/goldenkiwi/autoparc/internal/config"
	"github.com/goldenkiwi/autoparc/internal/database"
	"github.com/goldenkiwi/autoparc/internal/handlers"
	"github.com/goldenkiwi/autoparc/internal/middleware"
	"github.com/goldenkiwi/autoparc/internal/repository"
	"github.com/goldenkiwi/autoparc/internal/service"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Connect to database
	db, err := database.New(&cfg.Database)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	log.Println("Connected to database successfully")

	// Initialize repositories
	userRepo := repository.NewUserRepository(db.DB)
	sessionRepo := repository.NewSessionRepository(db.DB)
	carRepo := repository.NewCarRepository(db.DB)
	insuranceRepo := repository.NewInsuranceRepository(db.DB)
	actionLogRepo := repository.NewActionLogRepository(db.DB)

	// Initialize services
	authService := service.NewAuthService(userRepo, sessionRepo)
	carService := service.NewCarService(carRepo, insuranceRepo, actionLogRepo)
	insuranceService := service.NewInsuranceService(insuranceRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService, &cfg.Session)
	carHandler := handlers.NewCarHandler(carService)
	insuranceHandler := handlers.NewInsuranceHandler(insuranceService)

	// Create router
	mux := http.NewServeMux()

	// Health check endpoint
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		// Check database health
		if err := db.HealthCheck(r.Context()); err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			fmt.Fprintf(w, `{"status":"error","message":"Database unavailable"}`)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"status":"ok","message":"AutoParc API is running"}`)
	})

	// Public routes
	mux.HandleFunc("POST /api/v1/auth/login", authHandler.Login)

	// Protected routes - Auth
	authMux := http.NewServeMux()
	authMux.HandleFunc("GET /api/v1/auth/me", authHandler.GetMe)
	authMux.HandleFunc("POST /api/v1/auth/logout", authHandler.Logout)

	// Protected routes - Cars
	authMux.HandleFunc("GET /api/v1/cars", carHandler.GetCars)
	authMux.HandleFunc("POST /api/v1/cars", carHandler.CreateCar)
	authMux.HandleFunc("GET /api/v1/cars/{id}", carHandler.GetCar)
	authMux.HandleFunc("PUT /api/v1/cars/{id}", carHandler.UpdateCar)
	authMux.HandleFunc("DELETE /api/v1/cars/{id}", carHandler.DeleteCar)

	// Protected routes - Insurance
	authMux.HandleFunc("GET /api/v1/insurance-companies", insuranceHandler.GetInsuranceCompanies)

	// Apply auth middleware to protected routes
	mux.Handle("/api/v1/auth/me", middleware.AuthMiddleware(authService, cfg.Session.CookieName)(authMux))
	mux.Handle("/api/v1/auth/logout", middleware.AuthMiddleware(authService, cfg.Session.CookieName)(authMux))
	mux.Handle("/api/v1/cars", middleware.AuthMiddleware(authService, cfg.Session.CookieName)(authMux))
	mux.Handle("/api/v1/cars/", middleware.AuthMiddleware(authService, cfg.Session.CookieName)(authMux))
	mux.Handle("/api/v1/insurance-companies", middleware.AuthMiddleware(authService, cfg.Session.CookieName)(authMux))

	// Apply global middleware
	handler := middleware.Logger(middleware.CORS(cfg.Server.AllowedOrigins)(mux))

	// Create server
	addr := fmt.Sprintf("127.0.0.1:%s", cfg.Server.Port)
	server := &http.Server{
		Addr:         addr,
		Handler:      handler,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Server starting on %s", addr)
		log.Printf("Environment: %s", cfg.Server.Environment)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), cfg.Server.ShutdownTimeout)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited gracefully")
}
