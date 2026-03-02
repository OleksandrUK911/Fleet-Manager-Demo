# routers/auth.py — Authentication endpoints

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel
from passlib.context import CryptContext

from ..auth import create_access_token
from ..rate_limit import limiter

router = APIRouter(tags=["Auth"])

# ─── Password hashing ─────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ─── Demo users ───────────────────────────────────────────────────────────────
# In production: load from database with properly stored bcrypt hashes.
# Passwords are hashed at startup so they never sit in plain-text memory.
_DEMO_USERS: dict = {}


def _init_users() -> None:
    global _DEMO_USERS
    _DEMO_USERS = {
        "admin": {
            "username":     "admin",
            "hashed_password": pwd_context.hash("fleet2024"),
            "role":         "admin",
            "display_name": "Fleet Admin",
        },
        "viewer": {
            "username":     "viewer",
            "hashed_password": pwd_context.hash("viewer123"),
            "role":         "viewer",
            "display_name": "Fleet Viewer",
        },
    }


_init_users()

# Pre-computed dummy hash for constant-time response when username is unknown,
# preventing username-enumeration via response-time differences.
_DUMMY_HASH: str = pwd_context.hash("__dummy__")


# ─── Schemas ──────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str
    username:     str
    role:         str
    display_name: str


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post(
    "/auth/login",
    response_model=TokenResponse,
    summary="Obtain a JWT access token",
    description=(
        "Exchange username + password for a 24-hour JWT access token.  "
        "**Demo credentials:** `admin / fleet2024` or `viewer / viewer123`."
    ),
)
@limiter.limit("10/minute")   # brute-force protection: max 10 login attempts / IP / minute
def login(request: Request, body: LoginRequest):
    user = _DEMO_USERS.get(body.username.lower())
    # Always run bcrypt — even for unknown usernames — to prevent response-time
    # differences from revealing whether an account exists (username enumeration).
    check_hash = user["hashed_password"] if user else _DUMMY_HASH
    valid_password = pwd_context.verify(body.password, check_hash)
    if not user or not valid_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    token = create_access_token(
        {"sub": user["username"], "role": user["role"]}
    )
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        username=user["username"],
        role=user["role"],
        display_name=user["display_name"],
    )


@router.get(
    "/auth/me",
    summary="Return current user info from token",
)
def me_endpoint():
    """
    Placeholder — the frontend reads user info directly from the JWT payload.
    Include Depends(get_current_user) here if you want a server-side /me route.
    """
    return {"detail": "Use the decoded JWT payload on the frontend."}
