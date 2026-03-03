
# MailHog Email Testing Setup

MailHog is an email testing tool that captures all outgoing emails so you can view them in a web interface instead of sending real emails.

## Quick Start

```bash
# Start
docker run -d \
  --name mailhog \
  -p 1025:1025 \
  -p 8025:8025 \
  mailhog/mailhog:latest

# Stop
docker stop mailhog

# Remove
docker rm mailhog
```

---

## Configure Your Backend

### For Docker (using docker-compose.dev.yml)
Already configured in `docker-compose.dev.yml`:
```yaml
SMTP_HOST: mailhog
SMTP_PORT: 1025
SMTP_USERNAME: ""
SMTP_PASSWORD: ""
SMTP_FROM: noreply@referloop.com
SMTP_TLS: "false"
```

### For Local Development
Update your backend `.env` file:
```env
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM=noreply@referloop.com
SMTP_TLS=false
```

---

## Using MailHog

1. **Start MailHog** (using any method above)
2. **Open Web UI:** http://localhost:8025
3. **Run your app** and trigger email sending (signup, forgot password, etc.)
4. **Check MailHog UI** - all emails will appear there instantly

### Features
- ✅ View all sent emails in real-time
- ✅ See HTML and plain text versions
- ✅ View email headers
- ✅ Test email templates
- ✅ No real emails sent (safe for testing)

---

## Ports

- **1025** - SMTP server (backend sends emails here)
- **8025** - Web UI (you view emails here)

---

## Testing Email Flows

### 1. Test Signup Email Verification
```bash
# Start MailHog
docker run -d \
  --name mailhog \
  -p 1025:1025 \
  -p 8025:8025 \
  mailhog/mailhog:latest

# Start your backend (configured to use localhost:1025)
cd backend && go run cmd/server/main.go

# Start your frontend
cd frontend && npm run dev

# Go to http://localhost:3000/auth/signup
# Create an account
# Check http://localhost:8025 for the verification email
```

### 2. Test Forgot Password
```bash
# Go to http://localhost:3000/auth/forgot-password
# Enter your email
# Check http://localhost:8025 for the reset email
```

---

## Troubleshooting

### Emails not appearing in MailHog

**Check backend is connecting:**
```bash
# View backend logs
docker-compose logs api

# Or if running locally
# Check your terminal output
```

**Check MailHog is running:**
```bash
docker ps | grep mailhog

# Should see a running container
```

**Test SMTP connection:**
```bash
# Install telnet if needed
telnet localhost 1025

# You should connect successfully
# Type QUIT to exit
```

### Port already in use

If port 1025 or 8025 is already taken:

**Option 1: Stop the conflicting service**
```bash
# Find what's using the port
lsof -i :8025
lsof -i :1025

# Stop that service
```

**Option 2: Change ports in mailhog.yml**
```yaml
ports:
  - "2025:1025"  # Use 2025 instead
  - "9025:8025"  # Use 9025 instead
```

Then update your backend SMTP_PORT to 2025.

---

## Clean Up

```bash
# Stop and remove MailHog
docker-compose -f mailhog.yml down

# Or if using direct docker command
docker rm -f mailhog

# Remove MailHog image (optional)
docker rmi mailhog/mailhog:latest
```

---

## Production Alternative

⚠️ **Important:** MailHog is for **development/testing only**.

For production, use a real email service like:
- AWS SES
- SendGrid
- Mailgun
- Postmark

Update your production `.env` with real SMTP credentials.
