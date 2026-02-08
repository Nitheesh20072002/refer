package handlers

import (
	"net/http"

	"backend/internal/config"
	"backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AdminGetUsers(c *gin.Context) {
	db := config.GetDB()

	var users []models.User
	if err := db.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	c.JSON(http.StatusOK, users)
}

func AdminGetRequests(c *gin.Context) {
	db := config.GetDB()

	var requests []models.ReferralRequest
	if err := db.Preload("User").Preload("Company").Preload("Referrals").Find(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch requests"})
		return
	}

	c.JSON(http.StatusOK, requests)
}

func AdminVerifyReferral(c *gin.Context) {
	id := c.Param("id")
	db := config.GetDB()

	var referral models.Referral
	if err := db.First(&referral, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Referral not found"})
		return
	}

	// Admin can manually verify
	referral.Status = models.ReferralStatusVerified

	// Award points if not already awarded
	var reward models.Reward
	if err := db.Where("referral_id = ?", referral.ID).First(&reward).Error; err != nil {
		newReward := models.Reward{
			UserID:      referral.ReferrerID,
			ReferralID:  &referral.ID,
			Type:        models.RewardTypeReferral,
			Points:      100,
			Description: "Admin verified referral",
		}
		db.Create(&newReward)
		db.Model(&models.User{}, referral.ReferrerID).Update("reward_points", gorm.Expr("reward_points + ?", 100))
	}

	if err := db.Save(&referral).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify referral"})
		return
	}

	c.JSON(http.StatusOK, referral)
}
