
# Job Openings Feature Documentation

## Overview

The Job Openings feature allows individuals and admins to post job opportunities, and enables job seekers to request referrals. The notification system works differently based on who posted the opening:

- **Individual Posts**: Only the individual who posted gets notified
- **Admin Posts**: All employees from that company get notified

## Database Schema

### New Tables

#### `job_openings`
- Stores job postings from individuals or admins
- Links to company and posting user
- Tracks views, referral requests, and status

#### `referral_requests_from_openings`
- Stores referral requests from job seekers
- Links to opening and job seeker
- Tracks which users were notified (for admin posts)
- Stores acceptance status and referrer

## API Endpoints

### 1. Create Job Opening
**POST** `/api/openings`

**Auth Required**: Yes (Referrer or Admin only)

**Request Body**:
```json
{
  "company_id": 1,
  "job_title": "Senior Backend Engineer",
  "job_url": "https://company.com/careers/123",
  "description": "We are looking for an experienced backend engineer...",
  "tech_stack": "Go, PostgreSQL, Docker, Kubernetes",
  "experience_level": "senior",
  "location": "Remote",
  "salary": "$120k-$150k",
  "expires_at": "2024-12-31T23:59:59Z"
}
```

**Response**:
```json
{
  "message": "Job opening created successfully",
  "opening": {
    "id": 1,
    "posted_by": 5,
    "posted_by_type": "individual",
    "company_id": 1,
    "job_title": "Senior Backend Engineer",
    "status": "active",
    "views": 0,
    "referral_count": 0,
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

### 2. List All Openings
**GET** `/api/openings`

**Auth Required**: No (public endpoint)

**Query Parameters**:
- `company_id`: Filter by company
- `posted_by_type`: Filter by "individual" or "admin"
- `experience_level`: Filter by experience level
- `location`: Filter by location (partial match)
- `tech_stack`: Filter by tech stack (partial match)
- `search`: Search in title and description
- `sort_by`: Sort field (default: "created_at")
- `sort_order`: "asc" or "desc" (default: "desc")
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Example**:
```
GET /api/openings?company_id=1&experience_level=senior&page=1&limit=10
```

**Response**:
```json
{
  "openings": [
    {
      "id": 1,
      "posted_by_type": "admin",
      "company": {
        "id": 1,
        "name": "TechCorp",
        "domain": "techcorp.com"
      },
      "job_title": "Senior Backend Engineer",
      "location": "Remote",
      "tech_stack": "Go, PostgreSQL",
      "experience_level": "senior",
      "views": 45,
      "referral_count": 3,
      "created_at": "2024-01-01T10:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

### 3. Get Single Opening
**GET** `/api/openings/:id`

**Auth Required**: No

**Response**:
```json
{
  "opening": {
    "id": 1,
    "posted_by_user": {
      "id": 5,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@techcorp.com"
    },
    "posted_by_type": "individual",
    "company": {
      "id": 1,
      "name": "TechCorp"
    },
    "job_title": "Senior Backend Engineer",
    "job_url": "https://techcorp.com/careers/123",
    "description": "Full job description here...",
    "tech_stack": "Go, PostgreSQL, Docker",
    "experience_level": "senior",
    "location": "Remote",
    "salary": "$120k-$150k",
    "status": "active",
    "views": 46,
    "referral_count": 3,
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

### 4. Update Opening
**PUT** `/api/openings/:id`

**Auth Required**: Yes (Owner or Admin only)

**Request Body**: Same as Create Opening

### 5. Delete Opening
**DELETE** `/api/openings/:id`

**Auth Required**: Yes (Owner or Admin only)

**Response**:
```json
{
  "message": "Opening deleted successfully"
}
```

### 6. Get My Posted Openings
**GET** `/api/openings/my-postings`

**Auth Required**: Yes

**Response**:
```json
{
  "openings": [
    {
      "id": 1,
      "job_title": "Senior Backend Engineer",
      "company": {
        "name": "TechCorp"
      },
      "views": 50,
      "referral_count": 5,
      "status": "active",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### 7. Request Referral (Job Seeker)
**POST** `/api/openings/:id/request`

**Auth Required**: Yes (Job Seeker only)

**Request Body**:
```json
{
  "resume": "https://storage.com/resumes/my-resume.pdf",
  "cover_letter": "I am very interested in this position..."
}
```

**Response**:
```json
{
  "message": "Referral request submitted successfully",
  "request": {
    "id": 10,
    "opening_id": 1,
    "requested_by": 15,
    "status": "pending",
    "created_at": "2024-01-01T15:00:00Z"
  }
}
```

**Notifications Sent**:
- If `posted_by_type` = "individual": Email to individual poster
- If `posted_by_type` = "admin": Emails to ALL company employees

### 8. Check My Request Status
**GET** `/api/openings/:id/my-request`

**Auth Required**: Yes (Job Seeker only)

**Response** (if requested):
```json
{
  "has_requested": true,
  "request": {
    "id": 10,
    "status": "pending",
    "created_at": "2024-01-01T15:00:00Z"
  }
}
```

**Response** (if not requested):
```json
{
  "has_requested": false
}
```

### 9. Get Referral Opportunities (Referrer)
**GET** `/api/openings/referral-opportunities`

**Auth Required**: Yes (Referrer only)

**Description**: Returns all pending referral requests for openings where the user:
- Posted the opening as an individual, OR
- Works at the company where admin posted the opening

**Response**:
```json
{
  "opportunities": [
    {
      "id": 10,
      "opening": {
        "id": 1,
        "job_title": "Senior Backend Engineer",
        "company": {
          "name": "TechCorp"
        }
      },
      "job_seeker": {
        "id": 15,
        "first_name": "Alice",
        "last_name": "Smith",
        "email": "alice@example.com",
        "tech_stack": "Go, PostgreSQL, Docker",
        "linkedin": "linkedin.com/in/alice-smith"
      },
      "resume": "https://storage.com/resumes/alice-resume.pdf",
      "cover_letter": "I am very interested...",
      "status": "pending",
      "created_at": "2024-01-01T15:00:00Z"
    }
  ]
}
```

### 10. Accept Referral Request
**POST** `/api/openings/:id/accept/:request_id`

**Auth Required**: Yes (Referrer only)

**Description**: Accept a referral request. Only the individual poster or company employees can accept.

**Response**:
```json
{
  "message": "Request accepted successfully",
  "request": {
    "id": 10,
    "status": "accepted",
    "accepted_by": 5
  }
}
```

**Email Sent**: Notification to job seeker that their request was accepted

### 11. Reject Referral Request
**POST** `/api/openings/:id/reject/:request_id`

**Auth Required**: Yes (Referrer only)

**Response**:
```json
{
  "message": "Request rejected",
  "request": {
    "id": 10,
    "status": "rejected"
  }
}
```

## User Flows

### Flow 1: Individual Posts Opening

```
1. Referrer (Individual) creates opening
   POST /api/openings
   - posted_by_type = "individual"

2. Job Seeker browses openings
   GET /api/openings

3. Job Seeker requests referral
   POST /api/openings/1/request
   → Email sent to ONLY the individual who posted

4. Individual reviews request
   GET /api/openings/referral-opportunities

5. Individual accepts request
   POST /api/openings/1/accept/10
   → Email sent to job seeker
```

### Flow 2: Admin Posts Opening

```
1. Admin creates opening
   POST /api/openings
   - posted_by_type = "admin"

2. Job Seeker browses openings
   GET /api/openings

3. Job Seeker requests referral
   POST /api/openings/1/request
   → Emails sent to ALL company employees

4. ANY employee from company reviews requests
   GET /api/openings/referral-opportunities

5. Employee accepts request
   POST /api/openings/1/accept/10
   → Email sent to job seeker
```

## Authorization Rules

| User Role   | Can Post Opening | Can Request Referral | Gets Notified      |
|-------------|-----------------|---------------------|-------------------|
| Admin       | ✅ Yes (all notified) | ❌ No             | ✅ Yes (company)  |
| Referrer    | ✅ Yes (only them)    | ❌ No             | ✅ Yes (company)  |
| Job Seeker  | ❌ No                 | ✅ Yes            | ❌ No             |

## Email Templates

### 1. Referral Opportunity Notification
**Sent to**: Individual poster OR all company employees
**When**: Job seeker requests referral
**Subject**: "New Referral Request: [Job Title] at [Company]"

### 2. Referral Accepted Notification
**Sent to**: Job seeker
**When**: Referrer accepts their request
**Subject**: "Your Referral Request Was Accepted! [Job Title] at [Company]"

## Database Migration

To set up the new tables, run:

```bash
psql -U postgres -d referloop -f backend/migrations/002_job_openings.sql
```

Or if using Docker:

```bash
docker exec -i refer-db psql -U postgres -d referloop < backend/migrations/002_job_openings.sql
```

## Testing

### Create a Test Opening (as Referrer)

```bash
curl -X POST http://localhost:8000/api/openings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "company_id": 1,
    "job_title": "Senior Backend Engineer",
    "job_url": "https://example.com/job",
    "description": "We are hiring!",
    "tech_stack": "Go, PostgreSQL",
    "experience_level": "senior",
    "location": "Remote",
    "salary": "$120k-$150k"
  }'
```

### Browse Openings (No Auth)

```bash
curl http://localhost:8000/api/openings
```

### Request Referral (as Job Seeker)

```bash
curl -X POST http://localhost:8000/api/openings/1/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer JOB_SEEKER_JWT_TOKEN" \
  -d '{
    "resume": "https://example.com/resume.pdf",
    "cover_letter": "I am very interested..."
  }'
```

## Frontend Integration

### Pages to Create

1. **Openings Browse** (`/openings`)
   - Grid/List view of all openings
   - Filters and search
   - View count and referral count display

2. **Opening Details** (`/openings/:id`)
   - Full job description
   - Company information
   - "Request Referral" button

3. **My Posted Openings** (`/dashboard/my-openings`)
   - List of user's posted openings
   - View, edit, delete options
   - Referral request count

4. **Referral Opportunities** (`/dashboard/opportunities`)
   - Pending referral requests
   - Job seeker profiles
   - Accept/Reject buttons

## Features

✅ **Implemented**:
- Job opening creation by individuals and admins
- Public browsing of openings
- Referral request system
- Smart notification logic (individual vs company-wide)
- Status tracking
- Email notifications
- Authorization checks
- Duplicate prevention

🔮 **Future Enhancements**:
- Auto-expire openings after expiration date
- Opening analytics dashboard
- Notification preferences
- Opening templates
- Batch posting for admins
- Integration with ATS systems

## Security

- Authorization checks prevent:
  - Job seekers from posting openings
  - Referrers from requesting referrals
  - Users from accepting requests not meant for them
- Duplicate request prevention (unique index)
- Soft deletes for data integrity
- Input validation on all endpoints

## Support

For issues or questions:
1. Check this documentation
2. Review API response error messages
3. Check backend logs: `docker logs refer-backend`
4. Verify JWT token is valid
5. Ensure user role matches endpoint requirements
