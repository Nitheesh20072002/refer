package models

import (
	"time"

	"gorm.io/gorm"
)

type RequestStatus string

const (
	StatusOpen                 RequestStatus = "open"
	StatusPendingConfirmation  RequestStatus = "pending_confirmation"
	StatusConfirmed            RequestStatus = "confirmed"
	StatusRejected             RequestStatus = "rejected"
	StatusClosed               RequestStatus = "closed"
)

type ReferralRequest struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	UserID          uint      `gorm:"index;not null" json:"user_id"`
	User            *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	CompanyID       uint      `gorm:"index;not null" json:"company_id"`
	Company         *Company  `gorm:"foreignKey:CompanyID" json:"company,omitempty"`
	JobTitle        string    `gorm:"not null" json:"job_title"`
	JobURL          string    `json:"job_url"`
	Description     string    `gorm:"type:text" json:"description,omitempty"`
	TechStack       string    `json:"tech_stack,omitempty"`
	ExperienceLevel string    `json:"experience_level"` // junior, mid, senior
	Status          RequestStatus `gorm:"type:varchar(50);default:'open'" json:"status"`
	Resume          string    `json:"resume,omitempty"`
	ReferralCount   int       `gorm:"default:0" json:"referral_count"`
	MaxReferrals    int       `gorm:"default:3" json:"max_referrals"`
	ExpiresAt       *time.Time `json:"expires_at,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	Referrals []Referral `gorm:"foreignKey:RequestID" json:"referrals,omitempty"`
}

func (r *ReferralRequest) TableName() string {
	return "referral_requests"
}
