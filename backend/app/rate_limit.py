# rate_limit.py — Shared slowapi Limiter instance
#
# Importing from a single module ensures the same Limiter instance is used
# across main.py and all routers.
#
# Usage in a router:
#   from fastapi import Request
#   from .rate_limit import limiter
#
#   @router.post("/login")
#   @limiter.limit("10/minute")
#   async def login(request: Request, ...):
#       ...

from slowapi import Limiter
from slowapi.util import get_remote_address

# IP-based in-memory rate limiter; default 200 req/min applies to every endpoint
# unless a stricter @limiter.limit("N/period") decorator is added.
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])
