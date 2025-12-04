.PHONY: setup dev dev-worker dev-all test test-watch test-coverage lint typecheck clean deploy deploy-redirect docker-up docker-down docker-logs docker-build db-migrate-local db-migrate-prod

# Variables
NPM := npm
WRANGLER := npx wrangler

# ============================================
# Setup
# ============================================
setup:
	$(NPM) install
	@if [ ! -f .dev.vars ]; then cp .dev.vars.example .dev.vars; echo "Created .dev.vars from template"; fi

# ============================================
# Development
# ============================================
dev:
	$(NPM) run dev

dev-worker:
	$(NPM) run dev:worker

dev-all:
	$(NPM) run dev:all

# ============================================
# Testing
# ============================================
test:
	$(NPM) run test

test-watch:
	$(NPM) run test:watch

test-coverage:
	$(NPM) run test:coverage

# ============================================
# Code Quality
# ============================================
lint:
	$(NPM) run lint

typecheck:
	$(NPM) run typecheck

# ============================================
# Docker
# ============================================
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

docker-build:
	docker-compose build --no-cache

docker-restart:
	docker-compose down && docker-compose up -d

# ============================================
# Database (D1)
# ============================================
db-migrate-local:
	$(WRANGLER) d1 migrations apply snip-db --local

db-migrate-prod:
	$(WRANGLER) d1 migrations apply snip-db --remote

db-studio:
	$(WRANGLER) d1 studio snip-db --local

# ============================================
# Deployment
# ============================================
deploy:
	$(NPM) run deploy

deploy-redirect:
	$(NPM) run deploy:redirect

deploy-all: deploy deploy-redirect

# ============================================
# Clean
# ============================================
clean:
	rm -rf node_modules dist .wrangler

# ============================================
# Help
# ============================================
help:
	@echo "Available targets:"
	@echo "  setup           - Install dependencies and create .dev.vars"
	@echo "  dev             - Start Vite dev server"
	@echo "  dev-worker      - Start Wrangler dev server"
	@echo "  dev-all         - Start both Vite and Wrangler"
	@echo "  test            - Run tests"
	@echo "  test-watch      - Run tests in watch mode"
	@echo "  test-coverage   - Run tests with coverage"
	@echo "  lint            - Run ESLint"
	@echo "  typecheck       - Run TypeScript type check"
	@echo "  docker-up       - Start Docker containers"
	@echo "  docker-down     - Stop Docker containers"
	@echo "  docker-logs     - View Docker logs"
	@echo "  db-migrate-local - Apply D1 migrations locally"
	@echo "  db-migrate-prod  - Apply D1 migrations to production"
	@echo "  deploy          - Deploy API worker"
	@echo "  deploy-redirect - Deploy redirect worker"
	@echo "  deploy-all      - Deploy all workers"
	@echo "  clean           - Remove build artifacts"
