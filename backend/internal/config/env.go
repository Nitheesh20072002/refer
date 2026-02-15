package config

import (
	"log"

	"github.com/joho/godotenv"
)

func LoadEnv() {
	// Try loading from parent directory first, then current directory
	err := godotenv.Load("../.env")
	if err != nil {
		err = godotenv.Load()
		if err != nil {
			log.Println("No .env file found, using environment variables")
		}
	}
}
