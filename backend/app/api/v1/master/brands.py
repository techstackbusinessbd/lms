"""
ব্র্যান্ড মাস্টার এপিআই (Brands Master API)
Denim Laser Automation & Control System (Denim LACS)

রুল ০৪ (<300 Lines), রুল ২৩ (Pydantic v2) এবং রুল ১১ (Bangla Comments) মেনে প্রস্তুতকৃত।
"""

import math
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.api.deps import get_current_active_user
from app.core.database import get_db
from app.models.master_data import Brand, Buyer
from app.models.user import User
from app.schemas.master_data import (
    BrandCreate,
    BrandListResponse,
    BrandResponse,
    BrandUpdate,
)

router = APIRouter()


@router.get("", response_model=BrandListResponse, summary="ব্র্যান্ড তালিকা অনুসন্ধান")
async def list_brands(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    buyer_id: Optional[uuid.UUID] = Query(None, description="নির্দিষ্ট বায়ারের ব্র্যান্ড ফিল্টার"),
    search: Optional[str] = Query(None),
    active_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> BrandListResponse:
    """ব্র্যান্ড ও সাব-ব্র্যান্ডের তালিকা ফিল্টারসহ প্রদান করে"""
    query = (
        select(Brand)
        .options(joinedload(Brand.buyer))
        .where(Brand.is_deleted.is_(False))
    )
    if active_only:
        query = query.where(Brand.is_active.is_(True))
    if buyer_id:
        query = query.where(Brand.buyer_id == buyer_id)
    if search:
        s = f"%{search.strip()}%"
        query = query.where(or_(Brand.name.ilike(s), Brand.code.ilike(s)))

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    query = query.order_by(Brand.name.asc()).offset((page - 1) * page_size).limit(page_size)
    brands = list((await db.execute(query)).scalars().all())

    items = []
    for b in brands:
        resp = BrandResponse(
            id=b.id,
            buyer_id=b.buyer_id,
            code=b.code,
            name=b.name,
            is_active=b.is_active,
            buyer_name=b.buyer.name if b.buyer else None,
            created_at=b.created_at,
            updated_at=b.updated_at,
            is_deleted=b.is_deleted,
        )
        items.append(resp)

    return BrandListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 1,
    )


@router.post("", response_model=BrandResponse, status_code=status.HTTP_201_CREATED, summary="নতুন ব্র্যান্ড তৈরি")
async def create_brand(
    payload: BrandCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> BrandResponse:
    """নতুন বায়ার ব্র্যান্ড রেকর্ড তৈরি করে"""
    buyer_name: Optional[str] = None
    if payload.buyer_id:
        buyer = (
            await db.execute(select(Buyer).where(Buyer.id == payload.buyer_id, Buyer.is_deleted.is_(False)))
        ).scalar_one_or_none()
        if not buyer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referenced Buyer not found.")
        buyer_name = buyer.name

    brand = Brand(
        buyer_id=payload.buyer_id,
        code=payload.code.upper(),
        name=payload.name,
        is_active=payload.is_active,
    )
    db.add(brand)
    await db.commit()
    await db.refresh(brand)

    return BrandResponse(
        id=brand.id,
        buyer_id=brand.buyer_id,
        code=brand.code,
        name=brand.name,
        is_active=brand.is_active,
        buyer_name=buyer_name,
        created_at=brand.created_at,
        updated_at=brand.updated_at,
        is_deleted=brand.is_deleted,
    )


@router.get("/{brand_id}", response_model=BrandResponse, summary="নির্দিষ্ট ব্র্যান্ডের বিস্তারিত")
async def get_brand(
    brand_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> BrandResponse:
    brand = (
        await db.execute(
            select(Brand).options(joinedload(Brand.buyer)).where(Brand.id == brand_id, Brand.is_deleted.is_(False))
        )
    ).scalar_one_or_none()
    if not brand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found.")

    return BrandResponse(
        id=brand.id,
        buyer_id=brand.buyer_id,
        code=brand.code,
        name=brand.name,
        is_active=brand.is_active,
        buyer_name=brand.buyer.name if brand.buyer else None,
        created_at=brand.created_at,
        updated_at=brand.updated_at,
        is_deleted=brand.is_deleted,
    )


@router.put("/{brand_id}", response_model=BrandResponse, summary="ব্র্যান্ড তথ্য আপডেট")
async def update_brand(
    brand_id: uuid.UUID,
    payload: BrandUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> BrandResponse:
    brand = (
        await db.execute(
            select(Brand).options(joinedload(Brand.buyer)).where(Brand.id == brand_id, Brand.is_deleted.is_(False))
        )
    ).scalar_one_or_none()
    if not brand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found.")

    if payload.buyer_id is not None:
        brand.buyer_id = payload.buyer_id
    if payload.code is not None:
        brand.code = payload.code.upper()
    if payload.name is not None:
        brand.name = payload.name
    if payload.is_active is not None:
        brand.is_active = payload.is_active

    await db.commit()
    await db.refresh(brand)

    return BrandResponse(
        id=brand.id,
        buyer_id=brand.buyer_id,
        code=brand.code,
        name=brand.name,
        is_active=brand.is_active,
        buyer_name=brand.buyer.name if brand.buyer else None,
        created_at=brand.created_at,
        updated_at=brand.updated_at,
        is_deleted=brand.is_deleted,
    )


@router.delete("/{brand_id}", status_code=status.HTTP_204_NO_CONTENT, summary="ব্র্যান্ড সফট ডিলিট")
async def delete_brand(
    brand_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> None:
    brand = (
        await db.execute(select(Brand).where(Brand.id == brand_id, Brand.is_deleted.is_(False)))
    ).scalar_one_or_none()
    if not brand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found.")

    brand.is_deleted = True
    brand.is_active = False
    await db.commit()
