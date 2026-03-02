"""env.py — Alembic migration environment for Fleet Manager

Reads DATABASE_URL from .env (via python-dotenv) so development, staging,
and production can all use the same migration files with different databases.

Usage (from backend/ directory):
    alembic upgrade head
    alembic revision --autogenerate -m "add column foo to vehicles"
    alembic downgrade -1
"""

import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from dotenv import load_dotenv
from alembic import context

# ── Make `app` importable from this env.py ────────────────────────────────────
# This file lives at backend/alembic/env.py.
# Add backend/ to sys.path so `from app.models import Base` works.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# ── Load .env before anything else ───────────────────────────────────────────
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# ── Import the ORM metadata so autogenerate can diff the schema ───────────────
from app.models import Base  # noqa: E402  (import after sys.path patch)

# ── Alembic Config object (provides access to alembic.ini values) ─────────────
config = context.config

# Override sqlalchemy.url from environment variable (takes priority over .ini)
_db_url = os.getenv("DATABASE_URL", "sqlite:///./fleet.db")
config.set_main_option("sqlalchemy.url", _db_url)

# Set up Python logging using the config in alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Provide our models' metadata so Alembic can autogenerate migrations
target_metadata = Base.metadata


# ─── Offline mode ─────────────────────────────────────────────────────────────
def run_migrations_offline() -> None:
    """Run migrations without an active DB connection (generates SQL script)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        # Render ADD COLUMN etc. for SQLite compatibility
        render_as_batch=True,
    )
    with context.begin_transaction():
        context.run_migrations()


# ─── Online mode ──────────────────────────────────────────────────────────────
def run_migrations_online() -> None:
    """Run migrations against a live database connection."""
    # For SQLite, use NullPool to avoid multi-threaded issues
    _url = config.get_main_option("sqlalchemy.url")
    _pool_class = pool.NullPool if _url.startswith("sqlite") else pool.NullPool

    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=_pool_class,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            # render_as_batch=True is required for SQLite ALTER TABLE support
            render_as_batch=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
