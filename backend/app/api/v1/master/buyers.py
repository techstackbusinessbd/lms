"""
বায়ার মাস্টার এপিআই (Buyers Master API)
Denim Laser Automation & Control System (Denim LACS)

রুল ০৪ (<300 Lines), রুল ২৩ (Pydantic v2) এবং রুল ১১ (Bangla Comments) মেনে প্রস্তুতকৃত।
"""

import math
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.core.database import get_db
from app.models.master_data import Buyer
from app.models.user import User
from app.services.master_code_generator import generate_auto_master_code
from app.schemas.master_data import (
    BuyerCreate,
    BuyerListResponse,
    BuyerResponse,
    BuyerUpdate,
)

router = APIRouter()


@router.get("", response_model=BuyerListResponse, summary="বায়ার তালিকা অনুসন্ধান")
async def list_buyers(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: Optional[str] = Query(None),
    active_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> BuyerListResponse:
    """গার্মেন্টস বায়ারদের তালিকা ফিল্টারসহ প্রদান করে"""
    query = select(Buyer).where(Buyer.is_deleted.is_(False))
    if active_only:
        query = query.where(Buyer.is_active.is_(True))
    if search:
        s = f"%{search.strip()}%"
        query = query.where(or_(Buyer.name.ilike(s), Buyer.code.ilike(s), Buyer.country.ilike(s)))

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    query = query.order_by(Buyer.name.asc()).offset((page - 1) * page_size).limit(page_size)
    items = list((await db.execute(query)).scalars().all())

    return BuyerListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 1,
    )


@router.post("", response_model=BuyerResponse, status_code=status.HTTP_201_CREATED, summary="নতুন বায়ার তৈরি")
async def create_buyer(
    payload: BuyerCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> Buyer:
    """নতুন বায়ার রেকর্ড ডাটাবেজে সংরক্ষণ করে (কোড ফাঁকা থাকলে অটো-জেনারেট হয়)"""
    final_code = (
        payload.code.strip().upper()
        if payload.code and payload.code.strip()
        else await generate_auto_master_code(db, Buyer, "BYR")
    )

    exists_stmt = select(Buyer).where(
        or_(Buyer.code == final_code, Buyer.name == payload.name),
        Buyer.is_deleted.is_(False),
    )
    if (await db.execute(exists_stmt)).scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Buyer with code '{final_code}' or name '{payload.name}' already exists.",
        )

    buyer = Buyer(
        code=final_code,
        name=payload.name,
        country=payload.country,
        contact_email=payload.contact_email,
        is_active=payload.is_active,
    )
    db.add(buyer)
    await db.commit()
    await db.refresh(buyer)
    return buyer


@router.get("/{buyer_id}", response_model=BuyerResponse, summary="নির্দিষ্ট বায়ারের বিস্তারিত")
async def get_buyer(
    buyer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> Buyer:
    buyer = (
        await db.execute(select(Buyer).where(Buyer.id == buyer_id, Buyer.is_deleted.is_(False)))
    ).scalar_one_or_none()
    if not buyer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Buyer not found.")
    return buyer


@router.put("/{buyer_id}", response_model=BuyerResponse, summary="বায়ার তথ্য আপডেট")
async def update_buyer(
    buyer_id: uuid.UUID,
    payload: BuyerUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> Buyer:
    buyer = (
        await db.execute(select(Buyer).where(Buyer.id == buyer_id, Buyer.is_deleted.is_(False)))
    ).scalar_one_or_none()
    if not buyer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Buyer not found.")

    if payload.code is not None:
        buyer.code = payload.code.upper()
    if payload.name is not None:
        buyer.name = payload.name
    if payload.country is not None:
        buyer.country = payload.country
    if payload.contact_email is not None:
        buyer.contact_email = payload.contact_email
    if payload.is_active is not None:
        buyer.is_active = payload.is_active

    await db.commit()
    await db.refresh(buyer)
    return buyer


@router.delete("/{buyer_id}", status_code=status.HTTP_204_NO_CONTENT, summary="বায়ার সফট ডিলিট")
async def delete_buyer(
    buyer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> None:
    buyer = (
        await db.execute(select(Buyer).where(Buyer.id == buyer_id, Buyer.is_deleted.is_(False)))
    ).scalar_one_or_none()
    if not buyer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Buyer not found.")

    buyer.is_deleted = True
    buyer.is_active = False
    await db.commit()

