# database.py — Database connection and session setup using SQLAlchemy + MySQL

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ── Database URL resolution ───────────────────────────────────────────────────
# Priority:
#   1. DATABASE_URL from .env (uses MySQL for production)
#   2. Falls back to SQLite (fleet.db in the backend folder) for local dev —
#      SQLite requires zero installation and works out of the box.
_DB_FILE = os.path.join(os.path.dirname(__file__), "..", "fleet.db")
_DEFAULT_URL = f"sqlite:///{os.path.abspath(_DB_FILE)}"

DATABASE_URL = os.getenv("DATABASE_URL", _DEFAULT_URL)

IS_SQLITE = DATABASE_URL.startswith("sqlite")

# Create the SQLAlchemy engine
# SQLite needs check_same_thread=False for multi-threaded FastAPI usage
_connect_args = {"check_same_thread": False} if IS_SQLITE else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=_connect_args,
    pool_pre_ping=not IS_SQLITE,       # Not needed / unsupported for SQLite
    pool_recycle=3600 if not IS_SQLITE else -1,
)

# Session factory — each request gets its own database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class is now defined in models.py using DeclarativeBase
# Import it from there: from .models import Base


def get_db():
    """
    Dependency function for FastAPI routes.
    Yields a database session and ensures it is closed after the request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
