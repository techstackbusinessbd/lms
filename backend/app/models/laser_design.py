"""
লেজার ডিজাইন ভল্ট ও রেসিপি ওআরএম মডেল (Laser Design Vault ORM Models)
Denim Laser Automation & Control System (Denim LACS)

Jeanologia eMark (.jean এবং .jean5) ফাইল ম্যানেজমেন্ট, সাইজ ম্যাপিং ও
রেসিপি লকিং (Recipe Lock) পরিচালনার ওআরএম মডেল।
রুল ০৩ (UUIDv7), রুল ০২ (DB Schema) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
"""

import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class LaserDesign(BaseModel):
    """
    লেজার ডিজাইন মাস্টার মডেল (Laser Design Master Record)
    একটি অর্ডারের নির্দিষ্ট স্টাইলের জন্য প্রস্তুতকৃত লেজার রেসিপি।
    লক (Recipe Lock) স্ট্যাটাসে পৌঁছালে ফাইল শপ-ফ্লোরের জন্য প্রস্তুত হিসেবে গণ্য হয়।
    """
    __tablename__ = "laser_designs"

    # সংশ্লিষ্ট অর্ডারের সাথে ফরেন কি রিলেশন
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="সম্পর্কিত অর্ডারের প্রাইমারি কি (UUIDv7)",
    )

    # স্টাইল কোড (দ্রুততম কুয়েরির জন্য ডিনর্মালাইজড ইনডেক্স)
    style_code: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
        doc="বায়ার স্টাইল কোড (e.g. 511 Slim Fit)",
    )

    # রেসিপি নাম ও রিভিশন ভার্সন
    recipe_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        doc="রেসিপির বাণিজ্যিক নাম (e.g. Vintage Whisker Wash v1)",
    )
    version: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
        doc="ডিজাইন রিভিশন নম্বর (1, 2, 3...)",
    )

    # স্ট্যাটাস ও রেসিপি লক (Recipe Lock Gate)
    status: Mapped[str] = mapped_column(
        String(30),
        default="DRAFT",
        nullable=False,
        index=True,
        doc="ডিজাইন স্ট্যাটাস: DRAFT, LOCKED, ACTIVE, DEPRECATED",
    )
    is_locked: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        doc="শপ-ফ্লোর প্যারামিটার লক নিশ্চিতকরণ ফ্ল্যাগ",
    )
    locked_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        doc="রেসিপি লক করার টাইমস্ট্যাম্প",
    )
    locked_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        doc="যে ডিজাইনার/হেড ইঞ্জিনিয়ার রেসিপি লক করেছেন",
    )

    # অতিরিক্ত নোটস
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="ডিজাইনারের অতিরিক্ত প্রোডাকশন বা ওয়াশ নোটস",
    )

    # ওআরএম রিলেশনশিপসমূহ
    order = relationship("Order", backref="laser_designs", lazy="joined")
    locked_by_user = relationship("User", foreign_keys=[locked_by], lazy="select")
    files: Mapped[List["LaserDesignFile"]] = relationship(
        "LaserDesignFile",
        back_populates="design",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        Index("idx_laser_designs_order_status", "order_id", "status"),
        Index("idx_laser_designs_style_ver", "style_code", "version"),
    )

    def __repr__(self) -> str:
        return (
            f"<LaserDesign(id={self.id}, style='{self.style_code}', "
            f"ver={self.version}, status='{self.status}')>"
        )


class LaserDesignFile(BaseModel):
    """
    লেজার ডিজাইন ফাইল স্পেসিফিকেশন মডেল (Laser Design File Specification)
    নির্দিষ্ট সাইজ (Size) ও প্লেসমেন্ট (FRONT, BACK, PANEL)-এর জন্য .jean5 ফাইলের মেটাডেটা।
    ইমিউটেবিলিটি নিশ্চিতে SHA-256 ফাইল হ্যাশ সংরক্ষণ করা হয়।
    """
    __tablename__ = "laser_design_files"

    design_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("laser_designs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="প্যারেন্ট লেজার ডিজাইনের প্রাইমারি কি (UUIDv7)",
    )

    # সাইজ কোড (e.g. 28, 30, 32, 34, 36, 38, ALL)
    size_code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
        doc="নির্দিষ্ট সাইজ কোড (e.g. 32)",
    )

    # প্লেসমেন্ট / বডি পার্ট (Two-Step Front/Back অথবা Cut Panel)
    placement: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        index=True,
        doc="বডি প্লেসমেন্ট: FRONT, BACK, PANEL",
    )

    # ফাইল ফরম্যাট (.jean বা .jean5)
    file_format: Mapped[str] = mapped_column(
        String(20),
        default="JEAN5",
        nullable=False,
        doc="Jeanologia নেটিভ ফাইল ফরম্যাট (JEAN5 / JEAN)",
    )

    # ফাইলের আসল নাম ও রিলেটিভ স্টোরেজ পাথ
    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="আপলোডকৃত মূল ফাইল নেইম (e.g. 511_Front_Sz32.jean5)",
    )
    file_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
        doc="ভল্ট স্টোরেজ রুটের ভেতর আপেক্ষিক ফাইল পাথ",
    )

    # ফাইলের আকার ও ক্রিপ্টোগ্রাফিক অপরিবর্তনযোগ্যতা হ্যাশ (SHA-256)
    file_size_bytes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        doc="বাইটে ফাইলের মোট সাইজ",
    )
    file_hash_sha256: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True,
        doc="ফাইলের ক্রিপ্টোগ্রাফিক SHA-256 হ্যাশ (ইমিউটেবিলিটি গার্ড)",
    )

    # অপশনাল লেজার এক্সিকিউশন প্যারামিটার
    power_percentage: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        doc="লক করা সর্বোচ্চ লেজার পাওয়ার লিমিট (%)",
    )
    speed_percentage: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        doc="লক করা সর্বোচ্চ লেজার স্পিড লিমিট (%)",
    )
    cycle_time_estimate_sec: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        doc="আনুমানিক লেজার সাইকেল টাইম (সেকেন্ডে)",
    )

    # ওআরএম রিলেশনশিপ
    design: Mapped["LaserDesign"] = relationship("LaserDesign", back_populates="files")

    __table_args__ = (
        # একই ডিজাইনে একই সাইজ ও প্লেসমেন্টের ডুপ্লিকেট রোধে ইউনিক কনস্ট্রেইন্ট
        UniqueConstraint(
            "design_id",
            "size_code",
            "placement",
            "is_deleted",
            name="uq_design_size_placement",
        ),
        Index("idx_design_files_lookup", "design_id", "size_code", "placement"),
    )

    def __repr__(self) -> str:
        return (
            f"<LaserDesignFile(id={self.id}, size='{self.size_code}', "
            f"placement='{self.placement}', hash='{self.file_hash_sha256[:8]}...')>"
        )
