"""
বেস ওআরএম মডেল ও RFC 9562 UUIDv7 ইঞ্জিন (Base ORM Model & UUIDv7 Generator)
Denim Laser Automation & Control System (Denim LACS)

এই মডিউলটি সমস্ত ডেটাবেজ টেবিলের প্যারেন্ট ক্লাস হিসেবে কাজ করে।
রুল ০৩ মেনে সমস্ত টেবিলে টাইম-সর্টেড UUIDv7 প্রাইমারি কি এবং অডিট ট্রেইল নিশ্চিত করে।
"""

import os
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict
from sqlalchemy import Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def generate_uuid7() -> uuid.UUID:
    """
    RFC 9562 স্ট্যান্ডার্ড অনুসারী UUIDv7 জেনারেটর।
    মিলিসেকেন্ড টাইমস্ট্যাম্প (৪৮ বিট) ভিত্তিক টাইম-সর্টেড ১২৮-বিট ইউনিক আইডি তৈরি করে,
    যা PostgreSQL 16 বি-ট্রি (B-Tree) ইনডেক্সে ফ্র্যাগমেন্টেশন সম্পূর্ণ দূর করে।
    """
    nanoseconds = time.time_ns()
    milliseconds = nanoseconds // 1_000_000

    # ক্রিপ্টোগ্রাফিক র‍্যান্ডম ১৬ বাইট
    random_bytes = bytearray(os.urandom(16))

    # প্রথম ৪৮ বিটে টাইমস্ট্যাম্প সেট করা (Big-endian Order)
    random_bytes[0] = (milliseconds >> 40) & 0xFF
    random_bytes[1] = (milliseconds >> 32) & 0xFF
    random_bytes[2] = (milliseconds >> 24) & 0xFF
    random_bytes[3] = (milliseconds >> 16) & 0xFF
    random_bytes[4] = (milliseconds >> 8) & 0xFF
    random_bytes[5] = milliseconds & 0xFF

    # বাইট ৬: ৪-বিট ভার্সন ৭ (0b0111) এবং ৪-বিট র‍্যান্ডম ডাটা
    random_bytes[6] = 0x70 | (random_bytes[6] & 0x0F)

    # বাইট ৮: ২-বিট ভ্যারিয়েন্ট (0b10) এবং ৬-বিট র‍্যান্ডম ডাটা
    random_bytes[8] = 0x80 | (random_bytes[8] & 0x3F)

    return uuid.UUID(bytes=bytes(random_bytes))


class Base(DeclarativeBase):
    """
    SQLAlchemy 2.0 ডিক্ল্যারেটিভ বেস ক্লাস।
    সমস্ত ওআরএম মডেল এর থেকে ইনহেরিট করবে।
    """
    pass


class BaseModel(Base):
    """
    সিস্টেমের সমস্ত ডেটাবেজ টেবিলের অ্যাবস্ট্রাক্ট প্যারেন্ট মডেল।
    প্রতিটি টেবিলে টাইম-সর্টেড UUIDv7 প্রাইমারি কি এবং টাইমস্ট্যাম্প অডিট ট্রেইল প্রদান করে।
    """
    __abstract__ = True

    # টাইম-সর্টেড প্রাইমারি কি (UUIDv7)
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=generate_uuid7,
        index=True,
        doc="RFC 9562 টাইম-সর্টেড ইউনিক প্রাইমারি আইডি",
    )

    # অডিট ট্রেইল: তৈরি ও সর্বশেষ আপডেটের সময়
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
        doc="রেকর্ড তৈরির ইউটিসি টাইমস্ট্যাম্প",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
        doc="সর্বশেষ পরিবর্তনের ইউটিসি টাইমস্ট্যাম্প",
    )

    # সফট ডিলিট ফ্ল্যাগ (ডেটা কখনোই ফিজিক্যালি মুছে ফেলা হয় না)
    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
        doc="সফট ডিলিট স্ট্যাটাস ফ্ল্যাগ",
    )

    def to_dict(self) -> Dict[str, Any]:
        """
        মডেলের কলামগুলোকে সহজে ডিকশনারিতে রূপান্তরের ইউটিলিটি মেথড।
        লগিং ও ডিবাগিংয়ে সহায়ক।
        """
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }

