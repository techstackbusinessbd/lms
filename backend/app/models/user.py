"""
ইউজার ও ভূমিকা-ভিত্তিক এক্সেস কন্ট্রোল ডেটাবেজ মডেল (User & RBAC Models)
Denim Laser Automation & Control System (Denim LACS)

এই মডিউলে সিস্টেমের ইউজার, রোল, পারমিশন এবং ভূমিকা ম্যাপিংয়ের ওআরএম মডেল সংজ্ঞায়িত করা হয়েছে।
সকল মডেল RFC 9562 UUIDv7 এবং অডিট ট্রেইল (created_at, updated_at, is_deleted) নিশ্চিত করে।
"""

import uuid
from typing import List, Optional
from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Index,
    String,
    Table,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BaseModel


# রোল ও পারমিশনের মেনি-টু-মেনি অ্যাসোসিয়েশন টেবিল
role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column(
        "role_id",
        UUID(as_uuid=True),
        ForeignKey("roles.id", ondelete="CASCADE"),
        primary_key=True,
        doc="রোলের ইউনিক আইডি",
    ),
    Column(
        "permission_id",
        UUID(as_uuid=True),
        ForeignKey("permissions.id", ondelete="CASCADE"),
        primary_key=True,
        doc="পারমিশনের ইউনিক আইডি",
    ),
)


class Role(BaseModel):
    """
    ব্যবহারকারীর সিস্টেম ভূমিকা (System Role)।
    যেমন: SUPER_ADMIN_CTO, MERCHANDISER, LASER_DESIGNER, LASER_OPERATOR, QC_INSPECTOR।
    """
    __tablename__ = "roles"

    # রোলের ইউনিক সিস্টেম কোড (uppercase)
    name: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
        doc="রোলের অনন্য সিস্টেম নাম (e.g., SUPER_ADMIN_CTO)",
    )

    # ইউজার ইন্টারফেসে প্রদর্শনের নাম
    display_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        doc="ইউআইতে প্রদর্শনের জন্য রোলের নাম",
    )

    # রোলের দায়িত্বের বিবরণ
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="রোলের দায়িত্ব ও অনুমতির বিস্তারিত বিবরণ",
    )

    # রিলেশনশিপ
    users: Mapped[List["User"]] = relationship(
        "User",
        back_populates="role",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="selectin",
    )
    permissions: Mapped[List["Permission"]] = relationship(
        "Permission",
        secondary=role_permissions,
        back_populates="roles",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Role(id={self.id}, name='{self.name}', display_name='{self.display_name}')>"


class Permission(BaseModel):
    """
    সিস্টেমের সূক্ষ্ম কার্যক্ষমতা পারমিশন (Granular System Permission)।
    যেমন: orders:create, designs:upload, laser:execute, qc:audit ইত্যাদি।
    """
    __tablename__ = "permissions"

    # পারমিশনের ইউনিক অ্যাকশন কোড
    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
        doc="পারমিশনের অনন্য অ্যাকশন কোড (e.g., orders:create)",
    )

    # ইউজার ইন্টারফেসে প্রদর্শনের নাম
    display_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        doc="পারমিশনের মানব-পাঠযোগ্য নাম",
    )

    # মডিউল নাম (orders, designs, production, qc, settings)
    module: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
        doc="সংশ্লিষ্ট সিস্টেম মডিউল",
    )

    # বিবরণ
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="পারমিশনের কার্যকারিতার বিবরণ",
    )

    # রিলেশনশিপ
    roles: Mapped[List[Role]] = relationship(
        "Role",
        secondary=role_permissions,
        back_populates="permissions",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Permission(id={self.id}, name='{self.name}', module='{self.module}')>"


class User(BaseModel):
    """
    ফ্যাক্টরি ও সিস্টেম ব্যবহারকারী (System User)।
    অফিস ইউজার এবং ফ্লোর অপারেটর সকলের তথ্য ধারণ করে।
    """
    __tablename__ = "users"

    # লগইন ইউজারনেম
    username: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
        doc="ব্যবহারকারীর অনন্য লগইন ইউজারনেম",
    )

    # প্রাতিষ্ঠানিক ইমেইল
    email: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
        doc="ব্যবহারকারীর প্রাতিষ্ঠানিক ইমেইল ঠিকানা",
    )

    # Argon2id দ্বারা হ্যাশকৃত পাসওয়ার্ড
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Argon2id ক্রিপ্টোগ্রাফিক হ্যাশকৃত পাসওয়ার্ড",
    )

    # শপ-ফ্লোরে টাচ স্ক্রিনে দ্রুত লগইনের জন্য হ্যাশকৃত ৪/৬ ডিজিট পিন
    quick_pin_hash: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        index=True,
        doc="ফ্লোর টাচ স্ক্রিনের জন্য হ্যাশকৃত Quick-PIN",
    )

    # ব্যবহারকারীর পূর্ণ নাম
    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        doc="ব্যবহারকারীর পূর্ণ নাম",
    )

    # এমপ্লয়ি ব্যাজ আইডি বা RFID কার্ড নাম্বার
    employee_badge_id: Mapped[Optional[str]] = mapped_column(
        String(50),
        unique=True,
        nullable=True,
        index=True,
        doc="ফ্যাক্টরি এমপ্লয়ি আরএফআইডি বা ব্যাজ নম্বর",
    )

    # রোলের ফরেন কি (Foreign Key)
    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("roles.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        doc="ইউজারের নির্দিষ্ট ভূমিকার আইডি",
    )

    # সক্রিয় অ্যাকাউন্ট স্ট্যাটাস
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        index=True,
        doc="অ্যাকাউন্ট সক্রিয় কি না নির্দেশক ফ্ল্যাগ",
    )

    # রিলেশনশিপ
    role: Mapped[Role] = relationship("Role", back_populates="users", lazy="joined")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, username='{self.username}', full_name='{self.full_name}')>"
