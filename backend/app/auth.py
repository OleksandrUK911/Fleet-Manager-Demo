# auth.py — JWT token creation and verification utilities

import os
from datetime import datetime, timedelta, timezone
from secrets import compare_digest
from typing import Optional

from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# ─── Config ───────────────────────────────────────────────────────────────────
# Override JWT_SECRET_KEY via environment variable in production!
SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "fleet-manager-dev-secret-key-change-this-in-production-2024",
)
ALGORITHM               = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# HTTPBearer scheme — reads "Authorization: Bearer <token>" from request headers
_bearer = HTTPBearer(auto_error=True)


# ─── Token factory ────────────────────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Encode *data* into a signed JWT.
    Default expiry is ACCESS_TOKEN_EXPIRE_HOURS (24 h).
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ─── Token verifier (FastAPI dependency) ──────────────────────────────────────

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> dict:
    """
    FastAPI dependency.  Decodes and validates the Bearer token.
    Returns the decoded payload dict (e.g. {"sub": "admin", "role": "admin"}).
    Raises HTTP 401 if the token is missing, expired, or invalid.

    Usage on a protected endpoint:
        @router.post("/", ...)
        def create_vehicle(..., _: dict = Depends(get_current_user)):
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("sub") is None:
            raise credentials_exception
        return payload
    except JWTError:
        raise credentials_exception


def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Like get_current_user but additionally checks for role == 'admin'.
    Uses compare_digest for constant-time string comparison to prevent
    timing-based role-oracle attacks.
    """
    role = current_user.get("role") or ""
    if not compare_digest(role, "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required",
        )
    return current_user
