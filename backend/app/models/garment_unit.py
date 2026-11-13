"""
গার্মেন্ট ইউনিট ও কিউআর ট্র্যাকিং ওআরএম মডেল (Garment Unit & QR Tracking Model)
Denim Laser Automation & Control System (Denim LACS)

প্রতিটি একক প্যান্টের জন্য ইউনিক সিরিয়াল, কিউআর কোড পে-লোড, সাইজ ম্যাপিং ও
উৎপাদন লাইফসাইকেল ট্র্যাকিং ওআরএম মডেল।
রুল ০৩ (UUIDv7), রুল ০২ (DB Schema) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
"""

import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class GarmentUnit(BaseModel):
    """
    গার্মেন্ট ইউনিট মাস্টার মডেল (Individual Garment Piece Record)
    কাটিং ও সুইং সেকশনে প্রতিটি প্যান্টের জন্য তৈরি ইউনিক কিউআর কোড ও লাইফসাইকেল ট্র্যাক করে।
    """
    __tablename__ = "garment_units"

    # সংশ্লিষ্ট অর্ডারের সাথে ফরেন কি রিলেশন
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="সম্পর্কিত অর্ডারের প্রাইমারি কি (UUIDv7)",
    )

    # হিউম্যান-রিডেবল ইউনিক সিরিয়াল কোড (স্টিকারে দৃশ্যমান, যেমন: 2008-32-0001)
    unit_serial_no: Mapped[str] = mapped_column(
        String(80),
        unique=True,
        nullable=False,
        index=True,
        doc="প্রতিটি প্যান্টের অনন্য সিরিয়াল নম্বর (e.g., 2008-32-00001)",
    )

    # অপ্টিমাইজড কিউআর কোড পে-লোড (ক্যামেরা স্ক্যানারের দ্রুত পঠন উপযোগী)
    qr_code_payload: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
        doc="স্ক্যানার দ্বারা রিডযোগ্য এনকোডেড কিউআর স্ট্রিং",
    )

    # বায়ার স্টাইল কোড (ডিনর্মালাইজড - সাব-৫০ms কোয়েরির জন্য)
    style_code: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
        doc="বায়ার স্টাইল কোড (e.g. 2008 / 511-SLIM)",
    )

    # প্যান্টের সাইজ (e.g. 28, 30, 32, 34, 36)
    size_code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
        doc="নির্দিষ্ট সাইজ কোড (e.g. 32)",
    )

    # উৎপাদনের ধরন: সম্পূর্ণ প্যান্ট (৮০-৯০% Two-Step) নাকি কাটিং পার্ট (১০-২০% Single Step)
    production_type: Mapped[str] = mapped_column(
        String(30),
        default="COMPLETE_GARMENT",
        nullable=False,
        doc="COMPLETE_GARMENT (Two-Step: Front & Back) বা CUT_PANEL (Single-Step)",
    )

    # কাটিং ও বান্ডেল ট্র্যাকিং (ঐচ্ছিক)
    cut_no: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        doc="কাটিং টেবিল নম্বর / কাটিং ব্যাচ কোড",
    )
    bundle_no: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        doc="সুইং বান্ডেল নম্বর",
    )

    # বর্তমান লাইফসাইকেল স্টেজ (Current Stage)
    # GENERATED, PRINTED, ATTACHED, RECEIVED_AT_LASER, FRONT_DONE, BACK_DONE, COMPLETED, QC_PASSED, REJECTED
    current_stage: Mapped[str] = mapped_column(
        String(35),
        default="GENERATED",
        nullable=False,
        index=True,
        doc="বর্তমান স্টেজ: GENERATED, PRINTED, ATTACHED, INTAKE, COMPLETED, QC_PASSED",
    )

    # প্রিন্ট স্টেশনের অডিট তথ্য
    printed_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        doc="যে অপারেটর থার্মাল প্রিন্টারে স্টিকার প্রিন্ট করেছেন",
    )
    printed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        doc="থার্মাল স্টিকার প্রিন্টের লাইভ সময়",
    )

    # লেজার এক্সিকিউশন ট্র্যাকিং (মেশিন ও অপারেটর)
    lasered_by_machine_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("laser_machines.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        doc="যে Jeanologia লেজার মেশিনে এক্সিকিউট করা হয়েছে (M01-M20)",
    )
    lasered_by_operator_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        doc="যে অপারেটরের শিফটে লেজার কার্যকর হয়েছে",
    )
    front_laser_completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        doc="ফ্রন্ট বডি লেজার সম্পন্ন হওয়ার সময়",
    )
    back_laser_completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        doc="ব্যাক বডি লেজার সম্পন্ন হওয়ার সময়",
    )

    # কোয়ালিটি কন্ট্রোল (QC Audit)
    qc_status: Mapped[str] = mapped_column(
        String(20),
        default="PENDING",
        nullable=False,
        index=True,
        doc="কিউসি স্ট্যাটাস: PENDING, PASSED, REWORK, REJECTED",
    )
    qc_inspected_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        doc="যে কিউসি ইন্সপেক্টর অডিট পরিচালনা করেছেন",
    )
    qc_inspected_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        doc="কিউসি অডিটের সময়",
    )

    # অতিরিক্ত নোটস বা ডিফেক্ট বিবরণ
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="অতিরিক্ত প্রোডাকশন বা কোয়ালিটি নোটস",
    )

    # ওআরএম রিলেশনশিপসমূহ
    order = relationship("Order", backref="garment_units", lazy="joined")
    printed_by_user = relationship("User", foreign_keys=[printed_by], lazy="select")
    machine = relationship("LaserMachine", foreign_keys=[lasered_by_machine_id], lazy="select")
    operator = relationship("User", foreign_keys=[lasered_by_operator_id], lazy="select")
    qc_inspector = relationship("User", foreign_keys=[qc_inspected_by], lazy="select")

    __table_args__ = (
        Index("idx_garment_units_order_size", "order_id", "size_code"),
        Index("idx_garment_units_stage", "current_stage"),
        Index("idx_garment_units_order_stage", "order_id", "current_stage"),
    )

    def __repr__(self) -> str:
        return (
            f"<GarmentUnit(id={self.id}, serial='{self.unit_serial_no}', "
            f"size='{self.size_code}', stage='{self.current_stage}')>"
        )

