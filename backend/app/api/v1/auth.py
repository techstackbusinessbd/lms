"""
অথেনটিকেশন রাউটার ও এপিআই এন্ডপয়েন্টস (Authentication API Endpoints)
Denim Laser Automation & Control System (Denim LACS)

এই রাউটারটি অফিস ইউজার লগইন, শপ-ফ্লোর Quick-PIN লগইন এবং
বর্তমান লগইনকৃত ইউজারের সেশন যাচাই করার এন্ডপয়েন্ট সরবরাহ করে।
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    QuickPinLoginRequest,
    RoleSummaryResponse,
    TokenResponse,
    UserSummaryResponse,
)
from app.services.auth_service import AuthService

router = APIRouter()


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User Password Login",
    description="অফিস ইউজারদের (Merchandiser, Designer, Admin) জন্য ইউজারনেম/ইমেইল ও পাসওয়ার্ড লগইন।",
)
async def login_with_password(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    ইউজারনেম/ইমেইল এবং পাসওয়ার্ডের মাধ্যমে লগইন করে JWT Access Token রিটার্ন করে।
    """
    user = await AuthService.authenticate_user(
        db=db,
        username_or_email=request.username_or_email,
        password=request.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return AuthService.build_token_response(user)


@router.post(
    "/quick-pin",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Floor Touch-Screen Quick-PIN Login",
    description="শপ-ফ্লোর অপারেটরদের জন্য টাচ স্ক্রিনে ৪-৬ সংখ্যার Quick-PIN দিয়ে দ্রুত লগইন।",
)
async def login_with_quick_pin(
    request: QuickPinLoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    শপ-ফ্লোরে টাচ স্ক্রিনের মাধ্যমে দ্রুত ৪-৬ ডিজিট পিন দ্বারা লগইন সম্পন্ন করে।
    """
    user = await AuthService.authenticate_by_quick_pin(
        db=db,
        pin=request.pin,
        badge_id_or_username=request.badge_id_or_username,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Quick-PIN or Badge ID",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return AuthService.build_token_response(user)


@router.get(
    "/me",
    response_model=UserSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Current User Profile & Permissions",
    description="বর্তমান লগইনকৃত ইউজারের প্রোফাইল, রোল ও অনুমোদিত পারমিশন তালিকা রিটার্ন করে।",
)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user),
) -> UserSummaryResponse:
    """
    বর্তমান বিয়ারার টোকেনের ভিত্তিতে ইউজারের প্রোফাইল ও পারমিশন রিটার্ন করে।
    """
    permission_codes = [
        p.name for p in getattr(current_user.role, "permissions", [])
        if not p.is_deleted
    ]

    return UserSummaryResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        employee_badge_id=current_user.employee_badge_id,
        role=RoleSummaryResponse(
            id=current_user.role.id,
            name=current_user.role.name,
            display_name=current_user.role.display_name,
        ),
        permissions=permission_codes,
    )

