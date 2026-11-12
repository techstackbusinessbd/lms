"""
অথেনটিকেশন ও এক্সেস কন্ট্রোল Pydantic v2 স্কিমা (Authentication DTOs)
Denim Laser Automation & Control System (Denim LACS)

রুল ২৩ মেনে সমস্ত ক্লায়েন্ট ইনপুট কঠোরভাবে সার্ভার-সাইডে Pydantic v2 দ্বারা ভ্যালিডেট করা হয়।
"""

import uuid
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class LoginRequest(BaseModel):
    """
    অফিস ইউজার লগইন রিকোয়েস্ট (Merchandiser, Designer, Admin)।
    ইউজারনেম বা প্রাতিষ্ঠানিক ইমেইল ও পাসওয়ার্ড গ্রহণ করে।
    """
    model_config = ConfigDict(str_strip_whitespace=True)

    username_or_email: str = Field(
        ...,
        min_length=3,
        max_length=100,
        description="লগইন ইউজারনেম অথবা প্রাতিষ্ঠানিক ইমেইল ঠিকানা",
        examples=["tanvir.merch", "designer01@denimfactory.com"],
    )
    password: str = Field(
        ...,
        min_length=6,
        max_length=100,
        description="ব্যবহারকারীর গোপন পাসওয়ার্ড",
    )


class QuickPinLoginRequest(BaseModel):
    """
    শপ-ফ্লোর অপারেটরদের দ্রুত টাচ-স্ক্রিন লগইন রিকোয়েস্ট।
    ৪ থেকে ৬ সংখ্যার পিন ও ঐচ্ছিক আরএফআইডি ব্যাজ আইডি বা ইউজারনেম গ্রহণ করে।
    """
    model_config = ConfigDict(str_strip_whitespace=True)

    pin: str = Field(
        ...,
        pattern=r"^\d{4,6}$",
        description="৪ থেকে ৬ সংখ্যার নিউমেরিক Quick-PIN",
        examples=["123456", "7890"],
    )
    badge_id_or_username: Optional[str] = Field(
        default=None,
        max_length=50,
        description="এমপ্লয়ি ব্যাজ/আরএফআইডি আইডি বা ইউজারনেম (নির্দিষ্ট ব্যবহারকারী চিহ্নিত করতে)",
        examples=["BADGE-9021", "operator.m01"],
    )


class RoleSummaryResponse(BaseModel):
    """
    ইউজারের ভূমিকার সংক্ষিপ্ত রেসপন্স DTO।
    """
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(..., description="রোলের ইউনিক UUIDv7")
    name: str = Field(..., description="রোলের সিস্টেম কোড (e.g., LASER_OPERATOR)")
    display_name: str = Field(..., description="রোলের মানব-পাঠযোগ্য নাম")


class UserSummaryResponse(BaseModel):
    """
    অথেনটিকেটেড ব্যবহারকারীর প্রোফাইল রেসপন্স DTO।
    """
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(..., description="ইউজারের ইউনিক UUIDv7")
    username: str = Field(..., description="ইউজারনেম")
    email: str = Field(..., description="প্রাতিষ্ঠানিক ইমেইল")
    full_name: str = Field(..., description="ব্যবহারকারীর পূর্ণ নাম")
    employee_badge_id: Optional[str] = Field(default=None, description="আরএফআইডি ব্যাজ আইডি")
    role: RoleSummaryResponse = Field(..., description="ব্যবহারকারীর অ্যাসাইনকৃত রোল")
    permissions: List[str] = Field(default_factory=list, description="ব্যবহারকারীর অনুমোদিত পারমিশন তালিকা")


class TokenResponse(BaseModel):
    """
    লগইন সফল হলে ক্লায়েন্টকে ফেরত পাঠানো JWT এক্সেস টোকেন পে-লোড।
    """
    access_token: str = Field(..., description="ক্রিপ্টোগ্রাফিক্যালি সাইনড JWT Access Token")
    token_type: str = Field(default="bearer", description="টোকেন টাইপ (ডিফল্ট: bearer)")
    expires_in: int = Field(..., description="টোকেন মেয়াদোত্তীর্ণ হওয়ার সময় (সেকেন্ডে)")
    user: UserSummaryResponse = Field(..., description="লগইনকৃত ইউজারের সংক্ষিপ্ত তথ্য")

