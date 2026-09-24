"""JWT authentication and password hashing."""

import secrets
from datetime import datetime, timedelta, timezone
from uuid import UUID

import bcrypt
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.core.config import get_settings
from app.core.database import get_db

settings = get_settings()
bearer_scheme = HTTPBearer()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": str(user_id), "exp": expire}, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": str(user_id), "exp": expire}, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
):
    from app.models.user import User

    payload = decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


GUEST_EMAIL = "guest@flowcast.local"


async def get_guest_user(db: AsyncSession):
    """Return the shared guest user, creating it on first use.

    The app has no login: endpoints that need a user_id attach their rows
    to this single auto-created account instead. No migration required.
    """
    from app.models.user import User

    result = await db.execute(select(User).where(User.email == GUEST_EMAIL))
    user = result.scalar_one_or_none()
    if user:
        return user

    # The hash is a random, unusable placeholder — the users.password_hash
    # column is NOT NULL and no login endpoint exists to verify against.
    user = User(email=GUEST_EMAIL, password_hash=hash_password(secrets.token_urlsafe(32)))
    db.add(user)
    try:
        await db.flush()
    except IntegrityError:
        # A concurrent request created the guest first — roll back the losing
        # insert and re-read the winner.
        await db.rollback()
        result = await db.execute(select(User).where(User.email == GUEST_EMAIL))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=500, detail="Guest user unavailable")
    return user
