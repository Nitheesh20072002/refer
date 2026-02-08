package models

import (
	"time"

	"gorm.io/gorm"
)

type VerificationToken struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"index;not null" json:"user_id"`
	User      *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Token     string    `gorm:"uniqueIndex;not null" json:"token"`
	Type      string    `gorm:"type:varchar(50)" json:"type"` // email_verification, password_reset
	ExpiresAt time.Time `gorm:"index" json:"expires_at"`
	UsedAt    *time.Time `json:"used_at,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (v *VerificationToken) TableName() string {
	return "verification_tokens"
}
