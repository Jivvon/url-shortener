.PHONY: setup dev test clean deploy

# Variables
NPM := npm
WRANGLER := npx wrangler

# Setup
setup:
	$(NPM) install

# Development
dev:
	$(NPM) run dev

# Testing
test:
	$(NPM) run test

# Docker
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

# Database
db-migrate-local:
	$(WRANGLER) d1 migrations apply snip-db --local

db-migrate-prod:
	$(WRANGLER) d1 migrations apply snip-db --remote

# Deployment
deploy:
	$(NPM) run deploy
