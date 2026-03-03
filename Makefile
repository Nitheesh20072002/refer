
.PHONY: help dev prod up down logs build clean restart test db-reset mail health install

# Colors for output
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
NC     := \033[0m # No Color

# Default target
.DEFAULT_GOAL := help

## Help
help: ## Show this help message
	@echo '${GREEN}ReferLoop - Available Commands${NC}'
	@echo ''
	@echo 'Usage:'
	@echo '  ${YELLOW}make${NC} ${GREEN}<target>${NC}'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  ${YELLOW}%-15s${NC} %s\n", $$1, $$2}' $(MAKEFILE_LIST)

## Development Commands
dev: ## Start development environment (with MailHog)
	@echo '${GREEN}Starting development environment...${NC}'
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
	@echo '${GREEN}✓ Development environment started${NC}'
	@echo ''
	@echo '${YELLOW}Services running at:${NC}'
	@echo '  Frontend:  http://localhost:3000'
	@echo '  Backend:   http://localhost:8080/api'
	@echo '  MailHog:   http://localhost:8025'
	@echo '  pgweb:     http://localhost:8081'
	@echo '  Health:    http://localhost:8080/health'

dev-down: ## Stop development environment
	@echo '${YELLOW}Stopping development environment...${NC}'
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
	@echo '${GREEN}✓ Development environment stopped${NC}'

dev-logs: ## View development logs
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

dev-build: ## Rebuild development environment
	@echo '${YELLOW}Rebuilding development environment...${NC}'
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
	@echo '${GREEN}✓ Development environment rebuilt${NC}'

## Production Commands
prod: ## Start production environment
	@echo '${GREEN}Starting production environment...${NC}'
	docker-compose up -d
	@echo '${GREEN}✓ Production environment started${NC}'
	@echo ''
	@echo '${YELLOW}Services running at:${NC}'
	@echo '  Application: http://localhost:8080'
	@echo '  Health:      http://localhost:8080/health'

prod-down: ## Stop production environment
	@echo '${YELLOW}Stopping production environment...${NC}'
	docker-compose down
	@echo '${GREEN}✓ Production environment stopped${NC}'

prod-logs: ## View production logs
	docker-compose logs -f

prod-build: ## Rebuild production environment
	@echo '${YELLOW}Rebuilding production environment...${NC}'
	docker-compose up -d --build
	@echo '${GREEN}✓ Production environment rebuilt${NC}'

## Service-Specific Commands
api-logs: ## View backend API logs
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f api

api-restart: ## Restart backend API
	@echo '${YELLOW}Restarting backend API...${NC}'
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart api
	@echo '${GREEN}✓ Backend API restarted${NC}'

frontend-logs: ## View frontend logs
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f frontend

frontend-restart: ## Restart frontend
	@echo '${YELLOW}Restarting frontend...${NC}'
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart frontend
	@echo '${GREEN}✓ Frontend restarted${NC}'

## Database Commands
db-logs: ## View database logs
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f postgres

db-shell: ## Open PostgreSQL shell
	@echo '${GREEN}Opening PostgreSQL shell...${NC}'
	docker exec -it referloop_postgres psql -U postgres -d referloop

db-reset: ## Reset database (WARNING: Deletes all data!)
	@echo '${RED}WARNING: This will delete all database data!${NC}'
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo '${YELLOW}Resetting database...${NC}'; \
		docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v; \
		docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d; \
		echo '${GREEN}✓ Database reset complete${NC}'; \
	else \
		echo '${YELLOW}Database reset cancelled${NC}'; \
	fi

## Email & Testing Commands
mail: ## Open MailHog UI in browser
	@echo '${GREEN}Opening MailHog UI...${NC}'
	@command -v open >/dev/null 2>&1 && open http://localhost:8025 || \
	 command -v xdg-open >/dev/null 2>&1 && xdg-open http://localhost:8025 || \
	 echo 'Please open http://localhost:8025 in your browser'

mail-clear: ## Clear all emails in MailHog
	@echo '${YELLOW}Clearing all emails in MailHog...${NC}'
	@curl -X DELETE http://localhost:8025/api/v1/messages 2>/dev/null || \
	 echo '${RED}Error: MailHog not running. Start with: make dev${NC}'
	@echo '${GREEN}✓ All emails cleared${NC}'

test-signup: ## Test signup with sample user
	@echo '${GREEN}Testing signup endpoint...${NC}'
	@curl -X POST http://localhost:8080/api/auth/signup \
		-H "Content-Type: application/json" \
		-d '{"email":"test-$(shell date +%s)@example.com","password":"TestPass123!","first_name":"Test","last_name":"User","role":"job_seeker"}' \
		| jq || echo '${RED}Error: Signup test failed${NC}'
	@echo ''
	@echo '${YELLOW}Check MailHog for verification email: http://localhost:8025${NC}'

test-email: test-signup ## Alias for test-signup

## Health & Status Commands
health: ## Check health of all services
	@echo '${GREEN}Checking service health...${NC}'
	@echo ''
	@echo '${YELLOW}Backend API:${NC}'
	@curl -s http://localhost:8080/health | jq || echo '${RED}✗ Backend not responding${NC}'
	@echo ''
	@echo '${YELLOW}MailHog:${NC}'
	@curl -s http://localhost:8025/api/v2/messages > /dev/null 2>&1 && \
		echo '${GREEN}✓ MailHog is running${NC}' || \
		echo '${RED}✗ MailHog not running${NC}'
	@echo ''
	@echo '${YELLOW}Database:${NC}'
	@docker exec referloop_postgres pg_isready -U postgres > /dev/null 2>&1 && \
		echo '${GREEN}✓ PostgreSQL is ready${NC}' || \
		echo '${RED}✗ PostgreSQL not ready${NC}'

status: ## Show status of all services
	@docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps

## Cleanup Commands
clean: ## Remove all containers, volumes, and images
	@echo '${RED}WARNING: This will remove all containers, volumes, and images!${NC}'
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo '${YELLOW}Cleaning up...${NC}'; \
		docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v --rmi all; \
		echo '${GREEN}✓ Cleanup complete${NC}'; \
	else \
		echo '${YELLOW}Cleanup cancelled${NC}'; \
	fi

clean-volumes: ## Remove only volumes (keeps containers and images)
	@echo '${YELLOW}Removing volumes...${NC}'
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
	@echo '${GREEN}✓ Volumes removed${NC}'

## Installation & Setup Commands
install: ## Initial setup (install dependencies, build images)
	@echo '${GREEN}Setting up ReferLoop...${NC}'
	@echo ''
	@echo '${YELLOW}1. Checking .env file...${NC}'
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo '${GREEN}✓ Created .env from .env.example${NC}'; \
		echo '${YELLOW}⚠ Please update .env with your settings${NC}'; \
	else \
		echo '${GREEN}✓ .env file exists${NC}'; \
	fi
	@echo ''
	@echo '${YELLOW}2. Building Docker images...${NC}'
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml build
	@echo '${GREEN}✓ Docker images built${NC}'
	@echo ''
	@echo '${GREEN}✓ Setup complete! Run "make dev" to start${NC}'

## Utility Commands
logs: dev-logs ## Alias for dev-logs

down: dev-down ## Alias for dev-down

up: dev ## Alias for dev

restart: ## Restart all services
	@echo '${YELLOW}Restarting all services...${NC}'
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart
	@echo '${GREEN}✓ All services restarted${NC}'

rebuild: dev-build ## Alias for dev-build

shell-api: ## Open shell in backend container
	@echo '${GREEN}Opening backend container shell...${NC}'
	docker exec -it referloop_api sh

shell-db: db-shell ## Alias for db-shell

pgweb: ## Open pgweb in browser
	@echo '${GREEN}Opening pgweb...${NC}'
	@command -v open >/dev/null 2>&1 && open http://localhost:8081 || \
	 command -v xdg-open >/dev/null 2>&1 && xdg-open http://localhost:8081 || \
	 echo 'Please open http://localhost:8081 in your browser'

open: ## Open all development UIs in browser
	@echo '${GREEN}Opening development UIs...${NC}'
	@command -v open >/dev/null 2>&1 && ( \
		open http://localhost:3000 && \
		open http://localhost:8025 && \
		open http://localhost:8081 \
	) || command -v xdg-open >/dev/null 2>&1 && ( \
		xdg-open http://localhost:3000 && \
		xdg-open http://localhost:8025 && \
		xdg-open http://localhost:8081 \
	) || echo 'Please open these URLs in your browser:\n  http://localhost:3000\n  http://localhost:8025\n  http://localhost:8081'
