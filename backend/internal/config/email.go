package config

import (
	"os"
)

// EmailConfig holds email service configuration
type EmailConfig struct {
	SMTPHost     string
	SMTPPort     string
	SMTPUsername string
	SMTPPassword string
	SMTPFrom     string
	SMTPTLS      bool
	FrontendURL  string
}

// GetEmailConfig returns email configuration from environment variables
func GetEmailConfig() *EmailConfig {
	return &EmailConfig{
		SMTPHost:     os.Getenv("SMTP_HOST"),
		SMTPPort:     os.Getenv("SMTP_PORT"),
		SMTPUsername: os.Getenv("SMTP_USERNAME"),
		SMTPPassword: os.Getenv("SMTP_PASSWORD"),
		SMTPFrom:     os.Getenv("SMTP_FROM"),
		SMTPTLS:      os.Getenv("SMTP_TLS") == "true",
		FrontendURL:  os.Getenv("FRONTEND_URL"),
	}
}

// IsConfigured checks if email service is properly configured
func (ec *EmailConfig) IsConfigured() bool {
	return ec.SMTPHost != "" && ec.SMTPPort != "" && ec.SMTPFrom != ""
}
