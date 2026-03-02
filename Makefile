# Makefile — Fleet Manager Demo
# Usage: make <target>
# Requires: GNU Make, Python ≥ 3.11, Node.js ≥ 18
#
# On Windows use Git Bash or WSL:  bash -c "make <target>"
# On macOS/Linux:                  make <target>

.DEFAULT_GOAL := help
.PHONY: help install install-dev dev test test-cov lint format format-check \
        build-website dev-website clean pre-commit ci-check

PYTHON    := python
PIP       := $(PYTHON) -m pip
PYTEST    := $(PYTHON) -m pytest
BLACK     := $(PYTHON) -m black
ISORT     := $(PYTHON) -m isort
FLAKE8    := $(PYTHON) -m flake8

BACKEND   := backend
WEBSITE   := website

# ── Help ──────────────────────────────────────────────────────────────────────

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Setup ─────────────────────────────────────────────────────────────────────

install: ## Install Python + Node dependencies (production)
	$(PIP) install -r $(BACKEND)/requirements.txt
	cd $(WEBSITE) && npm ci

install-dev: install ## Install all dependencies including dev tools
	$(PIP) install black isort flake8 coverage pre-commit
	pre-commit install
	@echo "✓ Pre-commit hooks installed"

# ── Tests ─────────────────────────────────────────────────────────────────────

test: ## Run the full pytest suite (62 tests)
	$(PYTEST)

test-cov: ## Run tests with coverage report
	$(PYTHON) -m coverage run -m pytest
	$(PYTHON) -m coverage report

# ── Code quality ──────────────────────────────────────────────────────────────

lint: ## Run flake8 linter on backend
	$(FLAKE8) $(BACKEND)/app $(BACKEND)/tests

format: ## Auto-format backend code with black + isort
	$(ISORT) $(BACKEND)/app $(BACKEND)/tests
	$(BLACK) $(BACKEND)/app $(BACKEND)/tests
	@echo "✓ Backend code formatted"

format-check: ## Check formatting without modifying files (CI mode)
	$(ISORT) --check-only $(BACKEND)/app $(BACKEND)/tests
	$(BLACK) --check $(BACKEND)/app $(BACKEND)/tests

# ── Website ───────────────────────────────────────────────────────────────────

build-website: ## Build the promo website (Vite production build)
	cd $(WEBSITE) && npm run build

dev-website: ## Start the promo website dev server (port 5173)
	cd $(WEBSITE) && npm run dev

# ── Local development ─────────────────────────────────────────────────────────

dev: ## Start backend + data generator (use start_local.ps1 for full stack)
	@echo "Starting FastAPI backend on :7767 ..."
	cd $(BACKEND) && uvicorn app.main:app --host 0.0.0.0 --port 7767 --reload

# ── CI / Pre-commit ───────────────────────────────────────────────────────────

pre-commit: ## Run all pre-commit hooks against every file
	pre-commit run --all-files

ci-check: format-check lint test build-website ## Full CI pipeline locally

# ── Cleanup ───────────────────────────────────────────────────────────────────

clean: ## Remove build artefacts, caches, and temp files
	find . -type d -name __pycache__ -not -path "./.venv/*" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .ruff_cache  -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc"      -not -path "./.venv/*" -delete 2>/dev/null || true
	rm -rf $(WEBSITE)/dist
	@echo "✓ Cleaned"
