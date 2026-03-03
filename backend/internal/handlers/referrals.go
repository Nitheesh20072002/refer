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
	"gorm.io/gorm"
)

type CreateReferralInput struct {
	RequestID uint   `json:"request_id" binding:"required"`
	Notes     string `json:"notes"`
}

func CreateReferral(c *gin.Context) {
	userID, _ := c.Get("user_id")
	user, _ := c.Get("user")
	userObj := user.(models.User)

	var input CreateReferralInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()

	// Check if user is a referrer
	if userObj.Role != models.RoleReferrer {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only employees can make referrals"})
		return
	}

	// Check if user has company verified
	if userObj.CompanyID == nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Company verification required"})
		return
	}

	// Fetch request
	var request models.ReferralRequest
	if err := db.First(&request, input.RequestID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Request not found"})
		return
	}

	// Check if referrer's company matches
	if request.CompanyID != *userObj.CompanyID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Can only refer requests for your company"})
		return
	}

	// Check if request is still open
	if request.Status != models.StatusOpen {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Request is no longer open"})
		return
	}

	// Check max referrals reached
	if request.ReferralCount >= request.MaxReferrals {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Maximum referrals reached for this request"})
		return
	}

	// Check duplicate referral
	var existingReferral models.Referral
	if err := db.Where("request_id = ? AND referrer_id = ?", input.RequestID, userID).First(&existingReferral).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "You have already referred this request"})
		return
	}

	// Create referral
	referral := models.Referral{
		RequestID:  input.RequestID,
		ReferrerID: userID.(uint),
		Status:     models.ReferralStatusPending,
		Notes:      input.Notes,
	}

	if err := db.Create(&referral).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create referral"})
		return
	}

	// Update request referral count and status
	request.ReferralCount++
	if request.ReferralCount > 0 {
		request.Status = models.StatusPendingConfirmation
	}
	db.Save(&request)

	// Send notification email to the referrer
	baseURL := os.Getenv("FRONTEND_URL")
	if baseURL == "" {
		baseURL = "http://localhost:3000"
	}

	// Fetch request details for email
	db.Preload("User").First(&request, input.RequestID)
	if request.User != nil {
		emailHelper := services.NewEmailHelper()
		jobTitle := "Job Opportunity"
		// You might want to add JobTitle field to ReferralRequest model
		if err := emailHelper.SendReferralNotification(
			request.User.Email,
			userObj.FirstName,
			request.User.FirstName,
			jobTitle,
		); err != nil {
			// Log error but don't fail the request
			fmt.Printf("Failed to send referral notification email: %v\n", err)
		}
	}

	c.JSON(http.StatusCreated, referral)
}

func GetReferrals(c *gin.Context) {
	userID, _ := c.Get("user_id")
	user, _ := c.Get("user")
	userObj := user.(models.User)

	db := config.GetDB()

	var referrals []models.Referral
	query := db

	// Referrers see their referrals
	// Job seekers see referrals on their requests
	if userObj.Role == models.RoleReferrer {
		query = query.Where("referrer_id = ?", userID)
	} else if userObj.Role == models.RoleJobSeeker {
		query = query.Joins("JOIN referral_requests ON referrals.request_id = referral_requests.id").
			Where("referral_requests.user_id = ?", userID)
	}

	if err := query.Preload("Request").Preload("Referrer").Find(&referrals).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch referrals"})
		return
	}

	c.JSON(http.StatusOK, referrals)
}

func UpdateReferral(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")
	db := config.GetDB()

	var referral models.Referral
	if err := db.First(&referral, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Referral not found"})
		return
	}

	// Only referrer can update their referral
	if referral.ReferrerID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized"})
		return
	}

	var input struct {
		Status         string `json:"status"`
		ReferralProof  string `json:"referral_proof"`
		Notes          string `json:"notes"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Status != "" {
		referral.Status = models.ReferralStatus(input.Status)
	}
	if input.ReferralProof != "" {
		referral.ReferralProof = input.ReferralProof
	}
	if input.Notes != "" {
		referral.Notes = input.Notes
	}

	if err := db.Save(&referral).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update referral"})
		return
	}

	c.JSON(http.StatusOK, referral)
}

func ConfirmReferral(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")
	user, _ := c.Get("user")
	userObj := user.(models.User)

	db := config.GetDB()

	var referral models.Referral
	if err := db.Preload("Request").First(&referral, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Referral not found"})
		return
	}

	// Check who's confirming
	if userObj.Role == models.RoleReferrer {
		if referral.ReferrerID != userID.(uint) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized"})
			return
		}
		now := time.Now()
		referral.ReferrerConfirmedAt = &now
	} else if userObj.Role == models.RoleJobSeeker {
		if referral.Request.UserID != userID.(uint) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized"})
			return
		}
		now := time.Now()
		referral.JobSeekerConfirmedAt = &now
	} else {
		c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized"})
		return
	}

	// Check if both confirmed
	if referral.ReferrerConfirmedAt != nil && referral.JobSeekerConfirmedAt != nil {
		referral.Status = models.ReferralStatusVerified

		// Award points to referrer
		reward := models.Reward{
			UserID:      referral.ReferrerID,
			ReferralID:  &referral.ID,
			Type:        models.RewardTypeReferral,
			Points:      100, // Default reward points
			Description: "Referral confirmed",
		}
		db.Create(&reward)

		// Update user's reward points
		db.Model(&models.User{ID: referral.ReferrerID}).Update("reward_points", gorm.Expr("reward_points + ?", 100))

		// Fetch referrer details for email notification
		var referrer models.User
		db.First(&referrer, referral.ReferrerID)
		emailHelper := services.NewEmailHelper()
		if err := emailHelper.SendRewardNotification(
			referrer.Email,
			referrer.FirstName,
			100,
			referrer.RewardPoints + 100,
		); err != nil {
			// Log error but don't fail the request
			fmt.Printf("Failed to send reward notification email: %v\n", err)
		}

		// Close the request
		referral.Request.Status = models.StatusClosed
		db.Save(&referral.Request)
	} else {
		referral.Status = models.ReferralStatusConfirmed
	}

	if err := db.Save(&referral).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to confirm referral"})
		return
	}

	c.JSON(http.StatusOK, referral)
}
