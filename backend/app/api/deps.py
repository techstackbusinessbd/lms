"""
ফাস্টএপিআই ডিপেন্ডেন্সি ইনজেকশন মডিউল (FastAPI Dependencies Injection)
Denim Laser Automation & Control System (Denim LACS)

এই মডিউলটি সুরক্ষিত এন্ডপয়েন্টগুলোতে বর্তমান লগইনকৃত ইউজার যাচাই,
সক্রিয়তা চেক এবং ভূমিকা/পারমিশন এক্সেস কন্ট্রোল পরিচালনা করে।
"""

import uuid
from typing import Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User

# OAuth2 বিয়ারার স্কিমা
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False,
)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    অনুরোধের বিয়ারার টোকেন ডিকোড করে বর্তমান ব্যবহারকারীকে রিটার্ন করে।
    টোকেন অবৈধ বা অনুপস্থিত হলে HTTP 401 Unauthorized ত্রুটি ছুড়ে দেয়।
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials: Token is invalid or expired",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token: Missing subject claim",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_uuid = uuid.UUID(user_id_str)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token: Invalid user UUID",
            headers={"WWW-Authenticate": "Bearer"},
        )

    stmt = select(User).where(User.id == user_uuid, User.is_deleted.is_(False))
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or has been deactivated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    বর্তমান ইউজার সক্রিয় (Active) কি না যাচাই করে।
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )
    return current_user


def require_permission(permission_code: str) -> Callable:
    """
    নির্দিষ্ট সূক্ষ্ম পারমিশন (Granular Permission) চেক করার ডিপেন্ডেন্সি গার্ড।
    ব্যবহারকারীর রোলে পারমিশন না থাকলে HTTP 403 Forbidden রিটার্ন করে।
    """
    async def permission_checker(
        current_user: User = Depends(get_current_active_user),
    ) -> User:
        # সুপার অ্যাডমিনকে স্বয়ংক্রিয়ভাবে সকল পারমিশন প্রদান
        if current_user.role.name == "SUPER_ADMIN_CTO":
            return current_user

        user_perms = [p.name for p in current_user.role.permissions if not p.is_deleted]
        if permission_code not in user_perms:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: You do not have '{permission_code}' permission",
            )
        return current_user

    return permission_checker

