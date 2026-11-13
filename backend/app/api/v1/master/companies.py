"""
কোম্পানি / ফ্যাক্টরি ইউনিট মাস্টার এপিআই (Companies Master API)
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
from app.models.master_data import Company
from app.models.user import User
from app.schemas.master_data import (
    CompanyCreate,
    CompanyListResponse,
    CompanyResponse,
    CompanyUpdate,
)

router = APIRouter()


@router.get("", response_model=CompanyListResponse, summary="কোম্পানি তালিকা অনুসন্ধান")
async def list_companies(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: Optional[str] = Query(None),
    active_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> CompanyListResponse:
    """কারখানা বা কোম্পানি ইউনিটের তালিকা ফিল্টারসহ প্রদান করে"""
    query = select(Company).where(Company.is_deleted.is_(False))
    if active_only:
        query = query.where(Company.is_active.is_(True))
    if search:
        s = f"%{search.strip()}%"
        query = query.where(or_(Company.name.ilike(s), Company.code.ilike(s)))

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    query = query.order_by(Company.name.asc()).offset((page - 1) * page_size).limit(page_size)
    items = list((await db.execute(query)).scalars().all())

    return CompanyListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 1,
    )


@router.post("", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED, summary="নতুন কোম্পানি তৈরি")
async def create_company(
    payload: CompanyCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> Company:
    """নতুন ফ্যাক্টরি ইউনিট বা কোম্পানি রেকর্ড যুক্ত করে"""
    exists_stmt = select(Company).where(
        or_(Company.code == payload.code.upper(), Company.name == payload.name),
        Company.is_deleted.is_(False),
    )
    if (await db.execute(exists_stmt)).scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Company with code '{payload.code}' or name '{payload.name}' already exists.",
        )

    company = Company(
        code=payload.code.upper(),
        name=payload.name,
        address=payload.address,
        is_active=payload.is_active,
    )
    db.add(company)
    await db.commit()
    await db.refresh(company)
    return company


@router.get("/{company_id}", response_model=CompanyResponse, summary="নির্দিষ্ট কোম্পানি বিবরণ")
async def get_company(
    company_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> Company:
    company = (
        await db.execute(select(Company).where(Company.id == company_id, Company.is_deleted.is_(False)))
    ).scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found.")
    return company


@router.put("/{company_id}", response_model=CompanyResponse, summary="কোম্পানি তথ্য আপডেট")
async def update_company(
    company_id: uuid.UUID,
    payload: CompanyUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> Company:
    company = (
        await db.execute(select(Company).where(Company.id == company_id, Company.is_deleted.is_(False)))
    ).scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found.")

    if payload.code is not None:
        company.code = payload.code.upper()
    if payload.name is not None:
        company.name = payload.name
    if payload.address is not None:
        company.address = payload.address
    if payload.is_active is not None:
        company.is_active = payload.is_active

    await db.commit()
    await db.refresh(company)
    return company


@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT, summary="কোম্পানি সফট ডিলিট")
async def delete_company(
    company_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> None:
    company = (
        await db.execute(select(Company).where(Company.id == company_id, Company.is_deleted.is_(False)))
    ).scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found.")

    company.is_deleted = True
    company.is_active = False
    await db.commit()
