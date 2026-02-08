package models

import (
	"time"

	"gorm.io/gorm"
)

type Company struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"uniqueIndex;not null" json:"name"`
	Website   string    `json:"website,omitempty"`
	Email     string    `json:"email,omitempty"`
	Logo      string    `json:"logo,omitempty"`
	Domain    string    `gorm:"uniqueIndex;not null" json:"domain"` // e.g., google.com
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	Users []User `gorm:"foreignKey:CompanyID" json:"-"`
	Requests []ReferralRequest `gorm:"foreignKey:CompanyID" json:"-"`
}

func (c *Company) TableName() string {
	return "companies"
}
