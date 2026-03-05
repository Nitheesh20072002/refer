package config

import (
	"fmt"
	"log"
	"os"

	"backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() *gorm.DB {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto-migrate models
	db.AutoMigrate(
		&models.User{},
		&models.Company{},
		&models.ReferralRequest{},
		&models.Referral{},
		&models.Reward{},
		&models.VerificationToken{},
		&models.JobOpening{},
		&models.ReferralRequestFromOpening{},
	)

	DB = db
	return db
}

func GetDB() *gorm.DB {
	return DB
}
