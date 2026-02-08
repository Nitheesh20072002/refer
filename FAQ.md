# 🤔 FAQ - Frequently Asked Questions

## Getting Started

### Q: Where do I start?
**A:** Open [QUICK_REFERENCE.md](QUICK_REFERENCE.md) and run `docker-compose up -d`. Takes 5 minutes!

### Q: Do I need to install Go and Node.js separately?
**A:** Only if you want manual setup. Docker includes everything. Recommended: Use Docker.

### Q: What's the easiest way to run this locally?
**A:** 
```bash
cd d:\refer
docker-compose up -d
```
That's it! All services start automatically.

---

## Frontend Questions

### Q: Can I run just the frontend?
**A:** Yes, but you need the backend API running. Set `NEXT_PUBLIC_API_URL` in `.env.local`.

### Q: Where do I add new pages?
**A:** Create `.tsx` files in `frontend/app/`. Next.js automatically routes them.

### Q: How do I add authentication to a page?
**A:** Wrap it with `ProtectedRoute` component:
```tsx
import ProtectedRoute from '@/components/ProtectedRoute'

export default function MyPage() {
  return (
    <ProtectedRoute requiredRole="referrer">
      <YourContent />
    </ProtectedRoute>
  )
}
```

### Q: Where's the state management?
**A:** In `frontend/lib/store.ts` using Zustand. Import with `useAuthStore()`.

### Q: How do I call the API?
**A:** Use the `apiClient` from `frontend/lib/api.ts`:
```tsx
import apiClient from '@/lib/api'

const response = await apiClient.get('/api/users/profile')
```

### Q: Can I change the styling?
**A:** Yes! It uses Tailwind CSS. Edit `frontend/tailwind.config.ts` or modify class names.

---

## Backend Questions

### Q: Can I add new endpoints?
**A:** Yes! Follow this pattern:
1. Create handler in `internal/handlers/`
2. Add route in `cmd/server/main.go`
3. Add to the appropriate route group

### Q: Where do I add business logic?
**A:** Create services in `internal/services/` (currently has placeholders).

### Q: How do I add a new database table?
**A:** 
1. Create model in `internal/models/`
2. Create migration SQL in `migrations/`
3. Update GORM auto-migrate in `internal/config/database.go`

### Q: How do I query the database?
**A:** Use GORM. Example:
```go
var user models.User
db.First(&user, userID)
db.Where("email = ?", email).First(&user)
```

### Q: Where's the email sending?
**A:** Framework is ready in `internal/services/email_service.go`. Use Nodemailer, SendGrid, or AWS SES.

---

## Database Questions

### Q: Where's my data stored?
**A:** PostgreSQL database:
- Docker: `postgres` service in docker-compose.yml
- Manual: Make sure database name is `referloop`

### Q: How do I see the data?
**A:** Three ways:
1. pgAdmin: http://localhost:5050
2. psql: `psql -U postgres referloop`
3. Database GUI tool (DBeaver, etc.)

### Q: Can I change the schema?
**A:** Yes, but:
1. Create a new migration SQL file
2. Apply it: `psql -U postgres referloop < new_migration.sql`
3. Update models in `internal/models/`

### Q: How do I backup the database?
**A:** 
```bash
pg_dump -U postgres referloop > backup.sql
```

### Q: How do I restore from backup?
**A:** 
```bash
psql -U postgres referloop < backup.sql
```

---

## Authentication & Authorization

### Q: How does JWT authentication work?
**A:** 
1. User logs in
2. Backend creates JWT token
3. Frontend stores in localStorage
4. Frontend includes in `Authorization: Bearer <token>` header
5. Backend validates token on each request

### Q: Where's the token stored?
**A:** `localStorage` on the frontend (see `frontend/lib/store.ts`)

### Q: How long do tokens last?
**A:** 7 days (see `backend/internal/handlers/auth.go`)

### Q: How do I make an endpoint require admin only?
**A:** Add middleware:
```go
admin := router.Group("/api/admin")
admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
{
    admin.GET("/users", handlers.AdminGetUsers)
}
```

### Q: Can I use OAuth (Google, GitHub login)?
**A:** Not built-in yet, but easy to add. Use popular libraries:
- Go: `github.com/markbates/goth`
- Next.js: `next-auth.js`

---

## API Questions

### Q: How do I test the API?
**A:** Use curl, Postman, or Insomnia. See `QUICK_REFERENCE.md` for examples.

### Q: What's the API response format?
**A:** JSON. Check `docs/API.md` for all endpoints and examples.

### Q: How do I handle errors?
**A:** Backend returns proper HTTP status codes:
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

### Q: Can I use the API from a mobile app?
**A:** Yes! It's just HTTP/JSON. No special mobile setup needed.

### Q: How do I add pagination to list endpoints?
**A:** Not built-in yet. You can add:
```go
// In handlers
page := c.Query("page", "1")
limit := c.Query("limit", "10")
offset := (page - 1) * limit
db.Offset(offset).Limit(limit).Find(&items)
```

---

## Deployment Questions

### Q: How do I deploy the backend?
**A:** To Railway/Render:
1. Push to GitHub
2. Connect repo to Railway/Render
3. Set environment variables
4. Deploy!

### Q: How do I deploy the frontend?
**A:** To Vercel:
1. Push to GitHub
2. Connect repo to Vercel
3. Set `NEXT_PUBLIC_API_URL` to production API
4. Deploy!

### Q: How do I use a production database?
**A:** 
1. Create PostgreSQL on AWS RDS, Railway, etc.
2. Set `DB_HOST`, `DB_USER`, `DB_PASSWORD` in production `.env`
3. Run migrations on production database
4. Deploy backend

### Q: Can I use Docker for production?
**A:** Yes! But needs:
- Container registry (Docker Hub, GitHub Container Registry)
- Orchestration (Docker Compose, Kubernetes)
- Load balancer
- SSL/TLS certificate

### Q: What about SSL/TLS?
**A:** 
- Vercel: Automatic
- Custom server: Use Let's Encrypt (free) or AWS ACM

---

## Features & Functionality

### Q: How do reward points work?
**A:** 
- 100 points per confirmed referral
- Awarded when both parties confirm
- Stored in `user.reward_points`
- Can be redeemed later (framework ready)

### Q: Can users have multiple roles?
**A:** Currently no. A user is either job_seeker or referrer. Could be changed to support both.

### Q: What happens if a company email isn't verified?
**A:** The endpoint checks `is_verified`. Email verification required before full access.

### Q: Can I delete a referral request?
**A:** Not explicitly built-in, but you can:
1. Update status to "closed"
2. Add soft delete (use `deleted_at` field)

### Q: Can referrers see job seeker information?
**A:** Only basic info when viewing requests. For full profile, needs additional permission.

### Q: Can I export user data?
**A:** Not built-in. Easy to add:
```go
func ExportUserData(c *gin.Context) {
    // Query user data
    // Return as CSV or JSON
}
```

---

## Performance & Scaling

### Q: How many users can this handle?
**A:** 
- MVP setup: 1000s of concurrent users
- Optimizations needed for millions:
  - Database indexing (done)
  - Caching (Redis)
  - Load balancing
  - Database sharding

### Q: Should I add caching?
**A:** Yes, for production. Add Redis:
```go
import "github.com/go-redis/redis/v8"
// Cache company list, user profiles, etc.
```

### Q: What about search functionality?
**A:** Not built-in. Add with:
- Full-text search (PostgreSQL `tsvector`)
- Elasticsearch
- Algolia

### Q: Do I need a CDN?
**A:** 
- Frontend: Vercel handles it
- Assets: Yes, use CloudFlare or AWS CloudFront
- API: No, but load balancer helps

---

## Troubleshooting

### Q: API returns 401 Unauthorized
**A:** Check:
1. Is token in `Authorization: Bearer <token>` header?
2. Is token expired? (7 days)
3. Is email verified?
4. Did you copy token correctly?

### Q: API returns 403 Forbidden
**A:** Check:
1. Is email verified? (`is_verified = true`)
2. Is user role correct?
3. Is admin trying to access non-admin endpoint?

### Q: Database connection fails
**A:** Check:
1. Is PostgreSQL running?
2. Are credentials in `.env` correct?
3. Does database `referloop` exist?
4. Is port 5432 open?

### Q: Frontend can't reach API
**A:** Check:
1. Is `NEXT_PUBLIC_API_URL` set in `.env.local`?
2. Is it the correct URL?
3. Is backend running?
4. Any CORS errors? Check browser console.

### Q: Email not being sent
**A:** Check:
1. Is email service configured?
2. Are SMTP credentials correct?
3. Check email spam folder
4. Check backend logs

### Q: Can't login to pgAdmin
**A:** 
- Email: `admin@referloop.local`
- Password: `admin`
- Change after first login!

---

## Development Tips

### Q: How do I debug the backend?
**A:** 
```bash
# Add logging
fmt.Printf("Debug: %+v\n", variable)

# Use Go debugger (Delve)
dlv debug ./cmd/server
```

### Q: How do I debug the frontend?
**A:** 
- F12 in browser → DevTools
- Console for errors
- Network tab for API calls
- Run `npm run type-check` for TypeScript errors

### Q: Should I commit `.env` files?
**A:** NO! Only commit `.env.example` with dummy values.

### Q: How do I add tests?
**A:** 
- Backend: Use `testing` package
- Frontend: Use Jest + React Testing Library

### Q: Where do I add comments?
**A:** Everywhere! Good comments explain WHY, not WHAT.

---

## Best Practices

### Q: How should I handle sensitive data?
**A:** 
- Never commit secrets
- Use environment variables
- Hash passwords (bcrypt - done)
- Use HTTPS in production
- Validate all input

### Q: How should I structure API requests?
**A:** 
```typescript
// Good
const data = { email, password }
const response = await api.post('/auth/login', data)

// Bad - sensitive in URL
const response = await api.get(`/auth/login?password=${pw}`)
```

### Q: Should I validate on frontend and backend?
**A:** YES! Always do both:
- Frontend: Quick user feedback
- Backend: Security (frontend validation can be bypassed)

---

## General Questions

### Q: Can I commercialize this?
**A:** Yes! It's your project.

### Q: Can I modify it?
**A:** Completely! Change anything to fit your needs.

### Q: Can I use it as a template?
**A:** Yes! It's designed as a starting point.

### Q: Where do I get help?
**A:** 
1. Check documentation in `docs/`
2. Read code comments
3. Google the error message
4. Ask in developer communities (Stack Overflow, etc.)

### Q: How do I stay updated with Go/Node.js versions?
**A:** 
```bash
go version       # Check Go version
node --version   # Check Node version
npm update       # Update npm packages
go get -u ./... # Update Go modules
```

---

## Need More Help?

**Check the documentation:**
- Quick start → [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- Setup → [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)
- API → [docs/API.md](docs/API.md)
- Architecture → [ARCHITECTURE.md](ARCHITECTURE.md)

**Or search the codebase:**
- Handler examples in `backend/internal/handlers/`
- Component examples in `frontend/components/`
- Database examples in `backend/internal/models/`

Happy building! 🚀
