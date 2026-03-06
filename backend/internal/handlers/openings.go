
package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"backend/internal/config"
	"backend/internal/models"
	"backend/internal/services"

	"github.com/gin-gonic/gin"
)

// CreateOpeningRequest represents the request body for creating a job opening
type CreateOpeningRequest struct {
	CompanyID       uint   `json:"company_id" binding:"required"`
	JobTitle        string `json:"job_title" binding:"required"`
	JobURL          string `json:"job_url"`
	Description     string `json:"description"`
	TechStack       string `json:"tech_stack"`
	ExperienceLevel string `json:"experience_level"`
	Location        string `json:"location"`
	Salary          string `json:"salary"`
	ExpiresAt       string `json:"expires_at"` // ISO 8601 format
}

// RequestReferralRequest represents the request body for requesting a referral
type RequestReferralRequest struct {
	Resume      string `json:"resume"`
	CoverLetter string `json:"cover_letter"`
}

// CreateOpening creates a new job opening
// POST /api/openings
func CreateOpening(c *gin.Context) {
	var req CreateOpeningRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	db := config.GetDB()

	// Get user to check role
	var user models.User
	if err := db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Only referrers can create openings
	if user.Role != models.RoleReferrer {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only referrers can post job openings"})
		return
	}

	// Referrers must be associated with a company
	if user.CompanyID == nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "You must be associated with a company to post job openings"})
		return
	}

	// Referrers can only post openings for their own company
	if req.CompanyID != *user.CompanyID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only post job openings for your own company"})
		return
	}

	// Validate company exists
	var company models.Company
	if err := db.First(&company, req.CompanyID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
		return
	}

	// Parse expiration date if provided
	var expiresAt *time.Time
	if req.ExpiresAt != "" {
		parsedTime, err := time.Parse(time.RFC3339, req.ExpiresAt)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid expires_at format. Use ISO 8601 format"})
			return
		}
		expiresAt = &parsedTime
	}

	// Create job opening (always posted by individual referrer)
	opening := models.JobOpening{
		PostedBy:        user.ID,
		PostedByType:    models.PostedByIndividual,
		CompanyID:       req.CompanyID,
		JobTitle:        req.JobTitle,
		JobURL:          req.JobURL,
		Description:     req.Description,
		TechStack:       req.TechStack,
		ExperienceLevel: req.ExperienceLevel,
		Location:        req.Location,
		Salary:          req.Salary,
		Status:          models.OpeningStatusActive,
		ExpiresAt:       expiresAt,
	}

	if err := db.Create(&opening).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create job opening"})
		return
	}

	// Load relations for response
	db.Preload("PostedByUser").Preload("Company").First(&opening, opening.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Job opening created successfully",
		"opening": opening,
	})
}

// ListOpenings lists all active job openings with optional filters
// GET /api/openings
func ListOpenings(c *gin.Context) {
	db := config.GetDB()

	query := db.Model(&models.JobOpening{}).
		Preload("PostedByUser").
		Preload("Company").
		Where("status = ?", models.OpeningStatusActive)

	// Apply filters
	if companyID := c.Query("company_id"); companyID != "" {
		query = query.Where("company_id = ?", companyID)
	}

	if postedByType := c.Query("posted_by_type"); postedByType != "" {
		query = query.Where("posted_by_type = ?", postedByType)
	}

	if experienceLevel := c.Query("experience_level"); experienceLevel != "" {
		query = query.Where("experience_level = ?", experienceLevel)
	}

	if location := c.Query("location"); location != "" {
		query = query.Where("location ILIKE ?", "%"+location+"%")
	}

	if techStack := c.Query("tech_stack"); techStack != "" {
		query = query.Where("tech_stack ILIKE ?", "%"+techStack+"%")
	}

	if search := c.Query("search"); search != "" {
		query = query.Where("job_title ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Sort options
	sortBy := c.DefaultQuery("sort_by", "created_at")
	sortOrder := c.DefaultQuery("sort_order", "desc")
	
	orderClause := fmt.Sprintf("%s %s", sortBy, sortOrder)
	query = query.Order(orderClause)

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	var total int64
	query.Count(&total)

	var openings []models.JobOpening
	if err := query.Offset(offset).Limit(limit).Find(&openings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch openings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"openings": openings,
		"total":    total,
		"page":     page,
		"limit":    limit,
	})
}

// GetOpening gets a single job opening by ID
// GET /api/openings/:id
func GetOpening(c *gin.Context) {
	openingID := c.Param("id")
	db := config.GetDB()

	var opening models.JobOpening
	if err := db.Preload("PostedByUser").
		Preload("Company").
		First(&opening, openingID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Opening not found"})
		return
	}

	// Increment view count
	db.Model(&opening).Updates(map[string]interface{}{
		"views":      opening.Views + 1,
		"updated_at": time.Now(),
	})
	opening.Views++

	c.JSON(http.StatusOK, gin.H{"opening": opening})
}

// UpdateOpening updates a job opening
// PUT /api/openings/:id
func UpdateOpening(c *gin.Context) {
	openingID := c.Param("id")
	userID, _ := c.Get("user_id")

	var req CreateOpeningRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()

	var opening models.JobOpening
	if err := db.First(&opening, openingID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Opening not found"})
		return
	}

	// Check if user is the owner or admin
	var user models.User
	db.First(&user, userID)

	if opening.PostedBy != userID.(uint) && user.Role != models.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only update your own openings"})
		return
	}

	// Parse expiration date if provided
	var expiresAt *time.Time
	if req.ExpiresAt != "" {
		parsedTime, err := time.Parse(time.RFC3339, req.ExpiresAt)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid expires_at format"})
			return
		}
		expiresAt = &parsedTime
	}

	// Update fields
	opening.CompanyID = req.CompanyID
	opening.JobTitle = req.JobTitle
	opening.JobURL = req.JobURL
	opening.Description = req.Description
	opening.TechStack = req.TechStack
	opening.ExperienceLevel = req.ExperienceLevel
	opening.Location = req.Location
	opening.Salary = req.Salary
	opening.ExpiresAt = expiresAt
	opening.UpdatedAt = time.Now()

	if err := db.Save(&opening).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update opening"})
		return
	}

	db.Preload("PostedByUser").Preload("Company").First(&opening, opening.ID)

	c.JSON(http.StatusOK, gin.H{
		"message": "Opening updated successfully",
		"opening": opening,
	})
}

// DeleteOpening soft deletes a job opening
// DELETE /api/openings/:id
func DeleteOpening(c *gin.Context) {
	openingID := c.Param("id")
	userID, _ := c.Get("user_id")

	db := config.GetDB()

	var opening models.JobOpening
	if err := db.First(&opening, openingID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Opening not found"})
		return
	}

	// Check if user is the owner or admin
	var user models.User
	db.First(&user, userID)

	if opening.PostedBy != userID.(uint) && user.Role != models.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only delete your own openings"})
		return
	}

	if err := db.Delete(&opening).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete opening"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Opening deleted successfully"})
}

// GetMyPostings gets all openings posted by the current user
// GET /api/openings/my-postings
func GetMyPostings(c *gin.Context) {
	userID, _ := c.Get("user_id")
	db := config.GetDB()

	var openings []models.JobOpening
	if err := db.Preload("Company").
		Where("posted_by = ?", userID).
		Order("created_at DESC").
		Find(&openings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch openings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"openings": openings})
}

// RequestReferral creates a referral request for a job opening
// POST /api/openings/:id/request
func RequestReferral(c *gin.Context) {
	openingID := c.Param("id")
	userID, _ := c.Get("user_id")

	var req RequestReferralRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()

	// Get user
	var user models.User
	if err := db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Get opening
	var opening models.JobOpening
	if err := db.Preload("PostedByUser").
		Preload("Company").
		First(&opening, openingID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Opening not found"})
		return
	}

	// Prevent referrers from requesting referrals for their own company
	if user.Role == models.RoleReferrer && user.CompanyID != nil {
		if *user.CompanyID == opening.CompanyID {
			c.JSON(http.StatusForbidden, gin.H{"error": "You cannot request a referral for your own company"})
			return
		}
	}

	// Check if opening is active
	if opening.Status != models.OpeningStatusActive {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This opening is no longer active"})
		return
	}

	// Check if already requested
	var existingRequest models.ReferralRequestFromOpening
	if err := db.Where("opening_id = ? AND requested_by = ?", openingID, userID).
		First(&existingRequest).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "You have already requested a referral for this opening"})
		return
	}

	// Create referral request
	referralRequest := models.ReferralRequestFromOpening{
		OpeningID:   opening.ID,
		RequestedBy: user.ID,
		Status:      models.ReferralRequestStatusPending,
		Resume:      req.Resume,
		CoverLetter: req.CoverLetter,
	}

	if err := db.Create(&referralRequest).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create referral request"})
		return
	}

	// Update opening referral count
	db.Model(&opening).Updates(map[string]interface{}{
		"referral_count": opening.ReferralCount + 1,
		"updated_at":     time.Now(),
	})

	// Send notifications based on posted_by_type
	go func() {
		if err := sendReferralNotifications(&opening, &referralRequest, &user); err != nil {
			fmt.Printf("Failed to send notifications: %v\n", err)
		}
	}()

	c.JSON(http.StatusCreated, gin.H{
		"message": "Referral request submitted successfully",
		"request": referralRequest,
	})
}

// sendReferralNotifications sends notifications based on who posted the opening
func sendReferralNotifications(opening *models.JobOpening, request *models.ReferralRequestFromOpening, jobSeeker *models.User) error {
	db := config.GetDB()
	emailService := services.NewEmailHelper()

	jobSeekerName := jobSeeker.FirstName + " " + jobSeeker.LastName

	if opening.PostedByType == models.PostedByIndividual {
		// Only notify the individual who posted
		if opening.PostedByUser == nil {
			db.Preload("PostedByUser").First(&opening, opening.ID)
		}
		
		if opening.PostedByUser != nil {
			err := emailService.SendReferralOpportunityNotification(
				opening.PostedByUser.Email,
				opening.PostedByUser.FirstName,
				jobSeekerName,
				opening.JobTitle,
				opening.Company.Name,
			)
			if err != nil {
				return fmt.Errorf("failed to notify individual: %w", err)
			}
		}
	} else {
		// Notify all employees from the company
		var employees []models.User
		if err := db.Where("company_id = ? AND role = ? AND is_verified = ?",
			opening.CompanyID, models.RoleReferrer, true).
			Find(&employees).Error; err != nil {
			return fmt.Errorf("failed to fetch employees: %w", err)
		}

		var notifiedIDs []uint
		for _, employee := range employees {
			err := emailService.SendReferralOpportunityNotification(
				employee.Email,
				employee.FirstName,
				jobSeekerName,
				opening.JobTitle,
				opening.Company.Name,
			)
			if err == nil {
				notifiedIDs = append(notifiedIDs, employee.ID)
			}
		}

		// Store notified user IDs
		if len(notifiedIDs) > 0 {
			notifiedJSON, _ := json.Marshal(notifiedIDs)
			db.Model(&request).Updates(map[string]interface{}{
				"notified_users": string(notifiedJSON),
				"updated_at":     time.Now(),
			})
		}
	}

	return nil
}

// GetMyRequest checks if the current user has already requested this opening
// GET /api/openings/:id/my-request
func GetMyRequest(c *gin.Context) {
	openingID := c.Param("id")
	userID, _ := c.Get("user_id")

	db := config.GetDB()

	var request models.ReferralRequestFromOpening
	err := db.Preload("Referrer").
		Where("opening_id = ? AND requested_by = ?", openingID, userID).
		First(&request).Error

	if err != nil {
		c.JSON(http.StatusOK, gin.H{"has_requested": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"has_requested": true,
		"request":       request,
	})
}

// GetReferralOpportunities gets openings where the current user was notified
// GET /api/openings/referral-opportunities
func GetReferralOpportunities(c *gin.Context) {
	userID, _ := c.Get("user_id")
	db := config.GetDB()

	// Get user to check company
	var user models.User
	if err := db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.Role != models.RoleReferrer {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only referrers can view opportunities"})
		return
	}

	// Get all requests for openings where user was notified or is the individual poster
	var requests []models.ReferralRequestFromOpening
	
	// Complex query: get requests where user was notified OR user posted as individual
	subQuery := db.Model(&models.JobOpening{}).
		Select("id").
		Where("(posted_by = ? AND posted_by_type = ?) OR (company_id = ? AND posted_by_type = ?)",
			userID, models.PostedByIndividual, user.CompanyID, models.PostedByAdmin)

	if err := db.Preload("Opening.Company").
		Preload("Opening.PostedByUser").
		Preload("JobSeeker").
		Where("opening_id IN (?) AND status = ?", subQuery, models.ReferralRequestStatusPending).
		Order("created_at DESC").
		Find(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch opportunities"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"opportunities": requests})
}

// AcceptReferralRequest accepts a referral request
// POST /api/openings/:id/accept/:request_id
func AcceptReferralRequest(c *gin.Context) {
	openingID := c.Param("id")
	requestID := c.Param("request_id")
	userID, _ := c.Get("user_id")

	db := config.GetDB()

	// Get the request
	var request models.ReferralRequestFromOpening
	if err := db.Preload("Opening").
		Preload("JobSeeker").
		Where("id = ? AND opening_id = ?", requestID, openingID).
		First(&request).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Request not found"})
		return
	}

	if request.Status != models.ReferralRequestStatusPending {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Request is no longer pending"})
		return
	}

	// Verify user can accept this request
	var opening models.JobOpening
	db.First(&opening, openingID)

	var user models.User
	db.First(&user, userID)

	canAccept := false
	if opening.PostedByType == models.PostedByIndividual && opening.PostedBy == userID.(uint) {
		canAccept = true
	} else if opening.PostedByType == models.PostedByAdmin && user.CompanyID != nil && *user.CompanyID == opening.CompanyID {
		canAccept = true
	}

	if !canAccept {
		c.JSON(http.StatusForbidden, gin.H{"error": "You cannot accept this request"})
		return
	}

	// Update request status
	userIDUint := userID.(uint)
	request.Status = models.ReferralRequestStatusAccepted
	request.AcceptedBy = &userIDUint
	request.UpdatedAt = time.Now()

	if err := db.Save(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to accept request"})
		return
	}

	// Send notification to job seeker
	go func() {
		emailService := services.NewEmailHelper()
		emailService.SendReferralAcceptedNotification(
			request.JobSeeker.Email,
			request.JobSeeker.FirstName,
			user.FirstName+" "+user.LastName,
			opening.JobTitle,
			opening.Company.Name,
		)
	}()

	c.JSON(http.StatusOK, gin.H{
		"message": "Request accepted successfully",
		"request": request,
	})
}

// RejectReferralRequest rejects a referral request
// POST /api/openings/:id/reject/:request_id
func RejectReferralRequest(c *gin.Context) {
	openingID := c.Param("id")
	requestID := c.Param("request_id")
	userID, _ := c.Get("user_id")

	db := config.GetDB()

	var request models.ReferralRequestFromOpening
	if err := db.Where("id = ? AND opening_id = ?", requestID, openingID).
		First(&request).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Request not found"})
		return
	}

	if request.Status != models.ReferralRequestStatusPending {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Request is no longer pending"})
		return
	}

	// Verify user can reject this request
	var opening models.JobOpening
	db.First(&opening, openingID)

	var user models.User
	db.First(&user, userID)

	canReject := false
	if opening.PostedByType == models.PostedByIndividual && opening.PostedBy == userID.(uint) {
		canReject = true
	} else if opening.PostedByType == models.PostedByAdmin && user.CompanyID != nil && *user.CompanyID == opening.CompanyID {
		canReject = true
	}

	if !canReject {
		c.JSON(http.StatusForbidden, gin.H{"error": "You cannot reject this request"})
		return
	}

	request.Status = models.ReferralRequestStatusRejected
	request.UpdatedAt = time.Now()

	if err := db.Save(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reject request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Request rejected",
		"request": request,
	})
}
