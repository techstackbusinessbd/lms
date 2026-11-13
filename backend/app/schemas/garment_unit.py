"""
গার্মেন্ট ইউনিট ও কিউআর ট্র্যাকিং Pydantic v2 স্কিমা (Garment Unit DTOs)
Denim Laser Automation & Control System (Denim LACS)

একক প্যান্টের সিরিয়াল, কিউআর কোড জেনারেশন ও লাইফসাইকেল স্টেজ ট্র্যাকিং ডেটা মডেল।
রুল ২৩ (Pydantic v2), রুল ০৪ (<300 Lines) এবং রুল ১১ (Bangla Comments) মেনে প্রস্তুতকৃত।
"""

import uuid
from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


GarmentStage = Literal[
    "GENERATED",
    "PRINTED",
    "ATTACHED",
    "RECEIVED_AT_LASER",
    "FRONT_DONE",
    "BACK_DONE",
    "COMPLETED",
    "QC_PASSED",
    "REJECTED",
]

ProductionType = Literal["COMPLETE_GARMENT", "CUT_PANEL"]
QcStatus = Literal["PENDING", "PASSED", "REWORK", "REJECTED"]


class GarmentUnitBase(BaseModel):
    """
    গার্মেন্ট ইউনিট কোর ফিল্ডস
    """
    model_config = ConfigDict(str_strip_whitespace=True)

    order_id: uuid.UUID = Field(
        ...,
        description="সম্পর্কিত অর্ডারের প্রাইমারি কি (UUIDv7)",
    )
    style_code: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="বায়ার স্টাইল কোড (Style Code)",
        examples=["2008", "511-SLIM"],
    )
    size_code: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="নির্দিষ্ট সাইজ কোড (Size Code)",
        examples=["32", "30"],
    )
    production_type: ProductionType = Field(
        "COMPLETE_GARMENT",
        description="উৎপাদনের ধরন: COMPLETE_GARMENT (Two-Step) বা CUT_PANEL (Single-Step)",
    )
    cut_no: Optional[str] = Field(
        None,
        max_length=50,
        description="কাটিং টেবিল নম্বর / কাটিং ব্যাচ কোড",
    )
    bundle_no: Optional[str] = Field(
        None,
        max_length=50,
        description="সুইং বান্ডেল নম্বর",
    )


class GarmentUnitCreate(GarmentUnitBase):
    """
    একক গার্মেন্ট ইউনিট তৈরির রিকোয়েস্ট পে-লোড
    """
    unit_serial_no: str = Field(
        ...,
        min_length=3,
        max_length=80,
        description="হিউম্যান-রিডেবল ইউনিক সিরিয়াল নম্বর",
        examples=["2008-32-00001"],
    )
    qr_code_payload: str = Field(
        ...,
        min_length=3,
        max_length=255,
        description="স্ক্যানার দ্বারা রিডযোগ্য এনকোডেড কিউআর স্ট্রিং",
    )


class GarmentUnitBatchGenerateRequest(BaseModel):
    """
    অর্ডারের নির্দিষ্ট সাইজের জন্য বাল্ক কিউআর ও সিরিয়াল জেনারেশন রিকোয়েস্ট
    """
    model_config = ConfigDict(str_strip_whitespace=True)

    order_id: uuid.UUID = Field(
        ...,
        description="সম্পর্কিত অর্ডারের আইডি",
    )
    size_quantities: dict[str, int] = Field(
        ...,
        description="সাইজ অনুযায়ী মোট প্যান্টের সংখ্যা (e.g. {'30': 50, '32': 100})",
        examples=[{"30": 50, "32": 100, "34": 50}],
    )
    production_type: ProductionType = Field(
        "COMPLETE_GARMENT",
        description="COMPLETE_GARMENT নাকি CUT_PANEL",
    )
    cut_no: Optional[str] = Field(None, max_length=50)
    bundle_no: Optional[str] = Field(None, max_length=50)


class GarmentUnitStageUpdate(BaseModel):
    """
    গার্মেন্ট লাইফসাইকেল স্টেজ আপডেটের পে-লোড
    """
    model_config = ConfigDict(str_strip_whitespace=True)

    new_stage: GarmentStage = Field(
        ...,
        description="নতুন স্টেজ (e.g. PRINTED, ATTACHED, RECEIVED_AT_LASER)",
    )
    machine_id: Optional[uuid.UUID] = Field(
        None,
        description="যে লেজার মেশিনে প্রসেস করা হয়েছে (যদি প্রযোজ্য)",
    )
    notes: Optional[str] = Field(None, max_length=500)


class GarmentUnitResponse(GarmentUnitBase):
    """
    গার্মেন্ট ইউনিট রেসপন্স ডিটিও
    """
    id: uuid.UUID
    unit_serial_no: str
    qr_code_payload: str
    current_stage: str
    printed_by: Optional[uuid.UUID] = None
    printed_at: Optional[datetime] = None
    lasered_by_machine_id: Optional[uuid.UUID] = None
    lasered_by_operator_id: Optional[uuid.UUID] = None
    front_laser_completed_at: Optional[datetime] = None
    back_laser_completed_at: Optional[datetime] = None
    qc_status: str
    qc_inspected_by: Optional[uuid.UUID] = None
    qc_inspected_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GarmentUnitListResponse(BaseModel):
    """
    পেজিনেটেড গার্মেন্ট ইউনিট তালিকা রেসপন্স
    """
    items: List[GarmentUnitResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)

