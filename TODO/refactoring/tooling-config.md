# Tooling & Configuration

> Developer tooling: formatters, linters, pre-commit hooks,
> test configuration, editor settings, issue/PR templates.

---

## Planned

_(nothing pending)_

---

## In Progress

_(nothing active)_

---

## Done

### Python Tooling
- ✅ `pyproject.toml` — Black (line-length 120), isort (profile=black),
  pytest (testpaths, pythonpath, asyncio_mode=auto), coverage (source=backend/app)
- ✅ `.flake8` — max-line-length 120, extend-ignore E203/W503/W504/E201/E221,
  excludes .venv / alembic / node_modules / dist
- ✅ `pytest.ini` removed — config consolidated into `pyproject.toml`
- ✅ 74 / 74 pytest tests passing (test_auth + test_vehicles + test_geofence + test_heatmap; Sprint 30 added 12 new tests: TestSearchVehicles ×4, TestFleetDistance ×2, TestOverspeedStats ×6)

### JavaScript Tooling
- ✅ `website/.eslintrc.json` — eslint:recommended + plugin:react + plugin:react-hooks
- ✅ `website/package.json` — `lint` (with `--max-warnings 0`) and `lint:fix` scripts
- ✅ All ESLint warnings resolved in Features.jsx, Highlights.jsx, NotFound.jsx, useScrollReveal.js
- ✅ ESLint: **0 warnings** (`npm run lint --max-warnings 0`)

### Pre-commit Hooks (`.pre-commit-config.yaml`)
- ✅ `black` (line-length 120)
- ✅ `isort` (profile=black)
- ✅ `flake8`
- ✅ `pre-commit-hooks`: trailing-whitespace, end-of-file-fixer, check-yaml, check-json, mixed-line-ending=lf
- ✅ `eslint-website` local hook for `website/src/**/*.{js,jsx}`

### Editor & Project Config
- ✅ `.editorconfig` — UTF-8, LF, Python 4 spaces, JS/CSS/HTML/JSON/YAML 2 spaces

### GitHub Templates
- ✅ `.github/ISSUE_TEMPLATE/bug_report.md`
- ✅ `.github/ISSUE_TEMPLATE/feature_request.md`
- ✅ `.github/pull_request_template.md`

### Makefile
- ✅ `Makefile` — GNU Make compatible, 14 targets with `.PHONY` correctly declared
- ✅ All phantom targets removed (Sprint 25 fix)
