"""
মাস্টার ডাটা Pydantic v2 স্কিমা (Master Data Schemas)
Denim Laser Automation & Control System (Denim LACS)

Company, Buyer, Brand এবং Season-এর টাইপ-সেফ ডিটিও মডেল।
অটো-সিস্টেম জেনারেটেড কোড সাপোর্টসহ।
রুল ২৩ (Pydantic v2), রুল ০৪ (<300 Lines) এবং রুল ১১ (Bangla Comments) মেনে প্রস্তুতকৃত।
"""

import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


# ============================================================================
# ১. কোম্পানি (Company / Factory Units) স্কিমা
# ============================================================================

class CompanyBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    code: Optional[str] = Field(None, max_length=50, description="ঐচ্ছিক কোড; ফাঁকা রাখলে সিস্টেম স্বয়ংক্রিয়ভাবে তৈরি করবে")
    name: str = Field(..., min_length=2, max_length=150, examples=["Denim Solutions Ltd. Unit-1"])
    address: Optional[str] = Field(None, max_length=500, examples=["Plot 12, EPZ, Dhaka"])
    is_active: bool = Field(True, description="সক্রিয়/নিষ্ক্রিয় স্ট্যাটাস")


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    code: Optional[str] = Field(None, min_length=2, max_length=50)
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    address: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class CompanyResponse(CompanyBase):
    id: uuid.UUID
    code: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool

    model_config = ConfigDict(from_attributes=True)


class CompanyListResponse(BaseModel):
    items: List[CompanyResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# ২. বায়ার (Buyer) স্কিমা
# ============================================================================

class BuyerBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    code: Optional[str] = Field(None, max_length=50, description="ঐচ্ছিক কোড; ফাঁকা রাখলে সিস্টেম স্বয়ংক্রিয়ভাবে তৈরি করবে")
    name: str = Field(..., min_length=2, max_length=150, examples=["Levi Strauss & Co."])
    country: Optional[str] = Field(None, max_length=100, examples=["USA"])
    contact_email: Optional[str] = Field(None, max_length=150, examples=["merchandising@levi.com"])
    is_active: bool = Field(True, description="সক্রিয় বায়ার")


class BuyerCreate(BuyerBase):
    pass


class BuyerUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    code: Optional[str] = Field(None, min_length=2, max_length=50)
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    country: Optional[str] = Field(None, max_length=100)
    contact_email: Optional[str] = Field(None, max_length=150)
    is_active: Optional[bool] = None


class BuyerResponse(BuyerBase):
    id: uuid.UUID
    code: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool

    model_config = ConfigDict(from_attributes=True)


class BuyerListResponse(BaseModel):
    items: List[BuyerResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# ৩. ব্র্যান্ড (Brand / Sub-Brand) স্কিমা
# ============================================================================

class BrandBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    buyer_id: Optional[uuid.UUID] = Field(None, description="সম্পর্কিত বায়ার আইডি (ঐচ্ছিক)")
    code: Optional[str] = Field(None, max_length=50, description="ঐচ্ছিক কোড; ফাঁকা রাখলে সিস্টেম স্বয়ংক্রিয়ভাবে তৈরি করবে")
    name: str = Field(..., min_length=2, max_length=150, examples=["Levi's Red Tab"])
    is_active: bool = Field(True, description="সক্রিয় ব্র্যান্ড")


class BrandCreate(BrandBase):
    pass


class BrandUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    buyer_id: Optional[uuid.UUID] = None
    code: Optional[str] = Field(None, min_length=2, max_length=50)
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    is_active: Optional[bool] = None


class BrandResponse(BrandBase):
    id: uuid.UUID
    code: str
    buyer_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    is_deleted: bool

    model_config = ConfigDict(from_attributes=True)


class BrandListResponse(BaseModel):
    items: List[BrandResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# ৪. সিজন (Season) স্কিমা
# ============================================================================

class SeasonBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    code: Optional[str] = Field(None, max_length=50, description="ঐচ্ছিক কোড; ফাঁকা রাখলে সিস্টেম স্বয়ংক্রিয়ভাবে তৈরি করবে")
    name: str = Field(..., min_length=2, max_length=100, examples=["Spring/Summer"])
    is_active: bool = Field(True, description="সক্রিয় সিজন")


class SeasonCreate(SeasonBase):
    pass


class SeasonUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    code: Optional[str] = Field(None, min_length=2, max_length=50)
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    is_active: Optional[bool] = None


class SeasonResponse(SeasonBase):
    id: uuid.UUID
    code: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool

    model_config = ConfigDict(from_attributes=True)


class SeasonListResponse(BaseModel):
    items: List[SeasonResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)
