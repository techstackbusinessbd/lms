"""
মাস্টার ডাটা ডেটাবেজ মডেল (Master Data Database Models)
Denim Laser Automation & Control System (Denim LACS)

গার্মেন্টস ডোমেইনের কোর মাস্টার রেফারেন্স ডাটা:
১. Company (ফ্যাক্টরি ইউনিট)
২. Buyer (বায়ার)
৩. Brand (ব্র্যান্ড / সাব-ব্র্যান্ড)
৪. Season (প্রোডাকশন সিজন)

রুল ০২ (DB Approval), রুল ০৩ (UUIDv7), রুল ০৪ (<300 Lines) ও রুল ১১ (Bangla Comments) মেনে প্রস্তুতকৃত।
"""

import uuid
from typing import List, Optional
from sqlalchemy import (
    Boolean,
    ForeignKey,
    Index,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Company(BaseModel):
    """
    কোম্পানি বা ফ্যাক্টরি ইউনিট মাস্টার টেবিল।
    e.g., Denim Solutions Ltd. Unit-1, Pacific Jeans Unit-2
    """
    __tablename__ = "companies"

    code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
        doc="ফ্যাক্টরি ইউনিট বা কোম্পানি কোড (e.g. DSL-U1)",
    )
    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        unique=True,
        index=True,
        doc="কোম্পানির পূর্ণ নাম (e.g. Denim Solutions Ltd. Unit-1)",
    )
    address: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="কোম্পানি বা কারখানার লোকেশন / ঠিকানা",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
        index=True,
        doc="সক্রিয় নাকি নিষ্ক্রিয় ইউনিট",
    )

    __table_args__ = (
        Index("ix_companies_code_active", "code", "is_active"),
    )


class Buyer(BaseModel):
    """
    গার্মেন্ট বায়ার মাস্টার টেবিল।
    e.g., Levi Strauss & Co., H&M, Zara, American Eagle
    """
    __tablename__ = "buyers"

    code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
        doc="বায়ার কোড (e.g. LEVI, HM, ZARA)",
    )
    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        unique=True,
        index=True,
        doc="বায়ারের পূর্ণ নাম (e.g. Levi Strauss & Co.)",
    )
    country: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        doc="বায়ারের দেশ (e.g. USA, Sweden, Spain)",
    )
    contact_email: Mapped[Optional[str]] = mapped_column(
        String(150),
        nullable=True,
        doc="বায়ারের অফিশিয়াল কন্টাক্ট ইমেইল",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
        index=True,
        doc="সক্রিয় বায়ার স্ট্যাটাস",
    )

    # সম্পর্কিত ব্র্যান্ড তালিকা (One-to-Many)
    brands: Mapped[List["Brand"]] = relationship(
        "Brand",
        back_populates="buyer",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        Index("ix_buyers_name_active", "name", "is_active"),
    )


class Brand(BaseModel):
    """
    বায়ার ব্র্যান্ড বা সাব-ব্র্যান্ড মাস্টার টেবিল।
    e.g., Levi's Red Tab, H&M Divided, Zara Denim Lab
    """
    __tablename__ = "brands"

    buyer_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("buyers.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
        doc="সম্পর্কিত বায়ার আইডি (যদি কোনো নির্দিষ্ট বায়ারের ব্র্যান্ড হয়)",
    )
    code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
        doc="ব্র্যান্ড কোড (e.g. RED_TAB, DIVIDED)",
    )
    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True,
        doc="ব্র্যান্ডের নাম (e.g. Levi's Red Tab)",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
        index=True,
        doc="সক্রিয় ব্র্যান্ড স্ট্যাটাস",
    )

    # বায়ার সম্পর্ক (Many-to-One)
    buyer: Mapped[Optional["Buyer"]] = relationship(
        "Buyer",
        back_populates="brands",
        lazy="joined",
    )

    __table_args__ = (
        Index("ix_brands_buyer_active", "buyer_id", "is_active"),
    )


class Season(BaseModel):
    """
    প্রোডাকশন সিজন মাস্টার টেবিল।
    e.g., Spring/Summer, Autumn/Winter, Fall, Holiday
    """
    __tablename__ = "seasons"

    code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
        doc="সিজন কোড (e.g. SS, AW, FALL, HOLIDAY)",
    )
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
        doc="সিজনের নাম (e.g. Spring/Summer, Autumn/Winter)",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
        index=True,
        doc="সক্রিয় সিজন স্ট্যাটাস",
    )

    __table_args__ = (
        Index("ix_seasons_code_active", "code", "is_active"),
    )

