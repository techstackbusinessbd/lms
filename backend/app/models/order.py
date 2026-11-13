"""
অর্ডার ম্যানেজমেন্ট ডেটাবেজ মডেল (Order Management Model - Garments Enterprise Spec)
Denim Laser Automation & Control System (Denim LACS)

সিটিও স্যারের স্পেসিফিকেশন অনুসারী ১০টি কোর ফিল্ড:
1. Company (ফ্যাক্টরি ইউনিট)
2. Buyer (বায়ার)
3. Style (পোশাকের স্টাইল কোড)
4. Job No. (ফ্যাক্টরি ইন্টারনাল জব নম্বর)
5. Brand (ব্র্যান্ড বা সাব-ব্র্যান্ড)
6. Season (প্রোডাকশন সিজন)
7. Order Qty (মোট অর্ডারের পিস সংখ্যা)
8. UOM (পরিমাপের একক - PCS, DZN)
9. Ship Date (টার্গেট শিপমেন্ট ডেলিভারি তারিখ)
10. Dealing Merchant (দায়িত্বপ্রাপ্ত মার্চেন্ট)

রুল ০২, ০৩ ও ০৪ মেনে টাইম-সর্টেড UUIDv7 ও অডিট ট্রেইল সহ ১০০% মডুলার কোড।
"""

import uuid
from datetime import date
from typing import Optional
from sqlalchemy import (
    CheckConstraint,
    Date,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Order(BaseModel):
    """
    মাস্টার অর্ডার টেবিল (Master Orders Table)।
    গার্মেন্টস ডোমেইনের পূর্ণাঙ্গ পারচেজ ও প্রোডাকশন অর্ডার ডাটা ধারণ করে।
    """
    __tablename__ = "orders"

    # ১. কোম্পানি / ফ্যাক্টরি ইউনিট (Company)
    company: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        default="Denim Solutions Ltd.",
        server_default="Denim Solutions Ltd.",
        index=True,
        doc="কোম্পানি বা ম্যানুফ্যাকচারিং ইউনিট",
    )

    # ২. বায়ারের নাম (Buyer)
    buyer_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True,
        doc="বায়ারের নাম বা কোড (e.g., Levi Strauss, H&M)",
    )

    # ৩. স্টাইল নম্বর বা কোড (Style)
    style_code: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
        doc="পোশাকের প্রধান স্টাইল কোড বা নম্বর (e.g., 511 Slim Fit)",
    )

    # ৪. ফ্যাক্টরি জব নম্বর (Job No.)
    job_no: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="",
        server_default="",
        index=True,
        doc="ফ্যাক্টরি ইন্টারনাল জব ট্র্যাকিং নম্বর (e.g., JOB-2026-0042)",
    )

    # ৫. ব্র্যান্ড বা সাব-ব্র্যান্ড (Brand)
    brand: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        doc="বায়ারের ব্র্যান্ড বা সাব-ব্র্যান্ড (e.g., Signature, Denim Lab)",
    )

    # ৬. সিজন (Season)
    season: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        doc="প্রোডাকশন সিজন (e.g., Spring/Summer 2026, FW-2026)",
    )

    # ৭. মোট অর্ডারের সংখ্যা (Order Qty)
    total_quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        doc="সম্পূর্ণ অর্ডারের মোট সংখ্যা (Order Qty)",
    )

    # ৮. পরিমাপের একক (UOM - Unit of Measurement)
    uom: Mapped[str] = mapped_column(
        String(20),
        default="PCS",
        server_default="PCS",
        nullable=False,
        doc="পরিমাপের একক (e.g., PCS, DZN, SET)",
    )

    # ৯. শিপমেন্ট / ডেলিভারির তারিখ (Ship Date)
    target_delivery_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        doc="টার্গেট শিপমেন্ট ডেলিভারি তারিখ (Ship Date)",
    )

    # ১০. দায়িত্বপ্রাপ্ত ডিলিং মার্চেন্ট (Dealing Merchant)
    dealing_merchant: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        index=True,
        doc="দায়িত্বপ্রাপ্ত ডিলিং মার্চেন্টের নাম (Dealing Merchant)",
    )

    # সহকারী সাপোর্ট ফিল্ডসমূহ
    po_number: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="",
        server_default="",
        index=True,
        doc="বায়ারের পারচেজ অর্ডার নম্বর (PO Number)",
    )

    style_name: Mapped[Optional[str]] = mapped_column(
        String(150),
        nullable=True,
        doc="স্টাইলের অতিরিক্ত বিবরণ বা নাম",
    )

    fabric_description: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        doc="ফেব্রিকের বিবরণ ও ওজন (e.g., 12.5 Oz Denim, 98% C 2% Sp)",
    )

    wash_reference: Mapped[Optional[str]] = mapped_column(
        String(150),
        nullable=True,
        doc="লেজার ও ওয়াশ রেফারেন্স কোড (e.g., Dark Vintage Whisker W-104)",
    )

    priority: Mapped[str] = mapped_column(
        String(20),
        default="NORMAL",
        server_default="NORMAL",
        nullable=False,
        doc="অর্ডারের প্রসেসিং প্রায়োরিটি (NORMAL, HIGH, URGENT)",
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="PENDING_DESIGN",
        server_default="PENDING_DESIGN",
        nullable=False,
        index=True,
        doc="অর্ডারের লাইফসাইকেল স্ট্যাটাস",
    )

    current_revision: Mapped[int] = mapped_column(
        Integer,
        default=1,
        server_default="1",
        nullable=False,
        doc="অর্ডার রিভিশন নম্বর (প্রাথমিক মান: ১)",
    )

    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="মার্চেন্ডাইজার বা প্রোডাকশন টিমের বিশেষ নির্দেশনা",
    )

    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        doc="যে ইউজার অর্ডারটি তৈরি করেছেন তার আইডি",
    )

    creator = relationship(
        "User",
        foreign_keys=[created_by],
        lazy="selectin",
    )

    __table_args__ = (
        CheckConstraint("total_quantity > 0", name="chk_orders_total_quantity_positive"),
        Index("idx_orders_job_no", "job_no"),
        Index("idx_orders_buyer", "buyer_name"),
        Index("idx_orders_company", "company"),
        Index("idx_orders_merchant", "dealing_merchant"),
        Index("idx_orders_status", "status"),
    )

    def __repr__(self) -> str:
        return (
            f"<Order(id={self.id}, job='{self.job_no}', po='{self.po_number}', "
            f"buyer='{self.buyer_name}', style='{self.style_code}', "
            f"qty={self.total_quantity} {self.uom}, status='{self.status}')>"
        )
