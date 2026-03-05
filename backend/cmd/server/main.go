package main

import (
	"fmt"
	"log"

	"backend/internal/config"
	"backend/internal/handlers"
	"backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load environment variables
	config.LoadEnv()

	// Initialize database
	db := config.InitDB()
	if db == nil {
		log.Fatal("Failed to initialize database")
	}

	// Set Gin mode
	gin.SetMode(gin.DebugMode)

	// Create router
	router := gin.Default()

	// Global middleware
	router.Use(middleware.CORSMiddleware())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Auth routes (no auth required)
	auth := router.Group("/api/auth")
	{
		auth.POST("/signup", handlers.Signup)
		auth.POST("/login", handlers.Login)
		auth.POST("/verify-email", handlers.VerifyEmail)
		auth.POST("/resend-verification", handlers.ResendVerification)
		auth.POST("/forgot-password", handlers.ForgotPassword)
		auth.POST("/reset-password", handlers.ResetPassword)
	}

	// Public company routes (no auth required for signup)
	router.GET("/api/companies", handlers.GetCompanies)
	router.POST("/api/companies", handlers.CreateCompany)

	// Public referrers list (no auth required)
	router.GET("/api/referrers", handlers.GetReferrers)

	// User routes (auth required)
	user := router.Group("/api/users")
	user.Use(middleware.AuthMiddleware())
	{
		user.GET("/profile", handlers.GetProfile)
		user.PUT("/profile", handlers.UpdateProfile)
	}

	// Referral Request routes (auth required)
	requests := router.Group("/api/requests")
	requests.Use(middleware.AuthMiddleware())
	{
		requests.POST("", handlers.CreateRequest)
		requests.GET("", handlers.GetRequests)
		requests.GET("/:id", handlers.GetRequestByID)
		requests.PUT("/:id", handlers.UpdateRequest)
	}

	// Referral routes (auth required)
	referrals := router.Group("/api/referrals")
	referrals.Use(middleware.AuthMiddleware())
	{
		referrals.POST("", handlers.CreateReferral)
		referrals.GET("", handlers.GetReferrals)
		referrals.PUT("/:id", handlers.UpdateReferral)
		referrals.PUT("/:id/confirm", handlers.ConfirmReferral)
	}

	// Reward routes (auth required)
	rewards := router.Group("/api/rewards")
	rewards.Use(middleware.AuthMiddleware())
	{
		rewards.GET("", handlers.GetRewards)
		rewards.GET("/balance", handlers.GetRewardBalance)
	}

	// Admin routes (admin auth required)
	admin := router.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		admin.GET("/users", handlers.AdminGetUsers)
		admin.GET("/requests", handlers.AdminGetRequests)
		admin.PUT("/verify-referral/:id", handlers.AdminVerifyReferral)
	}

	// Start server
	port := "8000"
	fmt.Printf("🚀 Server running on http://localhost:%s\n", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
