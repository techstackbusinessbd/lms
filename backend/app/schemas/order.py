"""
অর্ডার ম্যানেজমেন্ট Pydantic v2 স্কিমা (Order Management DTOs)
Denim Laser Automation & Control System (Denim LACS)

রুল ২৩ মেনে ক্লায়েন্টের সমস্ত ইনপুট কঠোরভাবে সার্ভার-সাইডে ভ্যালিডেট করা হয়।
রুল ০৪ মেনে মডুলার কোড এবং রুল ১১ মেনে প্রমিত বাংলা ডকস্ট্রিং।
"""

import uuid
from datetime import date, datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class OrderBase(BaseModel):
    """
    অর্ডারের মূল ফিল্ডসমূহ (Base Order Fields)।
    বায়ার, পিও, স্টাইল এবং মোট কোয়ান্টিটি ফিল্ড ধারণ করে।
    """
    model_config = ConfigDict(str_strip_whitespace=True)

    buyer_name: str = Field(
        ...,
        min_length=2,
        max_length=150,
        description="বায়ারের নাম বা ব্র্যান্ড কোড (যেমন: Levi's, H&M, Zara)",
        examples=["Levi Strauss & Co."],
    )
    po_number: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="অনন্য পারচেজ অর্ডার নম্বর (PO Number)",
        examples=["PO-884920"],
    )
    style_code: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="পোশাকের প্রধান স্টাইল কোড বা নম্বর",
        examples=["511 Slim Fit"],
    )
    style_name: Optional[str] = Field(
        default=None,
        max_length=150,
        description="স্টাইলের বাণিজ্যিক বা প্রদর্শনী নাম",
        examples=["Mens Stretch Denim Slim"],
    )
    fabric_description: Optional[str] = Field(
        default=None,
        max_length=255,
        description="ফেব্রিকের বিবরণ ও ওজন",
        examples=["12.5 Oz Denim, 98% C 2% Sp"],
    )
    wash_reference: str = Field(
        ...,
        min_length=2,
        max_length=150,
        description="লেজার ও ওয়াশ রেফারেন্স কোড",
        examples=["Dark Vintage Whisker (W-104)"],
    )
    total_quantity: int = Field(
        ...,
        gt=0,
        le=10_000_000,
        description="সম্পূর্ণ অর্ডারের মোট পিস সংখ্যা (অবশ্যই ধনাত্মক পূর্ণসংখ্যা)",
        examples=[5000],
    )
    target_delivery_date: date = Field(
        ...,
        description="ফ্যাক্টরি থেকে ডেলিভারির নির্ধারিত শেষ তারিখ (YYYY-MM-DD)",
        examples=["2026-12-25"],
    )
    priority: Literal["NORMAL", "HIGH", "URGENT"] = Field(
        default="NORMAL",
        description="অর্ডারের প্রসেসিং প্রায়োরিটি",
        examples=["NORMAL"],
    )
    notes: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="মার্চেন্ডাইজার বা প্রোডাকশন টিমের বিশেষ নির্দেশনা",
        examples=["Holiday shipment. High priority whisker alignment."],
    )


class OrderCreate(OrderBase):
    """
    নতুন অর্ডার তৈরির রিকোয়েস্ট DTO (Create Order Request)।
    """
    pass


class OrderUpdate(BaseModel):
    """
    বিদ্যমান অর্ডার সংশোধনের DTO (Partial/Full Update)।
    সংশোধনের পর স্বয়ংক্রিয়ভাবে current_revision বৃদ্ধি পায়।
    """
    model_config = ConfigDict(str_strip_whitespace=True)

    buyer_name: Optional[str] = Field(None, min_length=2, max_length=150)
    po_number: Optional[str] = Field(None, min_length=2, max_length=100)
    style_code: Optional[str] = Field(None, min_length=2, max_length=100)
    style_name: Optional[str] = Field(None, max_length=150)
    fabric_description: Optional[str] = Field(None, max_length=255)
    wash_reference: Optional[str] = Field(None, min_length=2, max_length=150)
    total_quantity: Optional[int] = Field(None, gt=0, le=10_000_000)
    target_delivery_date: Optional[date] = None
    priority: Optional[Literal["NORMAL", "HIGH", "URGENT"]] = None
    notes: Optional[str] = Field(None, max_length=1000)


class OrderStatusUpdate(BaseModel):
    """
    অর্ডারের স্ট্যাটাস বা লাইফসাইকেল পরিবর্তনের DTO।
    """
    status: Literal[
        "PENDING_DESIGN",
        "DESIGN_APPROVED",
        "IN_PRODUCTION",
        "COMPLETED",
        "CANCELLED",
    ] = Field(
        ...,
        description="অর্ডারের নতুন লাইফসাইকেল স্ট্যাটাস",
        examples=["DESIGN_APPROVED"],
    )
    notes: Optional[str] = Field(
        default=None,
        max_length=500,
        description="স্ট্যাটাস পরিবর্তনের কারণ বা মন্তব্য",
    )


class CreatorSummary(BaseModel):
    """অর্ডার সৃষ্টিকারীর সংক্ষিপ্ত তথ্য"""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    username: str
    full_name: str


class OrderResponse(OrderBase):
    """
    অর্ডারের পূর্ণাঙ্গ রেসপন্স DTO (API Response)।
    UUIDv7 এবং অডিট টাইমস্ট্যাম্প অন্তর্ভুক্ত করে।
    """
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: str
    current_revision: int
    created_by: uuid.UUID
    creator: Optional[CreatorSummary] = None
    created_at: datetime
    updated_at: datetime


class OrderListResponse(BaseModel):
    """
    পেজিনেটেড অর্ডার তালিকার রেসপন্স DTO (TanStack Table ফ্রন্টএন্ডের জন্য অপ্টিমাইজড)।
    """
    items: List[OrderResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

