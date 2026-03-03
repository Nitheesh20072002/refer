package handlers

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"backend/internal/config"
	"backend/internal/models"
	"backend/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type SignupRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=8"`
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Role      string `json:"role" binding:"required,oneof=job_seeker referrer"`
	CompanyID *uint  `json:"company_id"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type VerifyEmailRequest struct {
	Token string `json:"token" binding:"required"`
}

func Signup(c *gin.Context) {
	var req SignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()

	// Check if user already exists
	var existingUser models.User
	if err := db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Account already exists with this email"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process password"})
		return
	}

	// Create user
	user := models.User{
		Email:     req.Email,
		Password:  string(hashedPassword),
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Role:      models.UserRole(req.Role),
		CompanyID: req.CompanyID,
	}

	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Create verification token
	token := uuid.New().String()
	verificationToken := models.VerificationToken{
		UserID:    user.ID,
		Token:     token,
		Type:      "email_verification",
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}
	db.Create(&verificationToken)

	// Send verification email
	emailService := services.NewEmailService()
	baseURL := os.Getenv("FRONTEND_URL")
	if baseURL == "" {
		baseURL = "http://localhost:3000"
	}
	verificationURL := fmt.Sprintf("%s/auth/verify-email?token=%s", baseURL, token)

	if err := emailService.SendVerificationEmail(user.Email, user.FirstName, token, verificationURL); err != nil {
		// Log the error but don't fail the signup
		fmt.Printf("Failed to send verification email: %v\n", err)
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created. Check your email for verification link.",
		"user_id": user.ID,
	})
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()

	// Find user
	var user models.User
	if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if !user.IsVerified {
		c.JSON(http.StatusForbidden, gin.H{"error": "Email not verified"})
		return
	}

	// Generate JWT token
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    user.Role,
		"exp":     time.Now().Add(time.Hour * 24 * 7).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Send login notification email (optional, non-blocking)
	go func() {
		emailService := services.NewEmailService()
		loginTime := time.Now().Format("January 2, 2006 at 3:04 PM MST")
		ipAddress := c.ClientIP()
		userAgent := c.Request.UserAgent()
		
		if err := emailService.SendLoginNotificationEmail(user.Email, user.FirstName, loginTime, ipAddress, userAgent); err != nil {
			fmt.Printf("Failed to send login notification email: %v\n", err)
		}
	}()

	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"user": gin.H{
			"id":     user.ID,
			"email":  user.Email,
			"name":   user.FirstName + " " + user.LastName,
			"role":   user.Role,
		},
	})
}

func VerifyEmail(c *gin.Context) {
	var req VerifyEmailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()

	// Find verification token
	var verifToken models.VerificationToken
	if err := db.Where("token = ? AND type = ? AND expires_at > ?", req.Token, "email_verification", time.Now()).First(&verifToken).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired token"})
		return
	}

	// Mark user as verified
	now := time.Now()
	db.Model(&verifToken).Update("used_at", now)
	db.Model(&models.User{ID: verifToken.UserID}).Update("is_verified", true)

	// Send welcome email
	var user models.User
	db.First(&user, verifToken.UserID)
	emailService := services.NewEmailService()
	if err := emailService.SendWelcomeEmail(user.Email, user.FirstName, string(user.Role)); err != nil {
		// Log the error but don't fail the verification
		fmt.Printf("Failed to send welcome email: %v\n", err)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Email verified successfully"})
}

func ResendVerification(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()

	// Find user
	var user models.User
	if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.IsVerified {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already verified"})
		return
	}

	// Create new verification token
	token := uuid.New().String()
	verificationToken := models.VerificationToken{
		UserID:    user.ID,
		Token:     token,
		Type:      "email_verification",
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}
	db.Create(&verificationToken)

	// Send verification email
	emailService := services.NewEmailService()
	baseURL := os.Getenv("FRONTEND_URL")
	if baseURL == "" {
		baseURL = "http://localhost:3000"
	}
	verificationURL := fmt.Sprintf("%s/auth/verify-email?token=%s", baseURL, token)

	if err := emailService.SendVerificationEmail(user.Email, user.FirstName, token, verificationURL); err != nil {
		// Log the error but don't fail the resend
		fmt.Printf("Failed to send verification email: %v\n", err)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Verification link sent to your email"})
}

// ForgotPasswordRequest handles password reset requests
func ForgotPassword(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()

	// Find user
	var user models.User
	if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		// Don't reveal if user exists or not for security
		c.JSON(http.StatusOK, gin.H{"message": "If an account exists with this email, you will receive a password reset link"})
		return
	}

	// Create password reset token
	token := uuid.New().String()
	resetToken := models.VerificationToken{
		UserID:    user.ID,
		Token:     token,
		Type:      "password_reset",
		ExpiresAt: time.Now().Add(1 * time.Hour), // 1 hour expiry
	}
	db.Create(&resetToken)

	// Send password reset email
	emailService := services.NewEmailService()
	baseURL := os.Getenv("FRONTEND_URL")
	if baseURL == "" {
		baseURL = "http://localhost:3000"
	}
	resetURL := fmt.Sprintf("%s/auth/reset-password?token=%s", baseURL, token)

	if err := emailService.SendPasswordResetEmail(user.Email, user.FirstName, token, resetURL); err != nil {
		// Log the error but don't fail the request
		fmt.Printf("Failed to send password reset email: %v\n", err)
	}

	c.JSON(http.StatusOK, gin.H{"message": "If an account exists with this email, you will receive a password reset link"})
}

// ResetPassword handles password reset
func ResetPassword(c *gin.Context) {
	var req struct {
		Token       string `json:"token" binding:"required"`
		NewPassword string `json:"new_password" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()

	// Find password reset token
	var resetToken models.VerificationToken
	if err := db.Where("token = ? AND type = ? AND expires_at > ? AND used_at IS NULL",
		req.Token, "password_reset", time.Now()).First(&resetToken).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired token"})
		return
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process password"})
		return
	}

	// Update user password
	now := time.Now()
	db.Model(&models.User{ID: resetToken.UserID}).Update("password", string(hashedPassword))
	db.Model(&resetToken).Update("used_at", now)

	c.JSON(http.StatusOK, gin.H{"message": "Password reset successfully"})
}
