# API Documentation - xyz (ReferLoop)

## Base URL
```
http://localhost:8000/api
```

## Authentication
All endpoints (except auth) require Bearer token in header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Auth Endpoints

### POST /auth/signup
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "job_seeker" // or "referrer"
}
```

**Response (201):**
```json
{
  "message": "User created. Check your email for verification link.",
  "user_id": 1
}
```

---

### POST /auth/login
Authenticate user and get JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "job_seeker"
  }
}
```

---

### POST /auth/verify-email
Verify email with token from email link.

**Request:**
```json
{
  "token": "token_from_email_link"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully"
}
```

---

### POST /auth/resend-verification
Resend verification email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Verification link sent to your email"
}
```

---

## 👤 User Endpoints

### GET /users/profile
Get authenticated user's profile.

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "job_seeker",
  "is_verified": true,
  "linkedin": "https://linkedin.com/in/johndoe",
  "github": "https://github.com/johndoe",
  "tech_stack": "Go, PostgreSQL, Docker",
  "reward_points": 250
}
```

---

### PUT /users/profile
Update user profile.

**Request:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "linkedin": "https://linkedin.com/in/johndoe",
  "github": "https://github.com/johndoe",
  "tech_stack": "Go, PostgreSQL, Docker, Kubernetes"
}
```

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  ...
}
```

---

### GET /users/companies
Get list of all companies.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Google",
    "website": "https://google.com",
    "domain": "google.com",
    "logo": "https://..."
  },
  {
    "id": 2,
    "name": "Microsoft",
    "website": "https://microsoft.com",
    "domain": "microsoft.com",
    "logo": "https://..."
  }
]
```

---

## 📋 Referral Request Endpoints

### POST /requests
Create a new referral request (Job Seekers only).

**Request:**
```json
{
  "company_id": 1,
  "job_title": "Senior Software Engineer",
  "job_url": "https://company.com/careers/123",
  "description": "Backend engineer for microservices platform",
  "tech_stack": "Go, PostgreSQL, Docker, Kubernetes",
  "experience_level": "senior",
  "max_referrals": 3,
  "resume": "base64_encoded_pdf_or_url"
}
```

**Response (201):**
```json
{
  "id": 5,
  "user_id": 1,
  "company_id": 1,
  "job_title": "Senior Software Engineer",
  "status": "open",
  "referral_count": 0,
  "max_referrals": 3,
  "created_at": "2024-02-08T10:30:00Z"
}
```

---

### GET /requests
Get referral requests.

**Query Parameters:**
- `status`: Filter by status (open, pending_confirmation, confirmed, closed)
- `company_id`: Filter by company

**Job Seeker Response - Gets own requests:**
```json
[
  {
    "id": 5,
    "user_id": 1,
    "company_id": 1,
    "job_title": "Senior Software Engineer",
    "status": "pending_confirmation",
    "referral_count": 2,
    "max_referrals": 3,
    "created_at": "2024-02-08T10:30:00Z"
  }
]
```

**Referrer Response - Gets open requests from their company:**
```json
[
  {
    "id": 5,
    "user_id": 1,
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "tech_stack": "Go, PostgreSQL"
    },
    "company_id": 1,
    "job_title": "Senior Software Engineer",
    "status": "open",
    "referral_count": 0,
    "max_referrals": 3,
    "created_at": "2024-02-08T10:30:00Z"
  }
]
```

---

### GET /requests/:id
Get specific request details.

**Response (200):**
```json
{
  "id": 5,
  "user_id": 1,
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "tech_stack": "Go, PostgreSQL",
    "linkedin": "https://linkedin.com/in/johndoe"
  },
  "company_id": 1,
  "company": {
    "id": 1,
    "name": "Google",
    "domain": "google.com"
  },
  "job_title": "Senior Software Engineer",
  "description": "Backend engineer...",
  "status": "open",
  "referral_count": 1,
  "max_referrals": 3,
  "referrals": [
    {
      "id": 10,
      "referrer_id": 2,
      "status": "pending",
      "created_at": "2024-02-08T11:00:00Z"
    }
  ]
}
```

---

### PUT /requests/:id
Update request (creator only).

**Request:**
```json
{
  "status": "closed",
  "max_referrals": 5,
  "expires_at": "2024-02-28T00:00:00Z"
}
```

---

## 🤝 Referral Endpoints

### POST /referrals
Submit a referral (Referrers only).

**Request:**
```json
{
  "request_id": 5,
  "notes": "Great candidate, I've worked with them before"
}
```

**Response (201):**
```json
{
  "id": 10,
  "request_id": 5,
  "referrer_id": 2,
  "status": "pending",
  "notes": "Great candidate...",
  "created_at": "2024-02-08T11:00:00Z"
}
```

---

### GET /referrals
Get referrals (filtered by role).

**Referrer sees their referrals:**
```json
[
  {
    "id": 10,
    "request_id": 5,
    "request": {
      "id": 5,
      "job_title": "Senior Software Engineer",
      "company_id": 1
    },
    "status": "pending",
    "referrer_confirmed_at": null,
    "job_seeker_confirmed_at": null,
    "created_at": "2024-02-08T11:00:00Z"
  }
]
```

**Job Seeker sees referrals on their requests:**
```json
[
  {
    "id": 10,
    "request_id": 5,
    "referrer_id": 2,
    "referrer": {
      "id": 2,
      "first_name": "Jane",
      "last_name": "Smith",
      "company_id": 1
    },
    "status": "pending",
    "created_at": "2024-02-08T11:00:00Z"
  }
]
```

---

### PUT /referrals/:id
Update referral (referrer only).

**Request:**
```json
{
  "status": "confirmed",
  "referral_proof": "Referral ID: REF-12345",
  "notes": "Submitted internally"
}
```

---

### PUT /referrals/:id/confirm
Confirm referral (either party can confirm their side).

**Referrer confirmation request:**
```json
{
  "referrer_confirmed": true
}
```

**Job Seeker confirmation request:**
```json
{
  "job_seeker_confirmed": true
}
```

**Response (200):**
```json
{
  "id": 10,
  "status": "pending", // or "verified" if both confirmed
  "referrer_confirmed_at": "2024-02-08T12:00:00Z",
  "job_seeker_confirmed_at": "2024-02-08T13:00:00Z"
}
```

When both confirm → **Referral Status = "verified"** → **100 reward points awarded to referrer**

---

## 🏆 Reward Endpoints

### GET /rewards
Get user's reward history.

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 2,
    "referral_id": 10,
    "type": "referral",
    "points": 100,
    "description": "Referral confirmed",
    "created_at": "2024-02-08T14:00:00Z"
  },
  {
    "id": 2,
    "user_id": 2,
    "referral_id": 12,
    "type": "referral",
    "points": 100,
    "description": "Referral confirmed",
    "created_at": "2024-02-08T15:00:00Z"
  }
]
```

---

### GET /rewards/balance
Get user's total reward points.

**Response (200):**
```json
{
  "reward_points": 250
}
```

---

## 👨‍💼 Admin Endpoints

### GET /admin/users
Get all users (Admin only).

**Response (200):**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "job_seeker",
    "is_verified": true,
    "company_id": null,
    "created_at": "2024-02-08T10:00:00Z"
  }
]
```

---

### GET /admin/requests
Get all requests (Admin only).

**Response (200):**
```json
[
  {
    "id": 5,
    "user_id": 1,
    "company_id": 1,
    "job_title": "Senior Software Engineer",
    "status": "pending_confirmation",
    "referral_count": 2,
    "max_referrals": 3,
    "referrals": [...]
  }
]
```

---

### PUT /admin/verify-referral/:id
Manually verify a referral (Admin only).

**Response (200):**
```json
{
  "id": 10,
  "status": "verified",
  "referrer_confirmed_at": "2024-02-08T12:00:00Z",
  "job_seeker_confirmed_at": "2024-02-08T13:00:00Z"
}
```

Automatically awards 100 reward points to referrer if not already awarded.

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request body"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid token" or "Authorization header required"
}
```

### 403 Forbidden
```json
{
  "error": "Email not verified" or "Admin access required" or "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "User not found" or "Request not found" or "Referral not found"
}
```

### 409 Conflict
```json
{
  "error": "You have already referred this request" or "Email already registered"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create user" or "Database error"
}
```

---

## Status Codes

- **200 OK** - Successful request
- **201 Created** - Resource created
- **204 No Content** - Successful deletion
- **400 Bad Request** - Invalid input
- **401 Unauthorized** - Missing/invalid token
- **403 Forbidden** - Access denied
- **404 Not Found** - Resource not found
- **409 Conflict** - Duplicate resource
- **500 Internal Server Error** - Server error

---

## Common Workflows

### Job Seeker Flow
1. `POST /auth/signup` → Create account
2. `POST /auth/verify-email` → Verify email
3. `POST /auth/login` → Login
4. `PUT /users/profile` → Complete profile
5. `GET /users/companies` → Get companies
6. `POST /requests` → Create referral request
7. `GET /requests` → View own requests
8. `PUT /referrals/:id/confirm` → Confirm received referral

### Referrer Flow
1. `POST /auth/signup` (role: referrer) → Create account
2. `POST /auth/verify-email` → Verify email
3. `POST /auth/login` → Login
4. `PUT /users/profile` → Complete profile
5. `GET /requests` → Get open requests for company
6. `GET /requests/:id` → View request details
7. `POST /referrals` → Submit referral
8. `PUT /referrals/:id` → Add proof/notes
9. `PUT /referrals/:id/confirm` → Confirm referral submission
10. `GET /rewards` → View reward history
11. `GET /rewards/balance` → Check balance

---

## Testing with cURL

### Signup
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "job_seeker"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:8000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Request
```bash
curl -X POST http://localhost:8000/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "company_id": 1,
    "job_title": "Senior Engineer",
    "job_url": "https://example.com/jobs/123",
    "tech_stack": "Go, PostgreSQL",
    "experience_level": "senior",
    "max_referrals": 3
  }'
```
