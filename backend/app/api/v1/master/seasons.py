"""
সিজন মাস্টার এপিআই (Seasons Master API)
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
from app.models.master_data import Season
from app.models.user import User
from app.services.master_code_generator import generate_auto_master_code
from app.schemas.master_data import (
    SeasonCreate,
    SeasonListResponse,
    SeasonResponse,
    SeasonUpdate,
)

router = APIRouter()


@router.get("", response_model=SeasonListResponse, summary="সিজন তালিকা অনুসন্ধান")
async def list_seasons(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: Optional[str] = Query(None),
    active_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> SeasonListResponse:
    """প্রোডাকশন সিজনের তালিকা ফিল্টারসহ প্রদান করে"""
    query = select(Season).where(Season.is_deleted.is_(False))
    if active_only:
        query = query.where(Season.is_active.is_(True))
    if search:
        s = f"%{search.strip()}%"
        query = query.where(or_(Season.name.ilike(s), Season.code.ilike(s)))

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    query = query.order_by(Season.name.asc()).offset((page - 1) * page_size).limit(page_size)
    items = list((await db.execute(query)).scalars().all())

    return SeasonListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 1,
    )


@router.post("", response_model=SeasonResponse, status_code=status.HTTP_201_CREATED, summary="নতুন সিজন তৈরি")
async def create_season(
    payload: SeasonCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> Season:
    """নতুন সিজন রেকর্ড যুক্ত করে (কোড ফাঁকা থাকলে অটো-জেনারেট হয়)"""
    final_code = (
        payload.code.strip().upper()
        if payload.code and payload.code.strip()
        else await generate_auto_master_code(db, Season, "SSN")
    )

    exists_stmt = select(Season).where(
        or_(Season.code == final_code, Season.name == payload.name),
        Season.is_deleted.is_(False),
    )
    if (await db.execute(exists_stmt)).scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Season with code '{final_code}' or name '{payload.name}' already exists.",
        )

    season = Season(
        code=final_code,
        name=payload.name,
        is_active=payload.is_active,
    )
    db.add(season)
    await db.commit()
    await db.refresh(season)
    return season


@router.get("/{season_id}", response_model=SeasonResponse, summary="নির্দিষ্ট সিজনের বিস্তারিত")
async def get_season(
    season_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> Season:
    season = (
        await db.execute(select(Season).where(Season.id == season_id, Season.is_deleted.is_(False)))
    ).scalar_one_or_none()
    if not season:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Season not found.")
    return season


@router.put("/{season_id}", response_model=SeasonResponse, summary="সিজন তথ্য আপডেট")
async def update_season(
    season_id: uuid.UUID,
    payload: SeasonUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> Season:
    season = (
        await db.execute(select(Season).where(Season.id == season_id, Season.is_deleted.is_(False)))
    ).scalar_one_or_none()
    if not season:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Season not found.")

    if payload.code is not None:
        season.code = payload.code.upper()
    if payload.name is not None:
        season.name = payload.name
    if payload.is_active is not None:
        season.is_active = payload.is_active

    await db.commit()
    await db.refresh(season)
    return season


@router.delete("/{season_id}", status_code=status.HTTP_204_NO_CONTENT, summary="সিজন সফট ডিলিট")
async def delete_season(
    season_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> None:
    season = (
        await db.execute(select(Season).where(Season.id == season_id, Season.is_deleted.is_(False)))
    ).scalar_one_or_none()
    if not season:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Season not found.")

    season.is_deleted = True
    season.is_active = False
    await db.commit()

