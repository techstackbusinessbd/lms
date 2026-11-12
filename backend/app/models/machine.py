"""
লেজার মেশিন ও মেশিন অথেনটিকেশন ক্রেডেনশিয়াল ডেটাবেজ মডেল (Laser Machine & Edge Agent Auth)
Denim Laser Automation & Control System (Denim LACS)

এই মডিউলটি ফ্যাক্টরির ২০টি Jeanologia ফ্ল্যাট কনভেয়ার লেজার মেশিন (M01-M20)
এবং প্রতিটি মেশিনের এজ-এজেন্টের (`laser_agent.exe`) অথেনটিকেশন ও হার্টবিট তথ্য সংরক্ষণ করে।
"""

import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    String,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class LaserMachine(BaseModel):
    """
    শপ-ফ্লোরের ২০টি Jeanologia ফ্ল্যাট কনভেয়ার লেজার মেশিন (Laser Machine)।
    প্রতিটি মেশিনের স্ট্যাটিক আইপি, ইউনিক কোড এবং অ্যাক্টিভ স্ট্যাটাস ধারণ করে।
    """
    __tablename__ = "laser_machines"

    # মেশিনের অনন্য কোড (যেমন: M01, M02 ... M20)
    machine_code: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
        doc="মেশিনের অনন্য শনাক্তকারী কোড (e.g., M01)",
    )

    # মেশিনের পূর্ণ নাম / টেবিল নম্বর
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        doc="মেশিনের বিবরণমূলক নাম (e.g., Jeanologia Flat Conveyor #01)",
    )

    # লোকাল ল্যানে মেশিনের স্থির আইপি অ্যাড্রেস (IPv4 / IPv6)
    ip_address: Mapped[str] = mapped_column(
        String(45),
        unique=True,
        nullable=False,
        index=True,
        doc="মেশিনের ডেডিকেটেড লোকাল আইপি অ্যাড্রেস",
    )

    # নেটওয়ার্ক কার্ডের ম্যাক অ্যাড্রেস (ঐচ্ছিক হার্ডওয়্যার লক)
    mac_address: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        doc="মেশিন পিসির ফিজিক্যাল ম্যাক অ্যাড্রেস",
    )

    # মেশিন সক্রিয় কি না
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        index=True,
        doc="মেশিন বর্তমানে প্রোডাকশনে সক্রিয় কি না",
    )

    # রিলেশনশিপ
    credentials: Mapped[List["MachineAuthCredential"]] = relationship(
        "MachineAuthCredential",
        back_populates="machine",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<LaserMachine(code='{self.machine_code}', ip='{self.ip_address}', active={self.is_active})>"


class MachineAuthCredential(BaseModel):
    """
    লেজার মেশিনের উইন্ডোজ এজ-এজেন্টের (`laser_agent.exe`) এপিআই অথেনটিকেশন টোকেন ও সিক্রেট।
    আইপি বাইন্ডিং ও লাইভ হার্টবিট ট্র্যাকিং সাপোর্ট করে।
    """
    __tablename__ = "machine_auth_credentials"

    # মেশিনের ফরেন কি
    machine_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("laser_machines.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="লেজার মেশিনের ফরেন কি আইডি",
    )

    # এজেন্টের সিক্রেট এপিআই টোকেনের ক্রিপ্টোগ্রাফিক হ্যাশ
    api_token_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="এজ-এজেন্টের অথেনটিকেশন টোকেনের সুরক্ষিত হ্যাশ",
    )

    # অনুমোদিত আইপি অ্যাড্রেস (আইপি স্পুফিং রোধে)
    allowed_ip_address: Mapped[str] = mapped_column(
        String(45),
        nullable=False,
        doc="এজেন্ট সংযোগের জন্য অনুমোদিত লোকাল আইপি",
    )

    # সর্বশেষ লাইভ হার্টবিট পিং টাইমস্ট্যাম্প
    last_heartbeat_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        doc="এজেন্ট কর্তৃক সর্বশেষ হার্টবিট পিং পাঠানোর সময়",
    )

    # টোকেন বাতিল / রিভোকড কি না
    is_revoked: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
        doc="টোকেন বাতিল বা অকার্যকর করা হয়েছে কি না",
    )

    # রিলেশনশিপ
    machine: Mapped[LaserMachine] = relationship("LaserMachine", back_populates="credentials")

    # কম্পোজিট ইনডেক্স
    __table_args__ = (
        Index("idx_mach_auth", "machine_id", "is_revoked"),
    )

    def __repr__(self) -> str:
        return f"<MachineAuthCredential(machine_id={self.machine_id}, revoked={self.is_revoked})>"
