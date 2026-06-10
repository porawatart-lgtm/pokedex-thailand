# ============================================================
# Pokedex Thailand - Makefile
# ============================================================

.PHONY: help install dev build start db-setup db-seed db-import db-studio docker-dev docker-prod clean

# Default target
help:
	@echo "Pokedex Thailand - Available Commands:"
	@echo ""
	@echo "  make install        Install dependencies"
	@echo "  make dev            Start development server"
	@echo "  make build          Build for production"
	@echo "  make start          Start production server"
	@echo ""
	@echo "  make db-setup       Setup database (push schema)"
	@echo "  make db-migrate     Run migrations"
	@echo "  make db-seed        Seed basic data"
	@echo "  make db-import      Import all Pokemon from PokéAPI"
	@echo "  make db-import-gen  Import specific gen (GEN=1)"
	@echo "  make db-studio      Open Prisma Studio"
	@echo ""
	@echo "  make docker-dev     Start with Docker (dev)"
	@echo "  make docker-prod    Start with Docker (production)"
	@echo "  make docker-stop    Stop Docker containers"
	@echo ""
	@echo "  make clean          Clean build artifacts"
	@echo "  make lint           Run linter"
	@echo "  make type-check     Run TypeScript check"
	@echo "  make test           Run tests"

install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

# Database commands
db-setup:
	npx prisma generate
	npx prisma db push

db-migrate:
	npx prisma migrate dev

db-migrate-prod:
	npx prisma migrate deploy

db-seed:
	npx tsx prisma/seed.ts

db-import:
	npx tsx scripts/import-pokemon.ts

db-import-gen:
	npx tsx scripts/import-pokemon.ts --gen=$(GEN)

db-studio:
	npx prisma studio

# Docker commands
docker-dev:
	docker compose --profile dev up -d
	@echo "Services started!"
	@echo "  App:   http://localhost:3000"
	@echo "  Redis: http://localhost:8001"
	@echo "  DB:    localhost:5432"

docker-prod:
	docker compose --profile production up -d --build

docker-stop:
	docker compose down

docker-logs:
	docker compose logs -f

# Code quality
lint:
	npm run lint

type-check:
	npm run type-check

test:
	npm run test

format:
	npm run format

# Full setup
setup: install db-setup db-seed
	@echo "✅ Setup complete! Run 'make dev' to start."
	@echo "📌 Don't forget to:"
	@echo "   1. Copy .env.example to .env and fill in values"
	@echo "   2. Run 'make db-import' to fetch Pokemon data"

# Cleanup
clean:
	rm -rf .next out dist node_modules/.cache

reset:
	rm -rf .next out dist
	npx prisma migrate reset --force
