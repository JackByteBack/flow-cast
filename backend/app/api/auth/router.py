"""Auth endpoints: register, login, me."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, get_current_user
from app.core.response import success_response
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(email=body.email, password_hash=hash_password(body.password), role=body.role)
    db.add(user)
    await db.flush()

    return success_response(
        data=TokenResponse(
            access_token=create_access_token(user.id),
            refresh_token=create_refresh_token(user.id),
        ).model_dump(),
        message="Registration successful",
    )


@router.post("/login")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return success_response(
        data=TokenResponse(
            access_token=create_access_token(user.id),
            refresh_token=create_refresh_token(user.id),
        ).model_dump(),
    )


@router.get("/me")
async def me(user: User = Depends(get_current_user)):
    return success_response(data=UserResponse.model_validate(user).model_dump())
