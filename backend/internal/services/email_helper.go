package services

// EmailHelper provides convenience methods for sending emails in handlers
type EmailHelper struct {
	service *EmailService
}

// NewEmailHelper creates a new email helper
func NewEmailHelper() *EmailHelper {
	return &EmailHelper{
		service: NewEmailService(),
	}
}

// SendVerificationEmail is a helper to send verification emails
func (eh *EmailHelper) SendVerificationEmail(email, firstName, token, baseURL string) error {
	verificationURL := baseURL + "/auth/verify-email?token=" + token
	return eh.service.SendVerificationEmail(email, firstName, token, verificationURL)
}

// SendPasswordReset is a helper to send password reset emails
func (eh *EmailHelper) SendPasswordReset(email, firstName, token, baseURL string) error {
	resetURL := baseURL + "/auth/reset-password?token=" + token
	return eh.service.SendPasswordResetEmail(email, firstName, token, resetURL)
}

// SendReferralNotification is a helper to send referral notifications
func (eh *EmailHelper) SendReferralNotification(referrerEmail, referrerName, jobSeekerName, jobTitle string) error {
	return eh.service.SendReferralNotificationEmail(referrerEmail, referrerName, jobSeekerName, jobTitle)
}

// SendRewardNotification is a helper to send reward notifications
func (eh *EmailHelper) SendRewardNotification(email, firstName string, pointsEarned, totalPoints int64) error {
	return eh.service.SendRewardNotificationEmail(email, firstName, pointsEarned, totalPoints)
}

// SendWelcomeEmail is a helper to send welcome emails
func (eh *EmailHelper) SendWelcomeEmail(email, firstName, role string) error {
	return eh.service.SendWelcomeEmail(email, firstName, role)
}
