package handlers

import (
	"fmt"
	"net/http"

	"backend/internal/config"
	"backend/internal/models"
	"github.com/gin-gonic/gin"
)

func GetProfile(c *gin.Context) {
	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}
	
	user := userInterface.(models.User)
	
	// Return user with all fields
	c.JSON(http.StatusOK, gin.H{
		"id": user.ID,
		"email": user.Email,
		"first_name": user.FirstName,
		"last_name": user.LastName,
		"role": user.Role,
		"company_id": user.CompanyID,
		"is_verified": user.IsVerified,
	})
}

func UpdateProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var req struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		LinkedIn  string `json:"linkedin"`
		GitHub    string `json:"github"`
		TechStack string `json:"tech_stack"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()
	
	var user models.User
	if err := db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if req.FirstName != "" {
		user.FirstName = req.FirstName
	}
	if req.LastName != "" {
		user.LastName = req.LastName
	}
	if req.LinkedIn != "" {
		user.LinkedIn = req.LinkedIn
	}
	if req.GitHub != "" {
		user.GitHub = req.GitHub
	}
	if req.TechStack != "" {
		user.TechStack = req.TechStack
	}

	if err := db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func GetCompanies(c *gin.Context) {
	db := config.GetDB()
	
	var companies []models.Company
	if err := db.Order("name ASC").Find(&companies).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch companies"})
		return
	}

	c.JSON(http.StatusOK, companies)
}

func GetCompany(c *gin.Context) {
	db := config.GetDB()
	companyID := c.Param("id")

	var company models.Company
	if err := db.First(&company, companyID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
		return
	}

	c.JSON(http.StatusOK, company)
}

// CreateCompany creates a new company (public endpoint for signup)
func CreateCompany(c *gin.Context) {
	var req struct {
		Name    string `json:"name" binding:"required"`
		Website string `json:"website"`
		Domain  string `json:"domain" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.GetDB()

	// Check if company already exists
	var existingCompany models.Company
	if err := db.Where("name = ? OR domain = ?", req.Name, req.Domain).First(&existingCompany).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Company already exists", "company": existingCompany})
		return
	}

	// Create new company
	company := models.Company{
		Name:    req.Name,
		Website: req.Website,
		Domain:  req.Domain,
	}

	if err := db.Create(&company).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create company"})
		return
	}

	c.JSON(http.StatusCreated, company)
}

// GetReferrers returns a list of all referrers with optional search filters
func GetReferrers(c *gin.Context) {
	db := config.GetDB()

	// Get query parameters
	search := c.Query("search")       // General search (name, tech_stack)
	companyID := c.Query("company_id") // Filter by company
	techStack := c.Query("tech_stack") // Filter by tech stack

	// Start building query - don't use Select with Preload as it causes issues
	query := db.Model(&models.User{}).Where("role = ?", "referrer")

	// Apply filters
	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where(
			"LOWER(first_name) LIKE LOWER(?) OR LOWER(last_name) LIKE LOWER(?) OR LOWER(tech_stack) LIKE LOWER(?)",
			searchPattern, searchPattern, searchPattern,
		)
	}

	if companyID != "" {
		query = query.Where("company_id = ?", companyID)
	}

	if techStack != "" {
		query = query.Where("LOWER(tech_stack) LIKE LOWER(?)", "%"+techStack+"%")
	}

	// Fetch referrers
	var referrers []models.User
	if err := query.Preload("Company").Order("first_name ASC").Find(&referrers).Error; err != nil {
		// Log the actual error for debugging
		fmt.Printf("Error fetching referrers: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch referrers"})
		return
	}

	c.JSON(http.StatusOK, referrers)
}
