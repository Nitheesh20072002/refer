# System Architecture & Data Flow

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        REFERLOOP PLATFORM                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐
│   FRONTEND (Next.js/React)   │
│  ┌────────────────────────┐  │
│  │  Pages                 │  │
│  │  - Home               │  │
│  │  - Auth (Login/Signup)│  │
│  │  - Dashboard          │  │
│  │  - Requests           │  │
│  │  - Referrals          │  │
│  │  - Rewards            │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │  Components            │  │
│  │  - Navbar              │  │
│  │  - Forms               │  │
│  │  - ProtectedRoute      │  │
│  │  - Cards               │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │  State & Utils         │  │
│  │  - Zustand store       │  │
│  │  - Axios API client    │  │
│  │  - Helper functions    │  │
│  └────────────────────────┘  │
└────────────┬─────────────────┘
             │ HTTP/HTTPS
             │ JSON + JWT Token
             ▼
┌──────────────────────────────┐
│   BACKEND API (Go/Gin)       │
│  ┌────────────────────────┐  │
│  │  Routes (11 groups)    │  │
│  │  - /auth               │  │
│  │  - /users              │  │
│  │  - /requests           │  │
│  │  - /referrals          │  │
│  │  - /rewards            │  │
│  │  - /admin              │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │  Middleware            │  │
│  │  - JWT Auth            │  │
│  │  - CORS                │  │
│  │  - Admin check         │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │  Handlers              │  │
│  │  - Auth handler        │  │
│  │  - User handler        │  │
│  │  - Request handler     │  │
│  │  - Referral handler    │  │
│  │  - Reward handler      │  │
│  │  - Admin handler       │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │  Services              │  │
│  │  - Email service       │  │
│  │  - Auth service        │  │
│  │  - Verification service│  │
│  └────────────────────────┘  │
└────────────┬─────────────────┘
             │ SQL
             │
             ▼
┌──────────────────────────────┐
│   DATABASE (PostgreSQL)      │
│  ┌────────────────────────┐  │
│  │  Tables                │  │
│  │  - users               │  │
│  │  - companies           │  │
│  │  - referral_requests   │  │
│  │  - referrals           │  │
│  │  - rewards             │  │
│  │  - verification_tokens │  │
│  └────────────────────────┘  │
└──────────────────────────────┘

┌──────────────────────────────┐
│   EXTERNAL SERVICES          │
│  - Email service (Nodemailer)│
│  - File storage (S3/similar) │
│  - Analytics (Mixpanel)      │
└──────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### Signup & Email Verification Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                    SIGNUP FLOW                                   │
└─────────────────────────────────────────────────────────────────┘

Frontend                    Backend                    Database
   │                          │                           │
   │─ POST /signup ──────────>│                           │
   │  (email, password, name) │                           │
   │                          │─ Hash password ──────────>│
   │                          │─ Create user ────────────>│
   │                          │<──── user.id ────────────│
   │                          │                           │
   │                          │─ Generate token ──────────>│
   │                          │<──── token ───────────────│
   │                          │                           │
   │                          │─ Send email ──────────────> Email Service
   │<─ Response 201 ──────────│                           │
   │ (user_id)               │                           │
   │                          │                           │
   │  [User clicks link]      │                           │
   │                          │                           │
   │─ POST /verify-email ────>│                           │
   │  (token)                │                           │
   │                          │─ Find token ─────────────>│
   │                          │<──── token found ────────│
   │                          │                           │
   │                          │─ Update is_verified ─────>│
   │                          │<──── updated ────────────│
   │<─ Response 200 ──────────│                           │
   │ (verified)              │                           │

```

### Create Referral Request Flow
```
┌─────────────────────────────────────────────────────────────────┐
│              CREATE REFERRAL REQUEST FLOW                        │
└─────────────────────────────────────────────────────────────────┘

Job Seeker                  Backend                    Database
   │                          │                           │
   │─ POST /requests ───────>│                           │
   │  (company_id, job info) │─ Auth check ──────────────>│
   │                          │<──── user verified ───────│
   │                          │                           │
   │                          │─ Check job seeker role ──>│
   │                          │<──── role OK ────────────│
   │                          │                           │
   │                          │─ Create request ──────────>│
   │                          │<──── request.id ─────────│
   │                          │                           │
   │<─ Response 201 ──────────│                           │
   │ (request details)       │                           │
   │                          │                           │
   │ [Request visible to]     │                           │
   │ employees of company     │                           │

```

### Referral & Reward Flow
```
┌─────────────────────────────────────────────────────────────────┐
│            REFERRAL SUBMISSION & REWARD FLOW                     │
└─────────────────────────────────────────────────────────────────┘

Step 1: Referrer Submits
Referrer                    Backend                    Database
   │                          │                           │
   │─ POST /referrals ──────>│                           │
   │  (request_id, notes)    │─ Auth check ──────────────>│
   │                          │<──── referrer verified ───│
   │                          │                           │
   │                          │─ Validate request ───────>│
   │                          │<──── request found ───────│
   │                          │                           │
   │                          │─ Check duplicate ────────>│
   │                          │<──── no duplicate ───────│
   │                          │                           │
   │                          │─ Create referral ────────>│
   │                          │<──── referral.id ───────│
   │                          │                           │
   │<─ Response 201 ──────────│                           │
   │ (referral details)      │                           │

Step 2: Both Confirm
Referrer/Seeker             Backend                    Database
   │                          │                           │
   │─ PUT /referrals/id/──── >│                           │
   │   confirm                │─ Mark confirmed ──────────>│
   │                          │<──── updated ────────────│
   │                          │                           │
   │[Once both confirm]       │─ Check both confirmed ────>│
   │                          │<──── yes ────────────────│
   │                          │                           │
   │                          │─ Mark verified ───────────>│
   │                          │<──── updated ────────────│
   │                          │                           │
   │                          │─ Create reward record ────>│
   │                          │<──── reward.id ────────┤
   │                          │                           │
   │                          │─ Add 100 points ──────────>│
   │                          │<──── updated ────────────│
   │                          │                           │
   │<─ Response 200 ──────────│                           │
   │ (verified, 100 points)  │                           │

```

---

## 📊 Data Model Relationships

```
USERS
├─ 1 ──────────→ Many REFERRAL_REQUESTS (as creator)
├─ 1 ──────────→ Many REFERRALS (as referrer)
├─ 1 ──────────→ Many REWARDS (as recipient)
├─ 1 ──────────→ Many VERIFICATION_TOKENS
└─ Many ───────→ 1 COMPANIES (foreign key)

COMPANIES
├─ 1 ──────────→ Many USERS (company employees)
├─ 1 ──────────→ Many REFERRAL_REQUESTS (requests for this company)
└─ Domain verification for security

REFERRAL_REQUESTS
├─ Many ───────→ 1 USERS (creator)
├─ Many ───────→ 1 COMPANIES (target)
├─ 1 ──────────→ Many REFERRALS (linked referrals)
└─ Status tracking:
   - open
   - pending_confirmation
   - confirmed
   - closed

REFERRALS
├─ Many ───────→ 1 REFERRAL_REQUESTS
├─ Many ───────→ 1 USERS (referrer)
├─ 1 ──────────→ 1 REWARDS (optional, created on verification)
└─ Status tracking:
   - pending (submitted)
   - confirmed (one party confirmed)
   - verified (both confirmed, rewards awarded)

REWARDS
├─ Many ───────→ 1 USERS
├─ 1 ──────────→ 1 REFERRALS (optional)
├─ Type tracking:
│  - referral (100 points)
│  - bonus
│  - redemption (-X points)
└─ Used for leaderboard & redemptions

VERIFICATION_TOKENS
├─ Many ───────→ 1 USERS
└─ Type tracking:
   - email_verification
   - password_reset
```

---

## 🔐 Authentication Flow

```
┌──────────────────────────────────────────┐
│       JWT AUTHENTICATION FLOW             │
└──────────────────────────────────────────┘

1. LOGIN REQUEST
   Frontend                   Backend
      │                          │
      │─ POST /login ──────────>│
      │  (email, password)      │─ Find user ───────────>DB
      │                         │<── user found
      │                         │─ Compare hash
      │                         │  (password vs stored)
      │                         │─ Generate JWT
      │                         │  {user_id, email, role}
      │<─ 200 OK ───────────────│
      │  {token, user_data}     │
      │                         │

2. AUTHENTICATED REQUEST
   Frontend                   Backend
      │                          │
      │─ GET /users/profile ───>│
      │  Authorization:          │─ Parse JWT
      │  Bearer <token>          │─ Verify signature
      │                          │─ Check expiration
      │                          │─ Extract user_id
      │                          │─ Fetch user ──────────>DB
      │                          │<── user data
      │<─ 200 OK ───────────────│
      │  {user_profile}         │
      │                         │

3. TOKEN EXPIRATION
   Frontend                   Backend
      │                          │
      │─ Request ─────────────>│
      │                         │─ Parse JWT
      │                         │─ Check expiration
      │                         │─ Expired!
      │<─ 401 Unauthorized ────│
      │                         │
      │ [User must login again] │
      │                         │

```

---

## 🔄 Reward Distribution System

```
┌──────────────────────────────────────────┐
│    REWARD POINTS FLOW                    │
└──────────────────────────────────────────┘

Request Created
     │
     ├─ Status: "open"
     ├─ Referral_count: 0
     └─ Max_referrals: 3
          │
          ▼
Referrer Submits
     │
     ├─ Create Referral record
     ├─ Status: "pending"
     ├─ Increment referral_count
     └─ Update request status: "pending_confirmation"
          │
          ▼
Referrer Confirms
     │
     ├─ Update Referral.referrer_confirmed_at
     ├─ Status: "confirmed" (if only referrer)
     └─ Wait for job seeker...
          │
          ▼
Job Seeker Confirms
     │
     ├─ Update Referral.job_seeker_confirmed_at
     ├─ Status: "verified" (both confirmed!)
     │
     ├─ ✅ AWARD POINTS!
     │  ├─ Create Reward record
     │  │  ├─ Type: "referral"
     │  │  ├─ Points: 100
     │  │  └─ Referral_id: <referral.id>
     │  │
     │  └─ Update User.reward_points += 100
     │
     └─ Close request (mark as closed)

```

---

## 📁 File Organization

```
DATA LAYER
├── Models (ORM)
│   ├── User
│   ├── Company
│   ├── ReferralRequest
│   ├── Referral
│   ├── Reward
│   └── VerificationToken
│
└── Database
    ├── migrations/001_init.sql
    └── Schema with relationships

BUSINESS LOGIC LAYER
├── Services
│   ├── AuthService
│   ├── EmailService
│   └── VerificationService
│
└── Repositories
    ├── UserRepository
    ├── RequestRepository
    └── RewardRepository

API LAYER
├── Handlers
│   ├── AuthHandler
│   ├── UserHandler
│   ├── RequestHandler
│   ├── ReferralHandler
│   ├── RewardHandler
│   └── AdminHandler
│
├── Routes
│   ├── /auth
│   ├── /users
│   ├── /requests
│   ├── /referrals
│   ├── /rewards
│   └── /admin
│
└── Middleware
    ├── JWT Auth
    ├── CORS
    ├── Admin check
    └── Error handling
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────┐
│         PRODUCTION SETUP                 │
└─────────────────────────────────────────┘

CDN (CloudFlare)
     │
     ▼
Frontend (Vercel)
     │
     ├─ Next.js app
     ├─ Static assets
     └─ SSR
     │
     │ HTTPS
     ▼
API Server (Railway/Render)
     │
     ├─ Go/Gin API
     ├─ Port 8000
     └─ Environment variables
     │
     │ SQL/TLS
     ▼
Database (AWS RDS/Railway)
     │
     ├─ PostgreSQL 12+
     ├─ Automated backups
     └─ Multi-AZ
     │
     ▼
Email Service (SendGrid/AWS SES)
     │
     └─ Verification emails
        Notification emails
```

---

## 🔍 Monitoring & Logging

```
┌──────────────────────────┐
│    LOGGING & METRICS     │
└──────────────────────────┘

Backend Logs
├─ Request/Response logs
├─ Error logs
├─ Database queries
└─ Authentication events

Frontend Logs
├─ JavaScript errors
├─ API call logs
├─ User actions
└─ Performance metrics

Database Monitoring
├─ Query performance
├─ Connection count
├─ Disk usage
└─ Backup status

Application Metrics
├─ API response time
├─ Error rate
├─ User signups
├─ Referral completion rate
└─ Reward distribution
```

---

This architecture supports:
- ✅ Scalability (stateless API)
- ✅ Security (JWT + encryption)
- ✅ Reliability (database constraints)
- ✅ Monitoring (complete logging)
- ✅ Performance (indexed queries)
