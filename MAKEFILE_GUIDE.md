
# Makefile Commands Guide

Quick reference for all available `make` commands in the ReferLoop project.

## 🚀 Quick Start

```bash
# See all available commands
make help

# Initial setup (first time only)
make install

# Start development environment
make dev

# View emails in MailHog
make mail

# Check service health
make health
```

---

## 📋 All Commands

### Development Commands

| Command | Description |
|---------|-------------|
| `make dev` | Start development environment (with MailHog & pgweb) |
| `make dev-down` | Stop development environment |
| `make dev-logs` | View development logs (all services) |
| `make dev-build` | Rebuild and start development environment |
| `make up` | Alias for `make dev` |
| `make down` | Alias for `make dev-down` |
| `make logs` | Alias for `make dev-logs` |

### Production Commands

| Command | Description |
|---------|-------------|
| `make prod` | Start production environment (no MailHog) |
| `make prod-down` | Stop production environment |
| `make prod-logs` | View production logs |
| `make prod-build` | Rebuild and start production environment |

### Service-Specific Commands

| Command | Description |
|---------|-------------|
| `make api-logs` | View backend API logs only |
| `make api-restart` | Restart backend API |
| `make frontend-logs` | View frontend logs only |
| `make frontend-restart` | Restart frontend |
| `make restart` | Restart all services |

### Database Commands

| Command | Description |
|---------|-------------|
| `make db-logs` | View database logs |
| `make db-shell` | Open PostgreSQL shell (psql) |
| `make db-reset` | Reset database (⚠️ deletes all data!) |
| `make shell-db` | Alias for `make db-shell` |

### Email & Testing Commands

| Command | Description |
|---------|-------------|
| `make mail` | Open MailHog UI in browser |
| `make mail-clear` | Clear all emails in MailHog |
| `make test-signup` | Test signup endpoint with sample user |
| `make test-email` | Alias for `make test-signup` |

### Health & Status Commands

| Command | Description |
|---------|-------------|
| `make health` | Check health of all services (API, MailHog, DB) |
| `make status` | Show status of all Docker containers |

### Cleanup Commands

| Command | Description |
|---------|-------------|
| `make clean` | Remove ALL containers, volumes, and images (⚠️ destructive!) |
| `make clean-volumes` | Remove only volumes (keeps images) |

### Utility Commands

| Command | Description |
|---------|-------------|
| `make install` | Initial setup (copy .env, build images) |
| `make rebuild` | Alias for `make dev-build` |
| `make shell-api` | Open shell in backend container |
| `make pgweb` | Open pgweb database UI in browser |
| `make open` | Open all development UIs (frontend, MailHog, pgweb) |
| `make help` | Show all available commands |

---

## 🎯 Common Workflows

### First Time Setup

```bash
# 1. Initial setup
make install

# 2. Update .env file with your settings
nano .env

# 3. Start development
make dev

# 4. Open all UIs
make open
```

### Daily Development

```bash
# Start work
make dev

# View logs
make logs

# Test email
make test-signup
make mail

# Stop work
make down
```

### After Code Changes

```bash
# Backend changes
make api-restart

# Frontend changes
make frontend-restart

# Major changes (rebuild)
make rebuild
```

### Debugging

```bash
# Check service health
make health

# View specific service logs
make api-logs          # Backend
make frontend-logs     # Frontend
make db-logs          # Database

# Open shell in backend
make shell-api

# Open database shell
make db-shell

# Check all container status
make status
```

### Testing Email Flow

```bash
# 1. Start development
make dev

# 2. Test signup (sends email)
make test-signup

# 3. View email in MailHog
make mail

# 4. Clear emails for next test
make mail-clear
```

### Database Management

```bash
# View database in browser
make pgweb

# Open PostgreSQL shell
make db-shell

# Reset database (fresh start)
make db-reset
```

### Production Deployment

```bash
# Build for production
make prod-build

# Start production
make prod

# View logs
make prod-logs

# Stop production
make prod-down
```

---

## 💡 Tips & Tricks

### 1. Combine Commands

```bash
# Clean and start fresh
make clean && make dev

# Rebuild and view logs
make rebuild && make logs
```

### 2. Watch Logs in Real-Time

```bash
# All services
make logs

# Just backend
make api-logs

# Just frontend
make frontend-logs
```

### 3. Quick Health Check

```bash
# Check if everything is running
make health

# Or check container status
make status
```

### 4. Test Email Immediately

```bash
# One command to test and view
make test-signup && make mail
```

### 5. Database Quick Access

```bash
# Open pgweb UI
make pgweb

# Or use psql directly
make db-shell
```

---

## 🔧 Makefile Features

### Colored Output

The Makefile uses colors for better readability:
- 🟢 **Green**: Success messages
- 🟡 **Yellow**: Warnings and info
- 🔴 **Red**: Errors and destructive operations

### Safety Prompts

Destructive commands require confirmation:
```bash
make clean      # Prompts: "Are you sure? [y/N]"
make db-reset   # Prompts: "Are you sure? [y/N]"
```

### Smart Commands

- `make mail` - Opens browser automatically (macOS/Linux)
- `make health` - Tests all services and shows status
- `make install` - Creates `.env` from `.env.example` if missing
- `make test-signup` - Uses timestamp for unique email addresses

---

## 🐛 Troubleshooting

### Command not found: make

**macOS:**
```bash
xcode-select --install
```

**Linux:**
```bash
sudo apt-get install build-essential  # Ubuntu/Debian
sudo yum install make                  # CentOS/RHEL
```

**Windows:**
Use WSL2 or Git Bash with make installed.

### Services not starting

```bash
# Check status
make status

# View logs for errors
make logs

# Try rebuilding
make clean-volumes
make dev
```

### Port already in use

Check which ports are occupied:
```bash
lsof -i :3000   # Frontend
lsof -i :8080   # Nginx
lsof -i :8025   # MailHog
lsof -i :8081   # pgweb
lsof -i :5432   # PostgreSQL
```

### MailHog not receiving emails

```bash
# Check MailHog is running
make health

# View backend logs for errors
make api-logs | grep -i email

# Restart API
make api-restart
```

---

## 📚 Related Documentation

- [`README.md`](README.md) - Project overview
- [`DEVELOPMENT_SETUP.md`](DEVELOPMENT_SETUP.md) - Development environment guide
- [`EMAIL_SERVICE_QUICKSTART.md`](EMAIL_SERVICE_QUICKSTART.md) - Email service quick start
- [`PRODUCTION_EMAIL_SETUP.md`](PRODUCTION_EMAIL_SETUP.md) - Production deployment

---

## 🎉 Quick Reference Card

**Most Used Commands:**
```bash
make dev          # Start development
make logs         # View logs
make mail         # Open MailHog
make health       # Check services
make test-signup  # Test email
make down         # Stop everything
```

**Debugging:**
```bash
make status       # Container status
make api-logs     # Backend logs
make db-shell     # Database shell
make shell-api    # Backend shell
```

**Cleanup:**
```bash
make restart      # Restart all
make rebuild      # Rebuild all
make clean        # Remove everything
```

---

**Pro Tip:** Run `make help` anytime to see all available commands!
