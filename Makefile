SHELL := /bin/sh

.DEFAULT_GOAL := help

FRONTEND_DIR := apps/frontend
BACKEND_DIR := apps/backend
DOCKER_COMPOSE := docker compose
PROD_ENV_FILE := .env.production
PROD_COMPOSE_FILE := docker-compose.prod.yml

.PHONY: help dev install install-frontend install-backend setup backend-init \
	frontend-dev backend-dev build lint test pint migrate seed artisan \
	docker-build docker-up docker-down docker-logs docker-ps docker-restart \
	docker-artisan prod-up prod-down

help: ## Show available commands
	@awk 'BEGIN {FS = ":.*## "}; /^[a-zA-Z0-9_.-]+:.*## / {printf "  %-16s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: docker-up ## Start the local stack with Docker

install: install-frontend install-backend ## Install all project dependencies

install-frontend: ## Install frontend dependencies
	cd $(FRONTEND_DIR) && npm install

install-backend: ## Install backend dependencies
	cd $(BACKEND_DIR) && composer install

setup: install backend-init ## Install deps and prepare backend locally

backend-init: ## Create backend .env, app key and run migrations if needed
	cd $(BACKEND_DIR) && if [ ! -f .env ]; then cp .env.example .env; fi
	cd $(BACKEND_DIR) && if ! grep -q '^APP_KEY=base64:' .env; then php artisan key:generate; fi
	cd $(BACKEND_DIR) && php artisan migrate

frontend-dev: ## Run frontend locally
	cd $(FRONTEND_DIR) && npm run dev

backend-dev: ## Run backend locally
	cd $(BACKEND_DIR) && php artisan serve

build: ## Build frontend assets
	cd $(FRONTEND_DIR) && npm run build

lint: ## Run frontend lint
	cd $(FRONTEND_DIR) && npm run lint

test: ## Run backend test suite
	cd $(BACKEND_DIR) && php artisan test

pint: ## Run Laravel Pint formatter
	cd $(BACKEND_DIR) && ./vendor/bin/pint

migrate: ## Run backend migrations
	cd $(BACKEND_DIR) && php artisan migrate

seed: ## Run backend seeders
	cd $(BACKEND_DIR) && php artisan db:seed

artisan: ## Run artisan command: make artisan cmd="route:list"
	cd $(BACKEND_DIR) && php artisan $(cmd)

docker-build: ## Build docker services
	$(DOCKER_COMPOSE) build

docker-up: ## Start local docker stack
	$(DOCKER_COMPOSE) up -d --build

docker-down: ## Stop local docker stack
	$(DOCKER_COMPOSE) down

docker-logs: ## Show docker compose logs
	$(DOCKER_COMPOSE) logs -f

docker-ps: ## Show docker compose services
	$(DOCKER_COMPOSE) ps

docker-restart: ## Restart docker services
	$(DOCKER_COMPOSE) restart

docker-artisan: ## Run artisan in backend container: make docker-artisan cmd="route:list"
	$(DOCKER_COMPOSE) exec backend php artisan $(cmd)

prod-up: ## Start production docker stack
	$(DOCKER_COMPOSE) --env-file $(PROD_ENV_FILE) -f $(PROD_COMPOSE_FILE) up -d --build

prod-down: ## Stop production docker stack
	$(DOCKER_COMPOSE) --env-file $(PROD_ENV_FILE) -f $(PROD_COMPOSE_FILE) down
