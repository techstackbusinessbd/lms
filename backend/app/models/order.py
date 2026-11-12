"""
অর্ডার ম্যানেজমেন্ট ডেটাবেজ মডেল (Order Management Model - Total Qty Based)
Denim Laser Automation & Control System (Denim LACS)

এই মডিউলটি বায়ারের পারচেজ অর্ডার (PO), স্টাইল, ওয়াশ রেফারেন্স এবং মোট কোয়ান্টিটি
সংরক্ষণের জন্য PostgreSQL 16 ওআরএম মডেল সংজ্ঞায়িত করে।
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
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Order(BaseModel):
    """
    মাস্টার অর্ডার টেবিল (Master Orders Table)।
    বায়ার অর্ডার, পিও নম্বর, স্টাইল কোড, ফেব্রিক ডিটেইলস এবং মোট কোয়ান্টিটি ধারণ করে।
    সিটিও স্যারের পর্যায়ভিত্তিক আর্কিটেকচার অনুযায়ী প্রাথমিক পর্যায়ে সরাসরি total_quantity
    দিয়ে সম্পূর্ণ লেজার প্রোডাকশন ট্র্যাকিং পরিচালিত হবে।
    """
    __tablename__ = "orders"

    # বায়ারের নাম (যেমন: Levi Strauss, H&M, Zara, American Eagle)
    buyer_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True,
        doc="বায়ারের নাম বা ব্র্যান্ড কোড",
    )

    # পারচেজ অর্ডার নম্বর (পো / PO Number)
    po_number: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
        doc="বায়ারের অনন্য পারচেজ অর্ডার নম্বর (PO)",
    )

    # স্টাইল কোড (Style Code)
    style_code: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
        doc="পোশাকের প্রধান স্টাইল কোড বা নম্বর",
    )

    # স্টাইলের নাম বা অতিরিক্ত বিবরণ
    style_name: Mapped[Optional[str]] = mapped_column(
        String(150),
        nullable=True,
        doc="স্টাইলের বাণিজ্যিক বা প্রদর্শনী নাম",
    )

    # ফেব্রিক কম্পোজিশন ও কনস্ট্রাকশন
    fabric_description: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        doc="ফেব্রিকের বিবরণ ও ওজন (e.g., 12.5 Oz Denim, 98% C 2% Sp)",
    )

    # ওয়াশ রেফারেন্স ও কালার শেড
    wash_reference: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        doc="লেজার ও ওয়াশ রেফারেন্স কোড (e.g., Dark Vintage Whisker W-104)",
    )

    # মোট অর্ডারের পিস সংখ্যা (Total Order Quantity)
    total_quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        doc="সম্পূর্ণ অর্ডারের মোট পিস সংখ্যা (অবশ্যই ধনাত্মক পূর্ণসংখ্যা)",
    )

    # টার্গেট ডেলিভারি ডেট (Shipment / Ex-Factory Date)
    target_delivery_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        doc="ফ্যাক্টরি থেকে ডেলিভারির নির্ধারিত শেষ তারিখ",
    )

    # অর্ডারের অগ্রাধিকার স্তর (NORMAL, HIGH, URGENT)
    priority: Mapped[str] = mapped_column(
        String(20),
        default="NORMAL",
        server_default="NORMAL",
        nullable=False,
        doc="অর্ডারের প্রসেসিং প্রায়োরিটি (NORMAL, HIGH, URGENT)",
    )

    # অর্ডারের বর্তমান অবস্থা (Order Lifecycle State)
    # PENDING_DESIGN, DESIGN_APPROVED, IN_PRODUCTION, COMPLETED, CANCELLED
    status: Mapped[str] = mapped_column(
        String(30),
        default="PENDING_DESIGN",
        server_default="PENDING_DESIGN",
        nullable=False,
        index=True,
        doc="অর্ডারের লাইফসাইকেল স্ট্যাটাস",
    )

    # রিভিশন ট্র্যাকিং নম্বর (যদি বায়ার পরবর্তীতে কোয়ান্টিটি সংশোধন করে)
    current_revision: Mapped[int] = mapped_column(
        Integer,
        default=1,
        server_default="1",
        nullable=False,
        doc="অর্ডার রিভিশন নম্বর (প্রাথমিক মান: ১)",
    )

    # অতিরিক্ত নোট বা বিশেষ নির্দেশনা
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="মার্চেন্ডাইজার বা প্রোডাকশন টিমের বিশেষ নির্দেশনা",
    )

    # অর্ডার সৃষ্টিকারী ইউজারের ফরেন কি
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        doc="যে ইউজার অর্ডারটি তৈরি করেছেন তার আইডি",
    )

    # রিলেশনশিপ: ক্রিয়েটর ইউজার অবজেক্ট
    creator = relationship(
        "User",
        foreign_keys=[created_by],
        lazy="selectin",
    )

    # টেবিল লেভেল কনস্ট্রেইন্টস ও ইনডেক্সিং
    __table_args__ = (
        # একই PO নম্বর এবং স্টাইল কোড ডুপ্লিকেট হওয়া সম্পূর্ণ নিষিদ্ধ
        UniqueConstraint("po_number", "style_code", name="uq_po_style"),
        # মোট কোয়ান্টিটি অবশ্যই শূন্যের চেয়ে বড় হতে হবে
        CheckConstraint("total_quantity > 0", name="chk_orders_total_quantity_positive"),
        # পারফরম্যান্স অপ্টিমাইজেশন ইনডেক্স
        Index("idx_orders_po_number", "po_number"),
        Index("idx_orders_buyer", "buyer_name"),
        Index("idx_orders_status", "status"),
    )

    def __repr__(self) -> str:
        return (
            f"<Order(id={self.id}, po='{self.po_number}', "
            f"style='{self.style_code}', total_qty={self.total_quantity}, "
            f"status='{self.status}')>"
        )

