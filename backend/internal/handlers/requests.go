package handlers

import (
	"net/http"
	"time"

	"backend/internal/config"
	"backend/internal/models"
	"github.com/gin-gonic/gin"
)

type CreateRequestInput struct {
	CompanyID       uint   `json:"company_id" binding:"required"`
	JobTitle        string `json:"job_title" binding:"required"`
	JobURL          string `json:"job_url"`
	Description     string `json:"description"`
	TechStack       string `json:"tech_stack"`
	ExperienceLevel string `json:"experience_level"`
	Resume          string `json:"resume"`
	MaxReferrals    int    `json:"max_referrals"`
}

func CreateRequest(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var input CreateRequestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()

	// Check if user is a job seeker
	var user models.User
	if err := db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.Role != models.RoleJobSeeker {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only job seekers can create requests"})
		return
	}

	// Check if company exists
	var company models.Company
	if err := db.First(&company, input.CompanyID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
		return
	}

	maxReferrals := input.MaxReferrals
	if maxReferrals == 0 {
		maxReferrals = 3
	}

	request := models.ReferralRequest{
		UserID:           userID.(uint),
		CompanyID:        input.CompanyID,
		JobTitle:         input.JobTitle,
		JobURL:           input.JobURL,
		Description:      input.Description,
		TechStack:        input.TechStack,
		ExperienceLevel:  input.ExperienceLevel,
		Resume:           input.Resume,
		Status:           models.StatusOpen,
		MaxReferrals:     maxReferrals,
		ExpiresAt:        nil, // Optional: can set expiration later
	}

	if err := db.Create(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
		return
	}

	c.JSON(http.StatusCreated, request)
}

func GetRequests(c *gin.Context) {
	db := config.GetDB()
	
	// Query parameters
	status := c.Query("status")
	companyID := c.Query("company_id")
	userID, _ := c.Get("user_id")
	user, _ := c.Get("user")
	userObj := user.(models.User)

	var requests []models.ReferralRequest
	query := db

	if status != "" {
		query = query.Where("status = ?", status)
	}

	// Job seekers see their own requests
	// Referrers see open requests from their company
	if userObj.Role == models.RoleJobSeeker {
		query = query.Where("user_id = ?", userID)
	} else if userObj.Role == models.RoleReferrer && userObj.CompanyID != nil {
		query = query.Where("company_id = ? AND status = ?", *userObj.CompanyID, models.StatusOpen)
	}

	if companyID != "" {
		query = query.Where("company_id = ?", companyID)
	}

	if err := query.Preload("User").Preload("Company").Find(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch requests"})
		return
	}

	c.JSON(http.StatusOK, requests)
}

func GetRequestByID(c *gin.Context) {
	id := c.Param("id")
	db := config.GetDB()

	var request models.ReferralRequest
	if err := db.Preload("User").Preload("Company").Preload("Referrals").First(&request, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Request not found"})
		return
	}

	c.JSON(http.StatusOK, request)
}

func UpdateRequest(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")
	db := config.GetDB()

	var request models.ReferralRequest
	if err := db.First(&request, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Request not found"})
		return
	}

	// Check authorization - only creator can update
	if request.UserID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized"})
		return
	}

	var input struct {
		Status    string     `json:"status"`
		MaxReferrals int    `json:"max_referrals"`
		ExpiresAt *time.Time `json:"expires_at"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Status != "" {
		request.Status = models.RequestStatus(input.Status)
	}
	if input.MaxReferrals > 0 {
		request.MaxReferrals = input.MaxReferrals
	}
	if input.ExpiresAt != nil {
		request.ExpiresAt = input.ExpiresAt
	}

	if err := db.Save(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update request"})
		return
	}

	c.JSON(http.StatusOK, request)
}
