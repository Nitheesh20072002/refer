package services

import (
	"crypto/tls"
	"fmt"
	"log"
	"net/mail"
	"net/smtp"
	"os"
	"strings"
)

// EmailService handles email sending
type EmailService struct {
	From     string
	Username string
	Password string
	Host     string
	Port     string
}

// EmailMessage represents an email to be sent
type EmailMessage struct {
	To      []string
	Subject string
	Body    string
	IsHTML  bool
}

// NewEmailService initializes the email service with environment variables
func NewEmailService() *EmailService {
	return &EmailService{
		From:     os.Getenv("SMTP_FROM"),
		Username: os.Getenv("SMTP_USERNAME"),
		Password: os.Getenv("SMTP_PASSWORD"),
		Host:     os.Getenv("SMTP_HOST"),
		Port:     os.Getenv("SMTP_PORT"),
	}
}

// Send sends an email message
func (es *EmailService) Send(message EmailMessage) error {
	// Validate required fields
	if es.From == "" || es.Host == "" || es.Port == "" {
		log.Println("Warning: Email service not fully configured")
		return fmt.Errorf("email service not configured")
	}

	if len(message.To) == 0 {
		return fmt.Errorf("no recipient email provided")
	}

	// Build email headers
	headers := make(map[string]string)
	headers["From"] = es.From
	headers["To"] = strings.Join(message.To, ",")
	headers["Subject"] = message.Subject

	// Determine content type
	contentType := "text/plain; charset=\"UTF-8\""
	if message.IsHTML {
		contentType = "text/html; charset=\"UTF-8\""
	}
	headers["Content-Type"] = contentType

	// Build message body
	var body strings.Builder
	for k, v := range headers {
		body.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	body.WriteString("\r\n")
	body.WriteString(message.Body)

	// Send email using SMTP
	addr := fmt.Sprintf("%s:%s", es.Host, es.Port)

	// For development/testing with no auth
	if es.Username == "" || es.Password == "" {
		// Try without auth first (for services like mailhog)
		err := es.sendWithoutAuth(addr, message.To, body.String())
		if err == nil {
			return nil
		}
		log.Println("Failed to send without auth, returning error:", err)
		return err
	}

	// Send with authentication (TLS)
	return es.sendWithAuth(addr, message.To, body.String())
}

// sendWithAuth sends email with SMTP authentication and TLS
func (es *EmailService) sendWithAuth(addr string, to []string, body string) error {
	// Create TLS configuration
	tlsconfig := &tls.Config{
		InsecureSkipVerify: false,
		ServerName:         es.Host,
	}

	// Connect to server
	conn, err := tls.Dial("tcp", addr, tlsconfig)
	if err != nil {
		return fmt.Errorf("failed to connect to SMTP server: %w", err)
	}
	defer conn.Close()

	// Create SMTP client
	client, err := smtp.NewClient(conn, es.Host)
	if err != nil {
		return fmt.Errorf("failed to create SMTP client: %w", err)
	}
	defer client.Close()

	// Authenticate
	auth := smtp.PlainAuth("", es.Username, es.Password, es.Host)
	if err = client.Auth(auth); err != nil {
		return fmt.Errorf("SMTP authentication failed: %w", err)
	}

	// Set sender and recipients
	if err = client.Mail(es.From); err != nil {
		return fmt.Errorf("failed to set sender: %w", err)
	}

	for _, recipient := range to {
		if err = client.Rcpt(recipient); err != nil {
			return fmt.Errorf("failed to set recipient %s: %w", recipient, err)
		}
	}

	// Send message
	wc, err := client.Data()
	if err != nil {
		return fmt.Errorf("failed to open message writer: %w", err)
	}
	defer wc.Close()

	_, err = wc.Write([]byte(body))
	if err != nil {
		return fmt.Errorf("failed to write message body: %w", err)
	}

	return client.Quit()
}

// sendWithoutAuth sends email without authentication (for testing/local mail servers)
func (es *EmailService) sendWithoutAuth(addr string, to []string, body string) error {
	// Parse sender email
	sender, err := mail.ParseAddress(es.From)
	if err != nil {
		return fmt.Errorf("invalid sender email: %w", err)
	}

	// Connect to server
	client, err := smtp.Dial(addr)
	if err != nil {
		return fmt.Errorf("failed to connect to SMTP server: %w", err)
	}
	defer client.Close()

	// Set sender
	if err = client.Mail(sender.Address); err != nil {
		return fmt.Errorf("failed to set sender: %w", err)
	}

	// Set recipients
	for _, recipient := range to {
		if err = client.Rcpt(recipient); err != nil {
			return fmt.Errorf("failed to set recipient %s: %w", recipient, err)
		}
	}

	// Send message
	wc, err := client.Data()
	if err != nil {
		return fmt.Errorf("failed to open message writer: %w", err)
	}
	defer wc.Close()

	_, err = wc.Write([]byte(body))
	if err != nil {
		return fmt.Errorf("failed to write message body: %w", err)
	}

	return client.Quit()
}

// SendVerificationEmail sends an email verification link
func (es *EmailService) SendVerificationEmail(email, firstName, verificationToken, verificationURL string) error {
	subject := "Verify Your Email - ReferLoop"

	htmlBody := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #3b82f6; }
        .content { background-color: #f9fafb; padding: 20px; border-radius: 8px; }
        .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background-color: #3b82f6; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
        }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
        .code { background-color: #e5e7eb; padding: 10px; border-radius: 5px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ReferLoop</div>
        </div>
        <div class="content">
            <p>Hello %s,</p>
            <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
            <p>Click the button below to verify your email:</p>
            <a href="%s" class="button">Verify Email</a>
            <p>Or copy and paste this link in your browser:</p>
            <div class="code">%s</div>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create this account, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 ReferLoop. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
`, firstName, verificationURL, verificationURL)

	message := EmailMessage{
		To:      []string{email},
		Subject: subject,
		Body:    htmlBody,
		IsHTML:  true,
	}

	return es.Send(message)
}

// SendPasswordResetEmail sends a password reset email
func (es *EmailService) SendPasswordResetEmail(email, firstName, resetToken, resetURL string) error {
	subject := "Reset Your Password - ReferLoop"

	htmlBody := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #3b82f6; }
        .content { background-color: #f9fafb; padding: 20px; border-radius: 8px; }
        .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background-color: #ef4444; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
        }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
        .code { background-color: #e5e7eb; padding: 10px; border-radius: 5px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ReferLoop</div>
        </div>
        <div class="content">
            <p>Hello %s,</p>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            <a href="%s" class="button">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <div class="code">%s</div>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email or contact support.</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 ReferLoop. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
`, firstName, resetURL, resetURL)

	message := EmailMessage{
		To:      []string{email},
		Subject: subject,
		Body:    htmlBody,
		IsHTML:  true,
	}

	return es.Send(message)
}

// SendReferralNotificationEmail sends a notification about a new referral
func (es *EmailService) SendReferralNotificationEmail(email, referrerName, jobSeekerName, jobTitle string) error {
	subject := fmt.Sprintf("New Referral: %s - ReferLoop", jobTitle)

	htmlBody := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Referral</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #3b82f6; }
        .content { background-color: #f9fafb; padding: 20px; border-radius: 8px; }
        .highlight { background-color: #dbeafe; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; }
        .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background-color: #3b82f6; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
        }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ReferLoop</div>
        </div>
        <div class="content">
            <p>Hello %s,</p>
            <p>Great news! You have a new referral opportunity:</p>
            <div class="highlight">
                <p><strong>Job Seeker:</strong> %s</p>
                <p><strong>Position:</strong> %s</p>
            </div>
            <p>Log in to your ReferLoop dashboard to review the details and confirm the referral.</p>
            <a href="https://referloop.app/dashboard" class="button">View Referral</a>
            <p>Remember, once both parties confirm, you'll earn 100 reward points!</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 ReferLoop. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
`, referrerName, jobSeekerName, jobTitle)

	message := EmailMessage{
		To:      []string{email},
		Subject: subject,
		Body:    htmlBody,
		IsHTML:  true,
	}

	return es.Send(message)
}

// SendRewardNotificationEmail sends a notification about earned rewards
func (es *EmailService) SendRewardNotificationEmail(email, firstName string, points int64, totalPoints int64) error {
	subject := fmt.Sprintf("Congratulations! You earned %d reward points!", points)

	htmlBody := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reward Earned</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #3b82f6; }
        .content { background-color: #f9fafb; padding: 20px; border-radius: 8px; }
        .reward-box { 
            background: linear-gradient(135deg, #fbbf24 0%%, #f59e0b 100%%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        .reward-amount { font-size: 48px; font-weight: bold; }
        .reward-label { font-size: 18px; margin-top: 10px; }
        .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background-color: #3b82f6; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
        }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ReferLoop</div>
        </div>
        <div class="content">
            <p>Hello %s,</p>
            <p>Congratulations! A referral was successfully completed.</p>
            <div class="reward-box">
                <div class="reward-amount">+%d</div>
                <div class="reward-label">Reward Points</div>
            </div>
            <p>Your total reward points: <strong>%d</strong></p>
            <p>Keep referring to earn more points and unlock exclusive benefits!</p>
            <a href="https://referloop.app/rewards" class="button">View Rewards</a>
        </div>
        <div class="footer">
            <p>&copy; 2026 ReferLoop. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
`, firstName, points, totalPoints)

	message := EmailMessage{
		To:      []string{email},
		Subject: subject,
		Body:    htmlBody,
		IsHTML:  true,
	}

	return es.Send(message)
}

// SendWelcomeEmail sends a welcome email to new users
func (es *EmailService) SendWelcomeEmail(email, firstName, role string) error {
	subject := "Welcome to ReferLoop!"

	roleDescription := "job seeker"
	if role == "referrer" {
		roleDescription = "referrer"
	}

	htmlBody := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ReferLoop</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #3b82f6; }
        .content { background-color: #f9fafb; padding: 20px; border-radius: 8px; }
        .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background-color: #3b82f6; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
        }
        .features { margin: 20px 0; }
        .feature { margin: 10px 0; }
        .feature-icon { display: inline-block; width: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ReferLoop</div>
        </div>
        <div class="content">
            <p>Hello %s,</p>
            <p>Welcome to ReferLoop! We're excited to have you on board as a %s.</p>
            <div class="features">
                <div class="feature">✓ Connect with job opportunities and professionals</div>
                <div class="feature">✓ Earn rewards for successful referrals</div>
                <div class="feature">✓ Build your professional network</div>
                <div class="feature">✓ Access exclusive career resources</div>
            </div>
            <p>Get started by completing your profile and exploring opportunities.</p>
            <a href="https://referloop.app/dashboard" class="button">Go to Dashboard</a>
            <p>Questions? Check out our <a href="https://referloop.app/help">help center</a> or contact support.</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 ReferLoop. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
`, firstName, roleDescription)

	message := EmailMessage{
		To:      []string{email},
		Subject: subject,
		Body:    htmlBody,
		IsHTML:  true,
	}

	return es.Send(message)
}
