package models

import (
	"time"

	"gorm.io/gorm"
)

type RewardType string

const (
	RewardTypeReferral    RewardType = "referral"
	RewardTypeBonus       RewardType = "bonus"
	RewardTypeRedemption  RewardType = "redemption"
)

type Reward struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `gorm:"index;not null" json:"user_id"`
	User       *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	ReferralID *uint     `json:"referral_id,omitempty"`
	Referral   *Referral `gorm:"foreignKey:ReferralID" json:"referral,omitempty"`
	Type       RewardType `gorm:"type:varchar(50)" json:"type"`
	Points     int64     `gorm:"not null" json:"points"`
	Description string   `json:"description,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (r *Reward) TableName() string {
	return "rewards"
}
