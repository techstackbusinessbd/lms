"""
অর্ডার ম্যানেজমেন্ট Pydantic v2 স্কিমা (Order Management DTOs - Garments Enterprise Spec)
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

রুল ২৩ মেনে ক্লায়েন্টের সমস্ত ইনপুট কঠোরভাবে সার্ভার-সাইডে ভ্যালিডেট করা হয়।
রুল ০৪ মেনে মডুলার কোড এবং রুল ১১ মেনে প্রমিত বাংলা ডকস্ট্রিং।
"""

import uuid
from datetime import date, datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class OrderBase(BaseModel):
    """
    গার্মেন্টস ডোমেইনের মূল অর্ডার ফিল্ডসমূহ।
    ১০টি নির্দিষ্ট তথ্যের ভিত্তিতে ভ্যালিডেশন নিশ্চিত করে।
    """
    model_config = ConfigDict(str_strip_whitespace=True)

    company: str = Field(
        default="Denim Solutions Ltd.",
        min_length=2,
        max_length=150,
        description="কোম্পানি বা কারখানা ইউনিট (Company)",
        examples=["Denim Solutions Ltd. (Unit 1)"],
    )
    buyer_name: str = Field(
        ...,
        min_length=2,
        max_length=150,
        description="বায়ারের নাম বা কোড (Buyer)",
        examples=["Levi Strauss & Co."],
    )
    style_code: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="পোশাকের প্রধান স্টাইল কোড বা নম্বর (Style)",
        examples=["511 Slim Fit"],
    )
    job_no: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="ফ্যাক্টরি ইন্টারনাল জব ট্র্যাকিং নম্বর (Job No.)",
        examples=["JOB-2026-0042"],
    )
    brand: Optional[str] = Field(
        default=None,
        max_length=100,
        description="বায়ারের ব্র্যান্ড বা সাব-ব্র্যান্ড (Brand)",
        examples=["Signature Denim"],
    )
    season: Optional[str] = Field(
        default=None,
        max_length=50,
        description="প্রোডাকশন সিজন (Season)",
        examples=["Spring/Summer 2026"],
    )
    total_quantity: int = Field(
        ...,
        gt=0,
        le=10_000_000,
        description="মোট অর্ডারের সংখ্যা (Order Qty)",
        examples=[5000],
    )
    uom: str = Field(
        default="PCS",
        min_length=1,
        max_length=20,
        description="পরিমাপের একক (UOM - e.g. PCS, DZN, SET)",
        examples=["PCS"],
    )
    target_delivery_date: date = Field(
        ...,
        description="টার্গেট শিপমেন্ট ডেলিভারি তারিখ (Ship Date - YYYY-MM-DD)",
        examples=["2026-12-25"],
    )
    dealing_merchant: Optional[str] = Field(
        default=None,
        max_length=100,
        description="দায়িত্বপ্রাপ্ত ডিলিং মার্চেন্টের নাম (Dealing Merchant)",
        examples=["Tanvir Ahmed"],
    )

    # সহকারী সাপোর্ট ফিল্ড
    po_number: Optional[str] = Field(
        default="",
        max_length=100,
        description="বায়ারের পারচেজ অর্ডার নম্বর (PO Number)",
        examples=["PO-884920"],
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
    wash_reference: Optional[str] = Field(
        default=None,
        max_length=150,
        description="লেজার ও ওয়াশ রেফারেন্স কোড",
        examples=["Dark Vintage Whisker (W-104)"],
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
    """নতুন অর্ডার তৈরির রিকোয়েস্ট DTO"""
    pass


class OrderUpdate(BaseModel):
    """
    বিদ্যমান অর্ডার সংশোধনের DTO (Partial/Full Update)।
    সংশোধনের পর স্বয়ংক্রিয়ভাবে current_revision বৃদ্ধি পায়।
    """
    model_config = ConfigDict(str_strip_whitespace=True)

    company: Optional[str] = Field(None, min_length=2, max_length=150)
    buyer_name: Optional[str] = Field(None, min_length=2, max_length=150)
    style_code: Optional[str] = Field(None, min_length=2, max_length=100)
    job_no: Optional[str] = Field(None, min_length=2, max_length=100)
    brand: Optional[str] = Field(None, max_length=100)
    season: Optional[str] = Field(None, max_length=50)
    total_quantity: Optional[int] = Field(None, gt=0, le=10_000_000)
    uom: Optional[str] = Field(None, min_length=1, max_length=20)
    target_delivery_date: Optional[date] = None
    dealing_merchant: Optional[str] = Field(None, max_length=100)
    po_number: Optional[str] = Field(None, max_length=100)
    style_name: Optional[str] = Field(None, max_length=150)
    fabric_description: Optional[str] = Field(None, max_length=255)
    wash_reference: Optional[str] = Field(None, max_length=150)
    priority: Optional[Literal["NORMAL", "HIGH", "URGENT"]] = None
    notes: Optional[str] = Field(None, max_length=1000)


class OrderStatusUpdate(BaseModel):
    """অর্ডারের স্ট্যাটাস বা লাইফসাইকেল পরিবর্তনের DTO"""
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
