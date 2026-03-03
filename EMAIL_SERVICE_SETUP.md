# Email Service Configuration Guide

## Overview

The ReferLoop backend now includes a complete email service that handles:
- Email verification on signup
- Welcome emails
- Referral notifications
- Reward notifications
- Password reset (ready for future implementation)

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env` file in the project root:

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@referloop.app
SMTP_TLS=true

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
# For production:
# FRONTEND_URL=https://referloop.app
```

### 2. Email Provider Setup

#### Gmail (Recommended for Development)

1. Go to [Google Account Security Settings](https://myaccount.google.com/security)
2. Enable "2-Step Verification"
3. Create an "App Password":
   - Go to "App passwords" in Security settings
   - Select "Mail" and "Windows Computer" (or your device)
   - Generate a 16-character password
   - Use this as `SMTP_PASSWORD` in `.env`

#### SendGrid

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=SG.your-sendgrid-api-key
SMTP_FROM=noreply@referloop.app
SMTP_TLS=true
```

#### Mailgun

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USERNAME=your-mailgun-username
SMTP_PASSWORD=your-mailgun-password
SMTP_FROM=noreply@referloop.app
SMTP_TLS=true
```

#### AWS SES (Simple Email Service)

```bash
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_USERNAME=your-ses-username
SMTP_PASSWORD=your-ses-password
SMTP_FROM=noreply@referloop.app
SMTP_TLS=true
```

#### MailHog (Local Testing - No Email Sent)

For local development without actual email sending:

```bash
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM=noreply@referloop.app
SMTP_TLS=false
```

Then run MailHog locally (see Testing section below).

### 3. Docker Compose Setup

If using Docker, add the email environment variables to your `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USERNAME=${SMTP_USERNAME}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
      - SMTP_FROM=${SMTP_FROM}
      - SMTP_TLS=${SMTP_TLS}
      - FRONTEND_URL=${FRONTEND_URL}
```

## Email Templates

The email service includes pre-built HTML templates for:

1. **Email Verification** (`SendVerificationEmail`)
   - Sent after signup
   - Contains verification link
   - Expires in 24 hours

2. **Welcome Email** (`SendWelcomeEmail`)
   - Sent after email verification
   - Personalized based on user role

3. **Referral Notification** (`SendReferralNotificationEmail`)
   - Sent when a new referral is created
   - Contains job seeker and position details

4. **Reward Notification** (`SendRewardNotificationEmail`)
   - Sent when referral is verified
   - Shows points earned and total balance

## Usage in Handlers

### Basic Email Sending

```go
import "backend/internal/services"

// Create a new email helper
emailHelper := services.NewEmailHelper()

// Send verification email
err := emailHelper.SendVerificationEmail(
    email,
    firstName,
    token,
    baseURL,
)

// Send referral notification
err := emailHelper.SendReferralNotification(
    referrerEmail,
    referrerName,
    jobSeekerName,
    jobTitle,
)

// Send reward notification
err := emailHelper.SendRewardNotification(
    email,
    firstName,
    pointsEarned,
    totalPoints,
)
```

### Using EmailService Directly

For more control, use `EmailService` directly:

```go
emailService := services.NewEmailService()

message := services.EmailMessage{
    To:      []string{"user@example.com"},
    Subject: "Custom Subject",
    Body:    "Custom HTML body",
    IsHTML:  true,
}

err := emailService.Send(message)
```

## Testing

### 1. Unit Tests

```bash
cd backend
go test ./internal/services -v
```

### 2. Local Testing with MailHog

MailHog captures emails locally without actually sending them.

```bash
# Install MailHog
brew install mailhog

# Run MailHog
mailhog

# Access web UI: http://localhost:1025
# SMTP server: localhost:1025
```

### 3. Testing with Curl

```bash
# Test signup (should trigger verification email)
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "job_seeker"
  }'

# Check MailHog UI or logs for the sent email
```

## Troubleshooting

### Email Not Sending

1. **Check environment variables**: Ensure all SMTP variables are set
   ```bash
   echo $SMTP_HOST
   echo $SMTP_PORT
   ```

2. **Check credentials**: Verify username and password are correct
   - For Gmail: Use app-specific password, not regular password
   - For other providers: Check API keys and authentication details

3. **Check firewall/network**: Some providers block ports
   - Gmail: Port 587 (TLS) or 465 (SSL)
   - Custom servers: Check firewall rules

4. **Enable logs**: The email service logs errors to stdout
   ```go
   // In code, you'll see:
   // "Failed to send verification email: error message"
   ```

### Common Errors

**Error: "email service not configured"**
- Missing SMTP_HOST or SMTP_PORT in environment variables

**Error: "SMTP authentication failed"**
- Wrong username/password
- For Gmail: Using regular password instead of app-specific password

**Error: "failed to connect to SMTP server"**
- SMTP_HOST or SMTP_PORT incorrect
- Firewall blocking the connection

**Error: "invalid sender email"**
- SMTP_FROM is not a valid email format

## Security Best Practices

1. **Never commit `.env` files**: Add `.env` to `.gitignore`

2. **Use environment variables**: Don't hardcode credentials

3. **Rotate app passwords**: Periodically change email service credentials

4. **Use TLS**: Always set `SMTP_TLS=true` for production

5. **Rate limiting**: Consider implementing rate limiting for email sends

6. **Verify sender**: Only send from verified email addresses with your provider

## Performance Considerations

1. **Async email sending**: For high traffic, consider moving email sends to background jobs

2. **Email batching**: Group multiple emails for bulk sending

3. **Retry logic**: Implement retry mechanism for failed sends

4. **Queue system**: Use Redis/RabbitMQ for email queue in production

## Advanced Configuration

### Custom Email Templates

To customize email templates, edit the HTML in `services/email.go`:

```go
// Find the template you want to customize
// Modify the HTML/CSS
// Test with MailHog

// Example customization for welcome email:
htmlBody := fmt.Sprintf(`
<html>
  <!-- Your custom HTML -->
</html>
`, firstName)
```

### Internationalization

To add multi-language support:

1. Create separate template functions for each language
2. Get user's preferred language from database
3. Call appropriate template function

### Custom Reply-To Address

To add custom reply-to, modify the email headers in `services/email.go`:

```go
headers["Reply-To"] = "support@referloop.app"
```

## Production Deployment

### Pre-deployment Checklist

- [ ] SMTP credentials configured securely
- [ ] FRONTEND_URL points to production domain
- [ ] Email templates reviewed and finalized
- [ ] Sender domain verified with email provider
- [ ] SPF/DKIM/DMARC records configured
- [ ] Error logging configured
- [ ] Email monitoring set up

### Email Deliverability Tips

1. **Authenticate your domain**:
   - Configure SPF record
   - Configure DKIM keys
   - Configure DMARC policy

2. **Monitor delivery**:
   - Track bounce rates
   - Monitor spam complaints
   - Check delivery logs

3. **Maintain reputation**:
   - Implement unsubscribe mechanism
   - Honor abuse reports
   - Keep bounce rate low

## Monitoring & Logging

The email service logs all operations to stdout. In production, integrate with your logging system:

```go
// Current: fmt.Printf("Failed to send email: %v\n", err)

// Production: Use your logger
log.WithError(err).Error("Failed to send email")
```

## Future Enhancements

- [ ] Email templates as database records
- [ ] A/B testing for email templates
- [ ] Unsubscribe functionality
- [ ] Email delivery status tracking
- [ ] Scheduled email campaigns
- [ ] SMS notifications as alternative
- [ ] Push notifications
- [ ] Email preference center

## Support

For issues or questions:
1. Check this guide's troubleshooting section
2. Review email service logs
3. Test with MailHog to isolate issues
4. Contact email provider support for authentication issues
