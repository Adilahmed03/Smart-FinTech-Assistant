"""Authentication routes – register, login, logout, me."""

import uuid
from fastapi import APIRouter, Request, Response, HTTPException
from pydantic import BaseModel, EmailStr

from core.redis_client import get_redis
from core.config import settings
from models.user import create_user, get_user_by_email, get_user_by_id, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

SESSION_TTL = 30 * 60  # 30 minutes in seconds
SESSION_PREFIX = "session:"
COOKIE_NAME = "session_token"


# ── Request / Response schemas ──────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str


# ── Helpers ─────────────────────────────────────────────────────────────────

async def _create_session(user_id: str, response: Response) -> str:
    """Create a session in Redis and set the cookie."""
    token = uuid.uuid4().hex
    redis = await get_redis()
    await redis.setex(f"{SESSION_PREFIX}{token}", SESSION_TTL, user_id)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        max_age=SESSION_TTL,
        secure=False,  # set True in production behind HTTPS
    )
    return token


# ── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/register", response_model=UserResponse)
async def register(body: RegisterRequest, response: Response):
    """Register a new user and start a session."""
    user = create_user(body.email, body.password)
    if user is None:
        raise HTTPException(status_code=409, detail="Email already registered")

    await _create_session(user.id, response)
    return UserResponse(id=user.id, email=user.email)


@router.post("/login", response_model=UserResponse)
async def login(body: LoginRequest, response: Response):
    """Authenticate and start a session."""
    user = get_user_by_email(body.email)
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await _create_session(user.id, response)
    return UserResponse(id=user.id, email=user.email)


@router.post("/logout")
async def logout(request: Request, response: Response):
    """Destroy the current session."""
    token = request.cookies.get(COOKIE_NAME)
    if token:
        redis = await get_redis()
        await redis.delete(f"{SESSION_PREFIX}{token}")
    response.delete_cookie(COOKIE_NAME)
    return {"detail": "Logged out"}


@router.get("/me", response_model=UserResponse)
async def me(request: Request):
    """Return the currently authenticated user."""
    user = getattr(request.state, "user", None)
    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return UserResponse(id=user.id, email=user.email)
