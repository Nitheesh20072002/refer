
package models

import (
	"time"

	"gorm.io/gorm"
)

type ReferralRequestStatus string

const (
	ReferralRequestStatusPending   ReferralRequestStatus = "pending"
	ReferralRequestStatusAccepted  ReferralRequestStatus = "accepted"
	ReferralRequestStatusRejected  ReferralRequestStatus = "rejected"
	ReferralRequestStatusCompleted ReferralRequestStatus = "completed"
)

type ReferralRequestFromOpening struct {
	ID            uint                  `gorm:"primaryKey" json:"id"`
	OpeningID     uint                  `gorm:"index;not null" json:"opening_id"`
	Opening       *JobOpening           `gorm:"foreignKey:OpeningID" json:"opening,omitempty"`
	RequestedBy   uint                  `gorm:"index;not null" json:"requested_by"`
	JobSeeker     *User                 `gorm:"foreignKey:RequestedBy" json:"job_seeker,omitempty"`
	Status        ReferralRequestStatus `gorm:"type:varchar(50);default:'pending'" json:"status"`
	Resume        string                `json:"resume,omitempty"`
	CoverLetter   string                `gorm:"type:text" json:"cover_letter,omitempty"`
	NotifiedUsers string                `gorm:"type:text" json:"notified_users,omitempty"` // JSON array of user IDs
	AcceptedBy    *uint                 `json:"accepted_by,omitempty"`
	Referrer      *User                 `gorm:"foreignKey:AcceptedBy" json:"referrer,omitempty"`
	CreatedAt     time.Time             `json:"created_at"`
	UpdatedAt     time.Time             `json:"updated_at"`
	DeletedAt     gorm.DeletedAt        `gorm:"index" json:"-"`
}

func (r *ReferralRequestFromOpening) TableName() string {
	return "referral_requests_from_openings"
}
