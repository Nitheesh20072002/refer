package models

import (
	"time"

	"gorm.io/gorm"
)

type UserRole string

const (
	RoleJobSeeker UserRole = "job_seeker"
	RoleReferrer  UserRole = "referrer"
	RoleAdmin     UserRole = "admin"
)

type User struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	Email             string    `gorm:"uniqueIndex;not null" json:"email"`
	Password          string    `gorm:"not null" json:"-"`
	FirstName         string    `json:"first_name"`
	LastName          string    `json:"last_name"`
	Role              UserRole  `gorm:"type:varchar(50);default:'job_seeker'" json:"role"`
	IsVerified        bool      `gorm:"default:false" json:"is_verified"`
	CompanyID         *uint     `json:"company_id,omitempty"`
	Company           *Company  `gorm:"foreignKey:CompanyID" json:"company,omitempty"`
	Resume            string    `json:"resume,omitempty"`
	TechStack         string    `json:"tech_stack,omitempty"`
	LinkedIn          string    `json:"linkedin,omitempty"`
	GitHub            string    `json:"github,omitempty"`
	RewardPoints      int64     `gorm:"default:0" json:"reward_points"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Relations
	ReferralRequests  []ReferralRequest `gorm:"foreignKey:UserID" json:"-"`
	Referrals         []Referral        `gorm:"foreignKey:ReferrerID" json:"-"`
	Rewards           []Reward          `gorm:"foreignKey:UserID" json:"-"`
}

func (u *User) TableName() string {
	return "users"
}
