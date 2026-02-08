# Getting Started Guide

## System Requirements

- **Go**: 1.21 or later
- **Node.js**: 18+ and npm
- **PostgreSQL**: 12+
- **Docker** (optional, but recommended)

---

## Quick Start with Docker (Recommended)

### 1. Clone and navigate to project
```bash
cd d:\refer
```

### 2. Copy environment file
```bash
copy .env.example .env
```

### 3. Start services with Docker Compose
```bash
docker-compose up -d
```

This will start:
- PostgreSQL on `localhost:5432`
- Go API on `localhost:8000`
- pgAdmin on `localhost:5050`

### 4. Check health
```bash
curl http://localhost:8000/health
```

Should return: `{"status":"ok"}`

---

## Manual Setup

### Backend (Go)

#### 1. Navigate to backend
```bash
cd backend
```

#### 2. Install dependencies
```bash
go mod download
```

#### 3. Setup PostgreSQL
```bash
# Create database
createdb -U postgres referloop

# Run migrations
psql -U postgres referloop < migrations/001_init.sql
```

#### 4. Create .env file
```bash
copy ..\env.example .env
```

Update with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=referloop
JWT_SECRET=your-super-secret-key
```

#### 5. Run server
```bash
go run cmd/server/main.go
```

Server will start on `http://localhost:8000`

---

### Frontend (Next.js)

#### 1. Navigate to frontend
```bash
cd frontend
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Create .env.local
```bash
copy .env.local.example .env.local
```

Update if needed:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### 4. Run dev server
```bash
npm run dev
```

App will start on `http://localhost:3000`

---

## Database Setup

### Using Docker
Database is automatically created and initialized by docker-compose.

### Manual Setup
1. Create database:
   ```bash
   createdb -U postgres referloop
   ```

2. Run migrations:
   ```bash
   psql -U postgres referloop < backend/migrations/001_init.sql
   ```

3. Add sample companies (optional):
   ```sql
   INSERT INTO companies (name, website, domain) VALUES
   ('Google', 'https://google.com', 'google.com'),
   ('Microsoft', 'https://microsoft.com', 'microsoft.com'),
   ('Apple', 'https://apple.com', 'apple.com'),
   ('Meta', 'https://meta.com', 'facebook.com'),
   ('Amazon', 'https://amazon.com', 'amazon.com');
   ```

---

## Testing Flows

### 1. Signup as Job Seeker
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seeker@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Seeker",
    "role": "job_seeker"
  }'
```

### 2. Signup as Referrer
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "referrer@google.com",
    "password": "password123",
    "first_name": "Jane",
    "last_name": "Referrer",
    "role": "referrer",
    "company_id": 1
  }'
```

### 3. Verify Email & Login
- Check email for verification link (or skip in dev)
- OR use POST /auth/verify-email with token
- Then login to get JWT token

### 4. Create Referral Request (Job Seeker)
```bash
curl -X POST http://localhost:8000/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "company_id": 1,
    "job_title": "Senior Go Developer",
    "job_url": "https://google.com/jobs/123",
    "tech_stack": "Go, PostgreSQL, Docker",
    "experience_level": "senior",
    "max_referrals": 3
  }'
```

### 5. View Available Requests (Referrer)
```bash
curl -X GET "http://localhost:8000/api/requests" \
  -H "Authorization: Bearer REFERRER_TOKEN"
```

### 6. Submit Referral (Referrer)
```bash
curl -X POST http://localhost:8000/api/referrals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer REFERRER_TOKEN" \
  -d '{
    "request_id": 1,
    "notes": "Great developer, trust them"
  }'
```

### 7. Confirm Referral (Both Parties)
```bash
# Referrer confirms
curl -X PUT http://localhost:8000/api/referrals/1/confirm \
  -H "Authorization: Bearer REFERRER_TOKEN"

# Job Seeker confirms
curl -X PUT http://localhost:8000/api/referrals/1/confirm \
  -H "Authorization: Bearer SEEKER_TOKEN"
```

When both confirm → Referrer gets 100 points!

### 8. Check Rewards
```bash
curl -X GET http://localhost:8000/api/rewards/balance \
  -H "Authorization: Bearer REFERRER_TOKEN"
```

---

## Frontend Development

### Available Scripts
```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run type-check # TypeScript type checking
```

### Project Structure
- `app/` - Next.js pages
- `components/` - Reusable components
- `lib/` - Utilities, API client, state management
- `public/` - Static assets

### Key Features to Implement
- [ ] Job seeker dashboard
- [ ] Referrer dashboard
- [ ] Request creation form
- [ ] Referral management
- [ ] Reward leaderboard
- [ ] Admin panel
- [ ] Email notifications

---

## Backend Development

### Project Structure
- `cmd/server/` - Entry point
- `internal/handlers/` - HTTP handlers
- `internal/models/` - Database models
- `internal/middleware/` - Auth, CORS, etc.
- `internal/config/` - Configuration
- `migrations/` - Database migrations

### Adding New Features

1. **Create model** in `internal/models/`
2. **Create handler** in `internal/handlers/`
3. **Add route** in `cmd/server/main.go`
4. **Create migration** if needed in `migrations/`
5. **Test with cURL** or frontend

---

## Troubleshooting

### Database Connection Error
```
Error: could not connect to database
```
- Check PostgreSQL is running
- Verify .env credentials
- Ensure database exists: `createdb referloop`

### Port Already in Use
```
Error: listen tcp :8000: bind: address already in use
```
- Change `PORT` in .env or use different port
- Kill process: `lsof -ti:8000 | xargs kill -9` (Mac/Linux)

### JWT Secret Not Set
```
Error: Failed to generate token
```
- Set `JWT_SECRET` in .env file
- Generate random: `openssl rand -base64 32`

### CORS Error in Frontend
```
Access to XMLHttpRequest blocked by CORS policy
```
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify backend CORS middleware is active

### Frontend Build Error
```
Cannot find module 'react'
```
- Run `npm install` in frontend directory
- Delete `node_modules` and `.next`, then reinstall

---

## Production Deployment

### Backend (Go)
```bash
# Build binary
go build -o api cmd/server/main.go

# Deploy with environment variables
API_URL=https://api.referloop.com
```

### Frontend (Next.js)
```bash
# Build
npm run build

# Deploy to Vercel
vercel --prod

# Or use Docker
docker build -t referloop-frontend .
```

### Database
- Use managed PostgreSQL (AWS RDS, Railway, etc.)
- Set `DB_HOST`, `DB_USER`, `DB_PASSWORD` as env vars
- Run migrations before deployment

---

## Need Help?

Check the documentation:
- `docs/API.md` - Complete API reference
- `docs/DATABASE.md` - Schema details
- `README.md` - Project overview

Or reach out to the team!
