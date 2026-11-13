"""
লেজার ডিজাইন ও রেসিপি ভল্ট Pydantic v2 স্কিমা (Laser Design Vault DTOs)
Denim Laser Automation & Control System (Denim LACS)

Jeanologia eMark (.jean এবং .jean5) রেসিপি ফাইল আপলোড,
সাইজ ম্যাপিং ও রেসিপি লক (Recipe Lock) এর জন্য কঠোর সার্ভার-সাইড ভ্যালিডেশন স্কিমা।
রুল ২৩ (Pydantic v2), রুল ০৪ (<300 Lines) এবং রুল ১১ (Bangla Comments) মেনে প্রস্তুতকৃত।
"""

import uuid
from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class LaserDesignFileBase(BaseModel):
    """
    লেজার ডিজাইন ফাইল কোর ফিল্ডস (Size & Placement Mapping)
    """
    model_config = ConfigDict(str_strip_whitespace=True)

    size_code: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="নির্দিষ্ট সাইজ কোড (Size Code)",
        examples=["32", "30", "ALL"],
    )
    placement: Literal["FRONT", "BACK", "PANEL"] = Field(
        ...,
        description="বডি পার্ট প্লেসমেন্ট: FRONT, BACK অথবা কাটিং পার্ট PANEL",
        examples=["FRONT"],
    )
    power_percentage: Optional[float] = Field(
        None,
        ge=0.0,
        le=100.0,
        description="লক করা সর্বোচ্চ লেজার পাওয়ার লিমিট (%)",
        examples=[85.0],
    )
    speed_percentage: Optional[float] = Field(
        None,
        ge=0.0,
        le=100.0,
        description="লক করা সর্বোচ্চ লেজার স্পিড লিমিট (%)",
        examples=[90.0],
    )
    cycle_time_estimate_sec: Optional[float] = Field(
        None,
        ge=0.0,
        le=3600.0,
        description="আনুমানিক লেজার সাইকেল টাইম (সেকেন্ডে)",
        examples=[45.0],
    )


class LaserDesignFileResponse(LaserDesignFileBase):
    """
    লেজার ডিজাইন ফাইল রেসপন্স মডেল (File Metadata with SHA-256 Hash)
    """
    id: uuid.UUID
    design_id: uuid.UUID
    file_format: str = Field(..., description="ফাইল ফরম্যাট (JEAN5 / JEAN)")
    original_filename: str = Field(..., description="মূল আপলোডকৃত ফাইলের নাম")
    file_path: str = Field(..., description="ভল্ট স্টোরেজ রিলেটিভ পাথ")
    file_size_bytes: int = Field(..., description="ফাইলের আকার (বাইটে)")
    file_hash_sha256: str = Field(..., description="SHA-256 ক্রিপ্টোগ্রাফিক হ্যাশ")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LaserDesignBase(BaseModel):
    """
    লেজার ডিজাইন মাস্টার রেকর্ড কোর ফিল্ডস
    """
    model_config = ConfigDict(str_strip_whitespace=True)

    order_id: uuid.UUID = Field(
        ...,
        description="সম্পর্কিত অর্ডারের প্রাইমারি কি (UUIDv7)",
    )
    recipe_name: str = Field(
        ...,
        min_length=2,
        max_length=150,
        description="রেসিপির নাম বা টাইটেল (Recipe Name)",
        examples=["511 Slim Whisker & Scraping v1"],
    )
    style_code: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="বায়ার স্টাইল কোড (Style Code)",
        examples=["511 Slim Fit"],
    )
    notes: Optional[str] = Field(
        None,
        max_length=1000,
        description="ডিজাইনার বা টেকনিশিয়ানের অতিরিক্ত মন্তব্য",
    )


class LaserDesignCreate(LaserDesignBase):
    """
    নতুন লেজার ডিজাইন রেসিপি ড্রাফট তৈরির রিকোয়েস্ট পে-লোড
    """
    pass


class LaserDesignUpdate(BaseModel):
    """
    বিদ্যমান ডিজাইন রেসিপি ড্রাফট সংশোধনের রিকোয়েস্ট পে-লোড (লক হওয়ার পূর্বে)
    """
    model_config = ConfigDict(str_strip_whitespace=True)

    recipe_name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=150,
        description="সংশোধিত রেসিপি নাম",
    )
    notes: Optional[str] = Field(
        None,
        max_length=1000,
        description="সংশোধিত মন্তব্য",
    )


class RecipeLockRequest(BaseModel):
    """
    রেসিপি লক করার অনুমোদন পে-লোড (Recipe Lock Sign-off)
    """
    model_config = ConfigDict(str_strip_whitespace=True)

    confirm_lock: bool = Field(
        True,
        description="লক করার চূড়ান্ত সম্মতি ফ্ল্যাগ",
    )
    lock_notes: Optional[str] = Field(
        None,
        max_length=500,
        description="লক করার সময় হেড ইঞ্জিনিয়ারের অনুমোদন নোট",
        examples=["Approved for 20 Flat Conveyor Tables production"],
    )


class RecipeUnlockRequest(BaseModel):
    """
    রেসিপি আনলক করার রিকোয়েস্ট পে-লোড (Recipe Unlock Request)
    """
    model_config = ConfigDict(str_strip_whitespace=True)

    confirm_unlock: bool = Field(
        True,
        description="আনলক করার সম্মতি ফ্ল্যাগ",
    )
    unlock_notes: Optional[str] = Field(
        None,
        max_length=500,
        description="আনলক করার কারণ বা নোট (যেমন: ফ্লোরে অপারেটর প্যারামিটার অ্যাডজাস্টমেন্ট)",
        examples=["Unlocked for operator laser parameter tuning on wash floor"],
    )


class LaserDesignFileParameterUpdate(BaseModel):
    """
    লেজার ফাইলের প্যারামিটার আপডেটের জন্য কঠোর সার্ভার-সাইড স্কিমা (Rule 23)
    """
    model_config = ConfigDict(str_strip_whitespace=True)

    power_percentage: Optional[float] = Field(
        None,
        ge=0.0,
        le=100.0,
        description="লেজার পাওয়ার লিমিট (%)",
        examples=[85.0],
    )
    speed_percentage: Optional[float] = Field(
        None,
        ge=0.0,
        le=100.0,
        description="লেজার স্পিড লিমিট (%)",
        examples=[90.0],
    )
    cycle_time_estimate_sec: Optional[float] = Field(
        None,
        ge=0.0,
        le=3600.0,
        description="আনুমানিক লেজার সাইকেল টাইম (সেকেন্ডে)",
        examples=[42.0],
    )


class LaserDesignResponse(BaseModel):
    """
    লেজার ডিজাইন সম্পূর্ণ রেসপন্স মডেল (সংযুক্ত সকল সাইজ ফাইলসহ)
    """
    id: uuid.UUID
    order_id: uuid.UUID
    style_code: str
    recipe_name: str
    version: int
    status: str = Field(..., description="স্ট্যাটাস: DRAFT, LOCKED, ACTIVE, DEPRECATED")
    is_locked: bool
    locked_at: Optional[datetime] = None
    locked_by: Optional[uuid.UUID] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    files: List[LaserDesignFileResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class LaserDesignListResponse(BaseModel):
    """
    পেজিনেটেড লেজার ডিজাইন তালিকা রেসপন্স
    """
    items: List[LaserDesignResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)

