# Quick Reference Card

## 🚀 Start the Project

### Docker (Recommended)
```bash
cd d:\refer
docker-compose up -d
```

### Manual
```bash
# Terminal 1: Backend
cd backend && go run cmd/server/main.go

# Terminal 2: Frontend
cd frontend && npm install && npm run dev
```

---

## 🌐 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| Backend API | http://localhost:8000 | - |
| pgAdmin | http://localhost:5050 | admin@referloop.local / admin |
| Database | localhost:5432 | postgres / postgres |

---

## 📂 Important Directories

```
backend/
  ├── cmd/server/main.go          ← Backend entry point
  ├── internal/handlers/           ← API endpoints
  ├── internal/models/             ← Database models
  └── migrations/001_init.sql      ← Database schema

frontend/
  ├── app/page.tsx                 ← Home page
  ├── app/auth/login/              ← Auth pages
  ├── components/                  ← React components
  └── lib/store.ts                 ← State management

docs/
  ├── API.md                       ← Complete API reference
  └── GETTING_STARTED.md           ← Setup guide
```

---

## 🔐 Test Accounts

Create for testing:

**Job Seeker:**
```
Email: seeker@example.com
Password: password123
Role: job_seeker
```

**Referrer (from Google):**
```
Email: referrer@google.com
Password: password123
Role: referrer
Company: Google (ID: 1)
```

**Admin:**
```
Email: admin@example.com
Password: password123
Role: admin (set manually in DB)
```

---

## 🧪 Test API with cURL

### Signup
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","first_name":"John","last_name":"Doe","role":"job_seeker"}'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Create Request (need JWT token)
```bash
curl -X POST http://localhost:8000/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"company_id":1,"job_title":"Engineer","job_url":"https://example.com/job","tech_stack":"Go,SQL","experience_level":"senior","max_referrals":3}'
```

---

## 📝 Environment Variables

Create `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=referloop
PORT=8000
GIN_MODE=debug
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🗄️ Database Commands

```bash
# Connect to database
psql -U postgres referloop

# List tables
\dt

# View schema of a table
\d referral_requests

# Run a query
SELECT * FROM users;

# Exit
\q
```

### Add Sample Companies
```sql
INSERT INTO companies (name, website, domain) VALUES
('Google', 'https://google.com', 'google.com'),
('Microsoft', 'https://microsoft.com', 'microsoft.com'),
('Apple', 'https://apple.com', 'apple.com');
```

---

## 🔄 User Flows

### Complete Job Seeker Flow
1. Sign up (role: job_seeker)
2. Verify email
3. Login
4. View companies: `GET /api/users/companies`
5. Create request: `POST /api/requests`
6. Wait for referrals
7. Confirm referral: `PUT /api/referrals/:id/confirm`

### Complete Referrer Flow
1. Sign up (role: referrer, company_id: 1)
2. Verify email
3. Login
4. View available: `GET /api/requests`
5. Submit referral: `POST /api/referrals`
6. Confirm submission: `PUT /api/referrals/:id/confirm`
7. Check rewards: `GET /api/rewards/balance`

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8000 in use | Change PORT in .env or kill process |
| DB connection error | Verify PostgreSQL running, check .env |
| "Cannot find module" (frontend) | Run `npm install` in frontend dir |
| Frontend shows API errors | Check NEXT_PUBLIC_API_URL in .env.local |
| Token expired | Login again to get new token |
| Database migrations failed | Run `psql -U postgres referloop < migrations/001_init.sql` |

---

## 📦 Dependencies

### Backend (Go)
- gin-gonic/gin - Web framework
- gorm - ORM
- golang-jwt - Authentication
- golang.org/x/crypto - Password hashing

Install: `go mod download`

### Frontend (Node.js)
- next - React framework
- zustand - State management
- react-hook-form - Form handling
- tailwindcss - Styling

Install: `npm install`

---

## 🚀 Development Tips

### Debug Backend
```bash
# See logs
go run cmd/server/main.go

# Use debugger
dlv debug ./cmd/server
```

### Debug Frontend
```bash
# TypeScript errors
npm run type-check

# Linting errors
npm run lint

# Browser DevTools (F12)
- Check Network tab for API calls
- Check Console for JavaScript errors
```

### Test Endpoints
Use Postman or Insomnia:
1. Import from docs/API.md
2. Add Authorization header with token
3. Test each endpoint

---

## 📊 Key Metrics to Track

- User signups (job_seeker vs referrer)
- Referral requests created
- Referrals submitted
- Confirmation rate
- Reward points distributed
- Request success rate

---

## 🎯 MVP Checklist

- [x] User authentication
- [x] Email verification (framework ready)
- [x] Job seeker requests
- [x] Referrer submissions
- [x] Confirmation system
- [x] Reward distribution
- [x] Admin controls
- [ ] Email notifications
- [ ] Frontend UI (in progress)
- [ ] Analytics dashboard

---

## 📚 Documentation Links

- **Full API Docs**: `docs/API.md`
- **Setup Guide**: `docs/GETTING_STARTED.md`
- **Database Schema**: `docs/DATABASE.md`
- **Project Overview**: `README.md`

---

## 💡 Remember

- All authenticated endpoints need `Authorization: Bearer TOKEN`
- Job seekers can only see their own requests
- Referrers can only see requests for their company
- Admins can see everything
- Reward points auto-credited when both parties confirm
- Email verification required before using app

---

**Questions?** Check the full documentation in `docs/` folder! 📖
