
# Job Openings Feature - Setup Guide

## Quick Setup

### 1. Run the Migration

The new feature requires database changes. Run the migration file:

#### Option A: If using Docker

```bash
# From the project root directory
docker exec -i refer-db psql -U postgres -d referloop < backend/migrations/002_job_openings.sql
```

#### Option B: If running PostgreSQL locally

```bash
# From the project root directory
psql -U postgres -d referloop -f backend/migrations/002_job_openings.sql
```

#### Option C: Using make (if you have a Makefile)

```bash
make migrate-up
```

### 2. Restart the Backend

```bash
# If using Docker
docker-compose restart backend

# If running locally
# Stop the backend (Ctrl+C) and restart:
cd backend
go run cmd/server/main.go
```

### 3. Verify Setup

Test the health check:

```bash
curl http://localhost:8000/health
# Expected: {"status":"ok"}
```

Test the new openings endpoint:

```bash
curl http://localhost:8000/api/openings
# Expected: {"openings":[],"total":0,"page":1,"limit":20}
```

## Testing the Feature

### Step 1: Create Test Users

You'll need 3 types of users:

1. **Admin** (to post company-wide openings)
2. **Referrer/Employee** (to post individual openings and accept requests)
3. **Job Seeker** (to request referrals)

#### Create Admin User

```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@techcorp.com",
    "password": "Admin123!",
    "first_name": "Admin",
    "last_name": "User",
    "role": "referrer",
    "company_id": 1
  }'
```

Then manually update the user to admin role in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@techcorp.com';
```

#### Create Referrer User

```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@techcorp.com",
    "password": "Password123!",
    "first_name": "John",
    "last_name": "Doe",
    "role": "referrer",
    "company_id": 1
  }'
```

#### Create Job Seeker User

```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "Password123!",
    "first_name": "Alice",
    "last_name": "Smith",
    "role": "job_seeker"
  }'
```

### Step 2: Verify Emails (Optional for Testing)

If you want to skip email verification for testing:

```sql
UPDATE users SET is_verified = true WHERE email IN ('admin@techcorp.com', 'john@techcorp.com', 'alice@example.com');
```

### Step 3: Get JWT Tokens

Login each user and save their JWT tokens:

```bash
# Admin Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@techcorp.com",
    "password": "Admin123!"
  }'
# Save the token as ADMIN_TOKEN

# Referrer Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@techcorp.com",
    "password": "Password123!"
  }'
# Save the token as REFERRER_TOKEN

# Job Seeker Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "Password123!"
  }'
# Save the token as JOBSEEKER_TOKEN
```

### Step 4: Test Individual Opening Flow

#### 4.1: Referrer Posts Opening

```bash
curl -X POST http://localhost:8000/api/openings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_REFERRER_TOKEN" \
  -d '{
    "company_id": 1,
    "job_title": "Senior Backend Engineer",
    "job_url": "https://techcorp.com/careers/backend",
    "description": "We are looking for an experienced Go developer...",
    "tech_stack": "Go, PostgreSQL, Docker, Kubernetes",
    "experience_level": "senior",
    "location": "Remote",
    "salary": "$120,000 - $150,000"
  }'
```

Expected: Opening created with `posted_by_type: "individual"`

#### 4.2: Job Seeker Browses Openings

```bash
curl http://localhost:8000/api/openings
```

Expected: List of active openings (including the one just created)

#### 4.3: Job Seeker Requests Referral

```bash
curl -X POST http://localhost:8000/api/openings/1/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JOBSEEKER_TOKEN" \
  -d '{
    "resume": "https://example.com/alice-resume.pdf",
    "cover_letter": "I am very interested in this position. I have 5 years of experience with Go..."
  }'
```

Expected:
- Request created successfully
- **Email sent ONLY to John (the individual poster)**

#### 4.4: Referrer Views Opportunities

```bash
curl -X GET http://localhost:8000/api/openings/referral-opportunities \
  -H "Authorization: Bearer YOUR_REFERRER_TOKEN"
```

Expected: List of pending requests including Alice's request

#### 4.5: Referrer Accepts Request

```bash
curl -X POST http://localhost:8000/api/openings/1/accept/1 \
  -H "Authorization: Bearer YOUR_REFERRER_TOKEN"
```

Expected:
- Request status changed to "accepted"
- **Email sent to Alice notifying acceptance**

### Step 5: Test Admin Opening Flow

#### 5.1: Admin Posts Opening

```bash
curl -X POST http://localhost:8000/api/openings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "company_id": 1,
    "job_title": "Frontend Engineer",
    "job_url": "https://techcorp.com/careers/frontend",
    "description": "Join our frontend team...",
    "tech_stack": "React, TypeScript, Next.js",
    "experience_level": "mid",
    "location": "Hybrid - San Francisco",
    "salary": "$100,000 - $130,000"
  }'
```

Expected: Opening created with `posted_by_type: "admin"`

#### 5.2: Job Seeker Requests Referral

```bash
curl -X POST http://localhost:8000/api/openings/2/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JOBSEEKER_TOKEN" \
  -d '{
    "resume": "https://example.com/alice-resume.pdf",
    "cover_letter": "I am interested in your frontend position..."
  }'
```

Expected:
- Request created successfully
- **Emails sent to ALL employees at TechCorp** (Admin + John in this test)

#### 5.3: Any Employee Can Accept

Both admin and John should see this opportunity:

```bash
# Admin checks opportunities
curl -X GET http://localhost:8000/api/openings/referral-opportunities \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# John checks opportunities
curl -X GET http://localhost:8000/api/openings/referral-opportunities \
  -H "Authorization: Bearer YOUR_REFERRER_TOKEN"
```

Expected: Both see the same request

Either can accept:

```bash
curl -X POST http://localhost:8000/api/openings/2/accept/2 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Testing Filters and Search

### Filter by Company

```bash
curl "http://localhost:8000/api/openings?company_id=1"
```

### Filter by Experience Level

```bash
curl "http://localhost:8000/api/openings?experience_level=senior"
```

### Search in Title/Description

```bash
curl "http://localhost:8000/api/openings?search=backend"
```

### Filter by Location

```bash
curl "http://localhost:8000/api/openings?location=remote"
```

### Combine Filters

```bash
curl "http://localhost:8000/api/openings?company_id=1&experience_level=senior&location=remote"
```

### Pagination

```bash
curl "http://localhost:8000/api/openings?page=1&limit=5"
```

## Verification Checklist

- [ ] Migration ran successfully
- [ ] Backend restarted without errors
- [ ] Can create opening as referrer (posted_by_type = "individual")
- [ ] Can create opening as admin (posted_by_type = "admin")
- [ ] Job seeker can browse openings
- [ ] Job seeker can request referral
- [ ] Individual poster receives email notification
- [ ] All company employees receive email (admin posting)
- [ ] Referrer can view opportunities
- [ ] Referrer can accept request
- [ ] Job seeker receives acceptance email
- [ ] Cannot request same opening twice
- [ ] Filters work correctly
- [ ] Search works correctly

## Troubleshooting

### Migration Fails

**Error**: "relation already exists"
- The tables might already exist. Check with:
  ```sql
  \dt job_openings
  ```
- If they exist but are incorrect, drop them and re-run migration:
  ```sql
  DROP TABLE referral_requests_from_openings CASCADE;
  DROP TABLE job_openings CASCADE;
  ```

### Backend Won't Start

**Error**: "undefined: models.JobOpening"
- Make sure you pulled/saved all the new model files
- Try rebuilding: `go build ./...`

### Emails Not Sending

- Check your `.env` file has SMTP settings configured
- Test with MailHog for local development (see EMAIL_SERVICE_SETUP.md)
- Check backend logs for email errors

### Authorization Errors

**Error**: "Only referrers and admins can post job openings"
- Verify user role in database:
  ```sql
  SELECT email, role, is_verified FROM users WHERE email = 'your@email.com';
  ```
- Make sure user is verified (`is_verified = true`)

### No Opportunities Showing

- Verify user has `company_id` set if they're a referrer
- Check if there are any pending requests:
  ```sql
  SELECT * FROM referral_requests_from_openings WHERE status = 'pending';
  ```

## Next Steps

1. ✅ Backend implementation complete
2. ⏳ Build frontend pages:
   - Openings browse page
   - Opening details page
   - My postings page
   - Referral opportunities page
3. ⏳ Add analytics dashboard
4. ⏳ Implement notification preferences
5. ⏳ Add auto-expiry for openings

## Support

- Full API documentation: `JOB_OPENINGS_FEATURE.md`
- Email setup guide: `EMAIL_SERVICE_SETUP.md`
- Architecture docs: `ARCHITECTURE.md`
- General FAQ: `FAQ.md`
