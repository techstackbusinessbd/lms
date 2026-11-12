"""
অথেনটিকেশন বিজনেস লজিক সার্ভিস (Authentication Business Logic Service)
Denim Laser Automation & Control System (Denim LACS)

এই মডিউলটি ব্যবহারকারীর ক্রেডেনশিয়াল যাচাই, ফ্লোর কুইক-পিন ম্যাচিং এবং
টোকেন পে-লোড বিল্ড করার বিজনেস লজিক পরিচালনা করে।
"""

from typing import List, Optional
from loguru import logger
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_access_token,
    verify_password,
    verify_quick_pin,
)
from app.models.user import User
from app.schemas.auth import (
    RoleSummaryResponse,
    TokenResponse,
    UserSummaryResponse,
)


class AuthService:
    """
    ব্যবহারকারী লগইন ও নিরাপত্তা সার্ভিস।
    """

    @staticmethod
    async def get_user_by_username_or_email(
        db: AsyncSession,
        identifier: str,
    ) -> Optional[User]:
        """
        ইউজারনেম অথবা প্রাতিষ্ঠানিক ইমেইল দিয়ে সক্রিয় ব্যবহারকারী খুঁজে বের করে।
        """
        clean_identifier = identifier.strip().lower()
        stmt = (
            select(User)
            .where(
                or_(
                    User.username.ilike(clean_identifier),
                    User.email.ilike(clean_identifier),
                ),
                User.is_deleted.is_(False),
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def authenticate_user(
        db: AsyncSession,
        username_or_email: str,
        password: str,
    ) -> Optional[User]:
        """
        ইউজারনেম/ইমেইল এবং Argon2id পাসওয়ার্ড যাচাই করে ব্যবহারকারী রিটার্ন করে।
        """
        user = await AuthService.get_user_by_username_or_email(db, username_or_email)
        if not user:
            logger.warning(f"লগইন ব্যর্থ: ইউজার '{username_or_email}' খুঁজে পাওয়া যায়নি")
            return None

        if not user.is_active:
            logger.warning(f"লগইন ব্যর্থ: ইউজার '{user.username}' নিষ্ক্রিয় (Inactive)")
            return None

        if not verify_password(password, user.hashed_password):
            logger.warning(f"লগইন ব্যর্থ: ইউজার '{user.username}'-এর পাসওয়ার্ড অমিল")
            return None

        logger.info(f"লগইন সফল: ইউজার '{user.username}' (রোল: {user.role.name})")
        return user

    @staticmethod
    async def authenticate_by_quick_pin(
        db: AsyncSession,
        pin: str,
        badge_id_or_username: Optional[str] = None,
    ) -> Optional[User]:
        """
        শপ-ফ্লোর অপারেটরের ৪-৬ ডিজিটের Quick-PIN এবং ব্যাজ আইডি যাচাই করে।
        """
        if badge_id_or_username:
            clean_badge = badge_id_or_username.strip()
            stmt = select(User).where(
                or_(
                    User.employee_badge_id.ilike(clean_badge),
                    User.username.ilike(clean_badge),
                ),
                User.is_deleted.is_(False),
                User.is_active.is_(True),
            )
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
            if not user or not user.quick_pin_hash:
                logger.warning(f"কুইক-পিন ব্যর্থ: ব্যাজ '{badge_id_or_username}' অবৈধ বা পিন সেট করা নেই")
                return None

            if verify_quick_pin(pin, user.quick_pin_hash):
                logger.info(f"কুইক-পিন সফল: ব্যাজ '{badge_id_or_username}', ইউজার '{user.username}'")
                return user
            logger.warning(f"কুইক-পিন ব্যর্থ: ব্যাজ '{badge_id_or_username}'-এর পিন অমিল")
            return None

        # ব্যাজ আইডি না দিলে যেসব সক্রিয় ইউজারের কুইক-পিন সেট আছে তাদের মধ্য থেকে পিন সার্চ
        stmt_all = select(User).where(
            User.quick_pin_hash.is_not(None),
            User.is_deleted.is_(False),
            User.is_active.is_(True),
        )
        result_all = await db.execute(stmt_all)
        candidates = result_all.scalars().all()

        matching_users = [
            u for u in candidates
            if u.quick_pin_hash and verify_quick_pin(pin, u.quick_pin_hash)
        ]

        if len(matching_users) == 1:
            matched = matching_users[0]
            logger.info(f"কুইক-পিন সফল: ইউজার '{matched.username}'")
            return matched
        elif len(matching_users) > 1:
            logger.warning("কুইক-পিন ব্যর্থ: একাধিক ব্যবহারকারীর পিন একই, ব্যাজ আইডি আবশ্যক")
            return None

        logger.warning("কুইক-পিন ব্যর্থ: কোনো সক্রিয় ব্যবহারকারীর সাথে পিন মিলেনি")
        return None

    @staticmethod
    def build_token_response(user: User) -> TokenResponse:
        """
        অথেনটিকেটেড ইউজারের জন্য JWT Access Token ও পূর্ণাঙ্গ রেসপন্স পে-লোড প্রস্তুত করে।
        """
        permission_codes: List[str] = [
            p.name for p in getattr(user.role, "permissions", [])
            if not p.is_deleted
        ]

        claims = {
            "username": user.username,
            "email": user.email,
            "role": user.role.name,
            "permissions": permission_codes,
        }

        access_token = create_access_token(
            subject=str(user.id),
            claims=claims,
        )

        user_summary = UserSummaryResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            employee_badge_id=user.employee_badge_id,
            role=RoleSummaryResponse(
                id=user.role.id,
                name=user.role.name,
                display_name=user.role.display_name,
            ),
            permissions=permission_codes,
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_summary,
        )
