## Summary
<!-- What does this PR do? One sentence. -->

## Related Issue
<!-- Closes #<issue-number>  |  No related issue -->
Closes #

## Type of Change
- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change (requires migration steps)
- [ ] Refactor / cleanup
- [ ] Documentation update
- [ ] CI / DevOps change

## Changes Made
<!-- List the files/components changed and what was done. -->
-
-
-

## Test Plan
- [ ] `python -m pytest backend/tests/ -v --tb=short` → all 62 tests pass
- [ ] `cd website && npm run build` → builds without errors or warnings
- [ ] `cd frontend && npm run build` → builds without errors
- [ ] New functionality manually verified locally

## Checklist
- [ ] No secrets, credentials, or `.env` files committed
- [ ] New API endpoints covered by at least one pytest test
- [ ] `alembic revision --autogenerate` run for any model/schema changes
- [ ] CSS/JS changes checked at 375 px, 768 px, and 1280 px widths
- [ ] `prefers-reduced-motion` respected for any new animations
- [ ] Relevant documentation / TODO files updated

## Screenshots (if UI change)
<!-- Before / After screenshots or a short screen recording. -->
