package models

import (
	"time"

	"gorm.io/gorm"
)

type ReferralStatus string

const (
	ReferralStatusPending     ReferralStatus = "pending"
	ReferralStatusConfirmed   ReferralStatus = "confirmed"
	ReferralStatusVerified    ReferralStatus = "verified"
	ReferralStatusRejected    ReferralStatus = "rejected"
)

type Referral struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	RequestID       uint      `gorm:"index;not null" json:"request_id"`
	Request         *ReferralRequest `gorm:"foreignKey:RequestID" json:"request,omitempty"`
	ReferrerID      uint      `gorm:"index;not null" json:"referrer_id"`
	Referrer        *User     `gorm:"foreignKey:ReferrerID" json:"referrer,omitempty"`
	Status          ReferralStatus `gorm:"type:varchar(50);default:'pending'" json:"status"`
	ReferrerConfirmedAt *time.Time `json:"referrer_confirmed_at,omitempty"`
	JobSeekerConfirmedAt *time.Time `json:"job_seeker_confirmed_at,omitempty"`
	ReferralProof   string    `gorm:"type:text" json:"referral_proof,omitempty"` // screenshot, referral ID, etc.
	Notes           string    `gorm:"type:text" json:"notes,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

func (r *Referral) TableName() string {
	return "referrals"
}
