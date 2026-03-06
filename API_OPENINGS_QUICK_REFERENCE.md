
# Job Openings API - Quick Reference

## Base URL
```
http://localhost:8000/api/openings
```

## Endpoints Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/openings` | No | All | List all active openings |
| GET | `/openings/:id` | No | All | Get single opening details |
| POST | `/openings` | Yes | Referrer/Admin | Create new opening |
| PUT | `/openings/:id` | Yes | Owner/Admin | Update opening |
| DELETE | `/openings/:id` | Yes | Owner/Admin | Delete opening |
| GET | `/openings/my-postings` | Yes | Referrer/Admin | Get my posted openings |
| POST | `/openings/:id/request` | Yes | Job Seeker | Request referral |
| GET | `/openings/:id/my-request` | Yes | Job Seeker | Check if already requested |
| GET | `/openings/referral-opportunities` | Yes | Referrer | Get pending requests |
| POST | `/openings/:id/accept/:request_id` | Yes | Referrer | Accept request |
| POST | `/openings/:id/reject/:request_id` | Yes | Referrer | Reject request |

## Quick Examples

### Browse Openings (No Auth)
```bash
curl http://localhost:8000/api/openings
```

### Create Opening (Referrer)
```bash
curl -X POST http://localhost:8000/api/openings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": 1,
    "job_title": "Senior Backend Engineer",
    "description": "We are hiring...",
    "tech_stack": "Go, PostgreSQL",
    "experience_level": "senior",
    "location": "Remote"
  }'
```

### Request Referral (Job Seeker)
```bash
curl -X POST http://localhost:8000/api/openings/1/request \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resume": "https://example.com/resume.pdf",
    "cover_letter": "I am interested..."
  }'
```

### View Opportunities (Referrer)
```bash
curl http://localhost:8000/api/openings/referral-opportunities \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Accept Request (Referrer)
```bash
curl -X POST http://localhost:8000/api/openings/1/accept/10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Filters & Search

### By Company
```bash
curl "http://localhost:8000/api/openings?company_id=1"
```

### By Experience Level
```bash
curl "http://localhost:8000/api/openings?experience_level=senior"
```

### By Location
```bash
curl "http://localhost:8000/api/openings?location=remote"
```

### Search
```bash
curl "http://localhost:8000/api/openings?search=backend+engineer"
```

### Sort & Paginate
```bash
curl "http://localhost:8000/api/openings?sort_by=views&sort_order=desc&page=1&limit=10"
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (duplicate request) |
| 500 | Server Error |

## Key Concepts

### Posted By Type
- **individual**: Only the poster gets notified when someone requests
- **admin**: ALL company employees get notified

### Request Status
- **pending**: Waiting for referrer to accept/reject
- **accepted**: Referrer agreed to refer
- **rejected**: Referrer declined
- **completed**: Referral process finished

### Opening Status
- **active**: Currently accepting requests
- **closed**: No longer accepting requests
- **expired**: Past expiration date

## Authorization Rules

| Action | Job Seeker | Referrer | Admin |
|--------|-----------|----------|-------|
| Create Opening | ❌ | ✅ (individual) | ✅ (company-wide) |
| Request Referral | ✅ | ❌ | ❌ |
| View Opportunities | ❌ | ✅ | ✅ |
| Accept/Reject | ❌ | ✅ | ✅ |

## Notification Flow

### Individual Posts Opening
```
Referrer creates opening
    ↓
Job seeker requests
    ↓
Email → Only that referrer
    ↓
Referrer accepts
    ↓
Email → Job seeker
```

### Admin Posts Opening
```
Admin creates opening
    ↓
Job seeker requests
    ↓
Emails → ALL company employees
    ↓
Any employee accepts
    ↓
Email → Job seeker
```

## Common Errors

### "Only referrers and admins can post job openings"
- Solution: User must have role `referrer` or `admin`

### "You have already requested a referral for this opening"
- Solution: Cannot request same opening twice (use GET my-request to check)

### "Only job seekers can request referrals"
- Solution: User must have role `job_seeker`

### "You cannot accept this request"
- Solution: Must be the individual poster OR employee at the company

## Testing Tips

1. **Create 3 users**: Admin, Referrer, Job Seeker
2. **Test both flows**: Individual posting and admin posting
3. **Verify emails**: Check that correct people get notified
4. **Check filters**: Test all query parameters
5. **Test authorization**: Ensure users can only do allowed actions

## Related Documentation

- Full API Docs: `JOB_OPENINGS_FEATURE.md`
- Setup Guide: `SETUP_JOB_OPENINGS.md`
- Email Service: `EMAIL_SERVICE_SETUP.md`
