package handlers

import (
	"net/http"

	"backend/internal/config"
	"backend/internal/models"
	"github.com/gin-gonic/gin"
)

func GetProfile(c *gin.Context) {
	user, _ := c.Get("user")
	c.JSON(http.StatusOK, user)
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
	if err := db.Find(&companies).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch companies"})
		return
	}

	c.JSON(http.StatusOK, companies)
}
