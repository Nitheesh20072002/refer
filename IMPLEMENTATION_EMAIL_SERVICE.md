# Email Service Implementation - ReferLoop Backend

## Overview

A production-ready email service has been implemented for the ReferLoop backend. The service handles user communications including email verification, welcome emails, referral notifications, and reward notifications.

## What's Implemented

### 1. Core Email Service
- **File**: `backend/internal/services/email.go`
- **Features**:
  - SMTP-based email sending with TLS support
  - Support for both authenticated and unauthenticated connections
  - HTML and plain text email support
  - Connection pooling via SMTP
  - Comprehensive error handling and logging

### 2. Email Templates
Pre-built professional HTML templates for:
- **Email Verification**: Secure link for new user email confirmation
- **Welcome Email**: Personalized welcome message based on user role
- **Referral Notification**: Alerts when new referral opportunities arrive
- **Reward Notification**: Celebrates successful referrals with points earned
- **Password Reset**: Ready for future password recovery feature

### 3. Email Helper Service
- **File**: `backend/internal/services/email_helper.go`
- **Purpose**: Convenient wrapper for handlers to send emails
- **Methods**:
  - `SendVerificationEmail()`
  - `SendPasswordReset()`
  - `SendReferralNotification()`
  - `SendRewardNotification()`
  - `SendWelcomeEmail()`

### 4. Email Configuration
- **File**: `backend/internal/config/email.go`
- **Features**:
  - Load SMTP settings from environment variables
  - Validate email configuration
  - Support multiple email providers

### 5. Handler Integration
Updated handlers now send emails:
- **Auth Handler** (`auth.go`):
  - Sends verification email on signup
  - Sends welcome email on verification
  - Resends verification emails on request

- **Referrals Handler** (`referrals.go`):
  - Sends referral notification when new referral created
  - Sends reward notification when referral is verified

## Project Structure

```
backend/
├── internal/
│   ├── services/
│   │   ├── email.go              # Main email service
│   │   └── email_helper.go       # Helper functions
│   ├── config/
│   │   ├── email.go              # Email configuration
│   │   ├── env.go                # Environment loader
│   │   ├── database.go           # Database config
│   │   └── database_init.go      # DB initialization
│   ├── handlers/
│   │   ├── auth.go               # Updated with email integration
│   │   ├── referrals.go          # Updated with email notifications
│   │   ├── users.go
│   │   ├── requests.go
│   │   ├── rewards.go
│   │   └── admin.go
│   ├── middleware/
│   │   └── auth.go
│   └── models/
│       ├── user.go
│       ├── referral.go
│       ├── request.go
│       ├── reward.go
│       ├── company.go
│       └── verification.go
├── migrations/
│   └── 001_init.sql
├── cmd/
│   └── server/
│       └── main.go
├── go.mod
├── go.sum
└── Dockerfile

docs/
└── EMAIL_SERVICE_SETUP.md        # Detailed setup guide
```

## Environment Variables Required

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com           # Email provider's SMTP host
SMTP_PORT=587                      # Usually 587 (TLS) or 465 (SSL)
SMTP_USERNAME=your-email@gmail.com # Email account username
SMTP_PASSWORD=app-password         # App-specific password
SMTP_FROM=noreply@referloop.app   # Sender email address
SMTP_TLS=true                      # Use TLS encryption (recommended)

# Application
FRONTEND_URL=http://localhost:3000 # Frontend base URL for email links
```

## Email Flow Diagrams

### Signup Flow
```
User Signs Up
    ↓
Handler creates verification token
    ↓
Email service sends verification email
    ↓
User clicks link in email
    ↓
Handler verifies token
    ↓
Welcome email sent
    ↓
User can now login
```

### Referral Flow
```
Referrer submits referral
    ↓
Referral created in database
    ↓
Notification email sent to job seeker
    ↓
Job seeker confirms referral
    ↓
Referrer confirms referral
    ↓
Points awarded
    ↓
Reward notification email sent
```

## Key Features

### 1. Provider Agnostic
- Works with Gmail, SendGrid, Mailgun, AWS SES, Postmark, etc.
- Easy configuration via environment variables
- Support for custom SMTP servers

### 2. Robust Error Handling
- Graceful degradation - email failures don't break user flows
- Comprehensive logging of email errors
- Automatic fallback between authenticated and unauthenticated modes

### 3. Professional Templates
- Branded HTML emails with company styling
- Responsive design for mobile and desktop
- Clear call-to-action buttons
- Professional footer with links

### 4. Security
- TLS encryption for SMTP connections
- No sensitive data in logs
- Verification token handling
- Token expiration (24 hours for email verification)

### 5. Testing Support
- Easy integration with MailHog for local testing
- No emails actually sent in test mode
- Full debugging of email content and structure

## Usage Examples

### Sending a Verification Email
```go
import "backend/internal/services"

emailHelper := services.NewEmailHelper()
err := emailHelper.SendVerificationEmail(
    "user@example.com",
    "John",
    "token-uuid",
    "http://localhost:3000",
)
if err != nil {
    log.Printf("Email error: %v", err)
}
```

### Sending a Referral Notification
```go
emailHelper := services.NewEmailHelper()
err := emailHelper.SendReferralNotification(
    "referrer@example.com",
    "Alice",
    "Bob",
    "Senior Software Engineer",
)
```

### Sending a Reward Notification
```go
emailHelper := services.NewEmailHelper()
err := emailHelper.SendRewardNotification(
    "referrer@example.com",
    "Alice",
    100,  // points earned
    1200, // total points
)
```

## Testing the Email Service

### 1. With Gmail (Production-Like)
```bash
# Get Gmail app password and set in .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=<16-char app password>
SMTP_FROM=your-email@gmail.com

# Run tests
go test ./internal/services -v
```

### 2. With MailHog (Local Testing)
```bash
# Install and run MailHog
brew install mailhog
mailhog

# Set in .env
SMTP_HOST=localhost
SMTP_PORT=1025

# Access web UI at http://localhost:1025
# View all sent emails in the UI
```

### 3. Manual Testing with Curl
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "job_seeker"
  }'
```

## Dependencies

The email service uses only Go standard library:
- `net/smtp` - SMTP protocol
- `crypto/tls` - TLS connections
- `fmt` - String formatting
- `os` - Environment variables
- `strings` - String manipulation

**No external dependencies added** - leverages Go's excellent standard library!

## Configuration Examples

### Gmail
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=<app-specific-password>
SMTP_FROM=your-email@gmail.com
SMTP_TLS=true
```

### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxxx
SMTP_FROM=noreply@company.com
SMTP_TLS=true
```

### AWS SES
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USERNAME=<SMTP Username from AWS>
SMTP_PASSWORD=<SMTP Password from AWS>
SMTP_FROM=verified-sender@company.com
SMTP_TLS=true
```

## Best Practices Implemented

✅ **Non-blocking**: Email sending failures don't prevent user operations
✅ **Error logging**: All failures are logged for debugging
✅ **HTML templates**: Professional, responsive design
✅ **Token security**: Unique tokens with expiration
✅ **Environment-based**: All config from environment variables
✅ **Type-safe**: Strong typing in Go prevents runtime errors
✅ **Modular**: Easy to extend with new email types
✅ **No external deps**: Only Go standard library

## Future Enhancements

Potential additions (not required for MVP):
- Email template management system
- Email delivery tracking
- Unsubscribe links and preference centers
- A/B testing for templates
- Scheduled/batch email sending
- Email analytics and reporting
- SMS notifications as backup
- Push notifications integration

## Troubleshooting

### Emails Not Sending
1. Check environment variables are set: `echo $SMTP_HOST`
2. Verify SMTP credentials are correct
3. For Gmail: Ensure app-specific password is used, not regular password
4. Check that SMTP port is not blocked by firewall

### Authentication Failures
- Gmail: Use 16-character app password
- SendGrid: Username should be "apikey"
- Custom servers: Verify credentials with provider

### Connection Errors
- Check SMTP_HOST and SMTP_PORT are correct
- Verify network connectivity to email server
- Check firewall rules allow outbound SMTP

## Documentation

- **Setup Guide**: See `EMAIL_SERVICE_SETUP.md` for detailed configuration
- **API Reference**: Handler documentation in comments
- **Examples**: See handler implementations in `internal/handlers/`

## Support & Monitoring

### Logs
Check backend logs for email send attempts:
```bash
docker logs refer-backend
# or
tail -f backend.log
```

### Monitoring in Production
- Monitor SMTP connection success rate
- Track email delivery errors
- Alert on authentication failures
- Log bounce rate for compliance

## Security Considerations

✅ Credentials stored in environment variables only
✅ TLS encryption for all SMTP connections
✅ Tokens expire after 24 hours
✅ No user passwords in emails
✅ Verification tokens are UUIDs (cryptographically secure)
✅ Email sending failures are silent to users (graceful degradation)

## Performance Notes

- Email sending is synchronous (blocks briefly)
- SMTP connections are quick (~100-500ms per email)
- For high volume, consider async email queue (future enhancement)
- Current implementation handles typical usage fine

## Version History

**v1.0.0** - Initial Implementation
- Core email service
- Five email templates
- Integration with auth and referral handlers
- Support for major email providers
- Comprehensive documentation
