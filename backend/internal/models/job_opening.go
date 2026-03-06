
package models

import (
	"time"

	"gorm.io/gorm"
)

type PostedByType string

const (
	PostedByIndividual PostedByType = "individual"
	PostedByAdmin      PostedByType = "admin"
)

type OpeningStatus string

const (
	OpeningStatusActive  OpeningStatus = "active"
	OpeningStatusClosed  OpeningStatus = "closed"
	OpeningStatusExpired OpeningStatus = "expired"
)

type JobOpening struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	PostedBy        uint           `gorm:"index;not null" json:"posted_by"`
	PostedByUser    *User          `gorm:"foreignKey:PostedBy" json:"posted_by_user,omitempty"`
	PostedByType    PostedByType   `gorm:"type:varchar(50);not null" json:"posted_by_type"`
	CompanyID       uint           `gorm:"index;not null" json:"company_id"`
	Company         *Company       `gorm:"foreignKey:CompanyID" json:"company,omitempty"`
	JobTitle        string         `gorm:"not null" json:"job_title"`
	JobURL          string         `json:"job_url,omitempty"`
	Description     string         `gorm:"type:text" json:"description,omitempty"`
	TechStack       string         `json:"tech_stack,omitempty"`
	ExperienceLevel string         `json:"experience_level,omitempty"` // junior, mid, senior
	Location        string         `json:"location,omitempty"`         // remote, onsite, hybrid
	Salary          string         `json:"salary,omitempty"`
	Status          OpeningStatus  `gorm:"type:varchar(50);default:'active'" json:"status"`
	Views           int            `gorm:"default:0" json:"views"`
	ReferralCount   int            `gorm:"default:0" json:"referral_count"`
	ExpiresAt       *time.Time     `json:"expires_at,omitempty"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	ReferralRequests []ReferralRequestFromOpening `gorm:"foreignKey:OpeningID" json:"referral_requests,omitempty"`
}

func (j *JobOpening) TableName() string {
	return "job_openings"
}
