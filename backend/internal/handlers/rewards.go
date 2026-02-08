package handlers

import (
	"net/http"

	"backend/internal/config"
	"backend/internal/models"
	"github.com/gin-gonic/gin"
)

func GetRewards(c *gin.Context) {
	userID, _ := c.Get("user_id")
	db := config.GetDB()

	var rewards []models.Reward
	if err := db.Where("user_id = ?", userID).Preload("Referral").Find(&rewards).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch rewards"})
		return
	}

	c.JSON(http.StatusOK, rewards)
}

func GetRewardBalance(c *gin.Context) {
	userID, _ := c.Get("user_id")
	db := config.GetDB()

	var user models.User
	if err := db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"reward_points": user.RewardPoints,
	})
}
