# Makefile for Payment Microservice

.PHONY: help install build start dev test lint format clean docker-build docker-run docker-up docker-down

# Default target
help: ## Show this help message
	@echo "Payment Microservice - Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

# Development
install: ## Install dependencies
	npm install

build: ## Build the application
	npm run build

start: ## Start production server
	npm run start:prod

dev: ## Start development server with hot reload
	npm run start:dev

test: ## Run unit tests
	npm run test

test-e2e: ## Run end-to-end tests
	npm run test:e2e

test-cov: ## Run tests with coverage
	npm run test:cov

lint: ## Run linter
	npm run lint

format: ## Format code with Prettier
	npm run format

clean: ## Clean build artifacts
	rm -rf dist node_modules

# Docker
docker-build: ## Build Docker image
	npm run docker:build

docker-run: ## Run Docker container
	npm run docker:run

docker-up: ## Start with docker-compose
	npm run docker:up

docker-up-detached: ## Start with docker-compose in background
	npm run docker:up:detached

docker-down: ## Stop docker-compose services
	npm run docker:down

docker-logs: ## Show Docker container logs
	npm run docker:logs

# Combined commands
setup: install ## Install dependencies and setup project
	@echo "Project setup complete!"

all: clean install build test ## Clean, install, build and test