# xyz (ReferLoop) - Referral Marketplace for IT Jobs

A two-sided platform connecting job seekers with employees who can refer them, unlocking the power of referrals.

## 🎯 Project Structure

```
xyz/
├── backend/          # Go API (Gin framework)
│   ├── cmd/server/   # Entry point
│   ├── internal/     # Core application logic
│   │   ├── handlers/ # HTTP handlers
│   │   ├── models/   # Data models
│   │   ├── config/   # Configuration
│   │   ├── middleware/ # Auth & CORS
│   │   └── services/ # Business logic
│   └── migrations/   # Database migrations
│
├── frontend/         # Next.js React App
│   ├── app/          # Next.js pages
│   ├── components/   # React components
│   └── lib/          # Utilities & API client
│
└── docs/             # Documentation

```

## 🚀 Quick Start

### Prerequisites
- Go 1.21+
- Node.js 18+
- PostgreSQL 12+
- Docker & Docker Compose (optional)

### Using Docker Compose (Recommended)

```bash
cd d:\refer
docker-compose up -d
```

This will start:
- PostgreSQL database on `localhost:5432`
- Go API on `localhost:8000`
- pgAdmin on `localhost:5050` (admin@referloop.local / admin)

### Manual Setup

#### Backend

1. **Install dependencies:**
   ```bash
   cd backend
   go mod download
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Create database:**
   ```bash
   createdb -U postgres referloop
   psql -U postgres referloop < migrations/001_init.sql
   ```

4. **Run server:**
   ```bash
   go run cmd/server/main.go
   ```

Server will start on `http://localhost:8000`

#### Frontend

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Create `.env.local`:**
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Run dev server:**
   ```bash
   npm run dev
   ```

App will start on `http://localhost:3000`

---

## 📚 API Documentation

### Authentication

**POST** `/api/auth/signup`
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe",
  "role": "job_seeker" // or "referrer"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**POST** `/api/auth/verify-email`
```json
{
  "token": "verification_token_from_email"
}
```

### Referral Requests (Job Seekers)

**POST** `/api/requests` (auth required)
```json
{
  "company_id": 1,
  "job_title": "Senior Software Engineer",
  "job_url": "https://company.com/jobs/123",
  "description": "Backend engineer for microservices",
  "tech_stack": "Go, PostgreSQL, Docker",
  "experience_level": "senior",
  "max_referrals": 3
}
```

**GET** `/api/requests` (auth required)
- Get user's own requests (job seeker) or available requests for company (referrer)

**GET** `/api/requests/:id` (auth required)
- Get specific request details

---

## 🔐 User Roles

### Job Seeker
- Create referral requests
- View their own requests
- Confirm referrals received
- Track interview opportunities

### Referrer (Employee)
- View open requests for their company
- Submit referrals for candidates
- Earn reward points (100 points per confirmed referral)
- Track referral history

### Admin
- Manage all users & requests
- Manually verify referrals
- Monitor platform activity
- Manage reward distributions

---

## 💾 Database Schema

### Key Tables
- **users** - User accounts with roles
- **companies** - Verified company information
- **referral_requests** - Job seeker requests
- **referrals** - Connections between requests and referrers
- **rewards** - Points earned by referrers
- **verification_tokens** - Email verification tokens

---

## 🔐 Security Features

✅ JWT token authentication
✅ Password hashing with bcrypt
✅ Email verification required
✅ Company domain verification for referrers
✅ Duplicate referral prevention
✅ CORS protection
✅ Role-based access control

---

## 📖 Features (MVP)

- [x] User signup/login with email verification
- [x] Job seeker request creation
- [x] Referrer request matching by company
- [x] Referral confirmation system (both parties)
- [x] Automatic reward points distribution
- [x] Admin verification dashboard
- [ ] Email notifications (in progress)
- [ ] Request expiration & archiving
- [ ] Advanced filtering & search
- [ ] Referrer leaderboard
- [ ] Analytics dashboard

---

## 🛠️ Tech Stack

**Backend:**
- Go 1.21+
- Gin Web Framework
- GORM (ORM)
- PostgreSQL
- JWT Authentication

**Frontend:**
- Next.js 14+
- React 18+
- TypeScript
- Tailwind CSS
- Zustand (state management)

**DevOps:**
- Docker & Docker Compose
- PostgreSQL
- CI/CD ready (GitHub Actions)

---

## 📝 Environment Variables

Create `.env` in the root backend directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=referloop

# Server
PORT=8000
GIN_MODE=debug
JWT_SECRET=your-super-secret-key

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-password

# URLs
FRONTEND_URL=http://localhost:3000
```

---

## 🚦 Next Steps

1. ✅ Create backend structure (DONE)
2. ⏳ Create Next.js frontend
3. ⏳ Implement email service
4. ⏳ Add request expiration & cleanup
5. ⏳ Build admin dashboard
6. ⏳ Deploy to production
7. ⏳ Launch marketing & user acquisition

---

## 📞 Support

For questions or issues, please open a GitHub issue or contact the team.

---

## 📄 License

MIT License - See LICENSE file for details
