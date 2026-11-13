"""
লেজার ডিজাইন ভল্ট ও রেসিপি লক এপিআই এন্ডপয়েন্টস (Laser Design Vault Endpoints)
Denim Laser Automation & Control System (Denim LACS)

Jeanologia eMark (.jean এবং .jean5) রেসিপি ড্রাফট, ভার্সন ও রেসিপি লক/আনলক গেটওয়ে।
রুল: ডিজাইনার লক করলে অপারেটর প্যারামিটার এডিট করতে পারবে না;
আনলক থাকলে শপ-ফ্লোরে অপারেটরের প্যারামিটার এডিট করার অনুমতি থাকবে।
রুল ০৪ (<300 Lines), রুল ০৫ (Sub-100ms) এবং রুল ২৩ (Pydantic v2) মেনে প্রস্তুতকৃত।
"""

import math
import uuid
from typing import List, Optional
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_active_user
from app.api.v1.design_files import router as files_router, get_design_or_404
from app.core.database import get_db
from app.models.laser_design import LaserDesign
from app.models.order import Order
from app.models.user import User
from app.schemas.laser_design import (
    LaserDesignCreate,
    LaserDesignListResponse,
    LaserDesignResponse,
    RecipeLockRequest,
    RecipeUnlockRequest,
)

router = APIRouter()
router.include_router(files_router)


@router.post(
    "/",
    response_model=LaserDesignResponse,
    status_code=status.HTTP_201_CREATED,
    summary="নতুন লেজার ডিজাইন রেসিপি ড্রাফট তৈরি",
)
async def create_design(
    payload: LaserDesignCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> LaserDesignResponse:
    """অর্ডারের জন্য নতুন লেজার ডিজাইন ড্রাফট তৈরি করে"""
    order = (
        await db.execute(
            select(Order).where(Order.id == payload.order_id, Order.is_deleted.is_(False))
        )
    ).scalar_one_or_none()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{payload.order_id}' not found.",
        )

    max_ver = (
        await db.execute(
            select(func.max(LaserDesign.version)).where(
                LaserDesign.order_id == payload.order_id,
                LaserDesign.is_deleted.is_(False),
            )
        )
    ).scalar() or 0

    new_design = LaserDesign(
        order_id=payload.order_id,
        style_code=payload.style_code or order.style_code,
        recipe_name=payload.recipe_name,
        version=max_ver + 1,
        status="DRAFT",
        is_locked=False,
        notes=payload.notes,
    )
    db.add(new_design)
    await db.commit()
    return await get_design_or_404(db, new_design.id)


@router.get("/", response_model=LaserDesignListResponse, summary="সকল লেজার ডিজাইন রেসিপির তালিকা")
async def list_designs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> LaserDesignListResponse:
    """সকল স্টাইলের জন্য প্রস্তুতকৃত লেজার রেসিপি তালিকা (সার্চ ও ফিল্টারিং সহ)"""
    query = (
        select(LaserDesign)
        .options(selectinload(LaserDesign.files))
        .where(LaserDesign.is_deleted.is_(False))
    )
    if search:
        s = f"%{search.strip()}%"
        query = query.where(
            or_(LaserDesign.style_code.ilike(s), LaserDesign.recipe_name.ilike(s))
        )
    if status_filter and status_filter != "ALL":
        query = query.where(LaserDesign.status == status_filter)

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    query = (
        query.order_by(LaserDesign.updated_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = list((await db.execute(query)).scalars().all())

    return LaserDesignListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 1,
    )


@router.post(
    "/{design_id}/lock",
    response_model=LaserDesignResponse,
    summary="রেসিপি লক ও প্রোডাকশন সাইন-অফ (Recipe Lock Gate)",
)
async def lock_recipe(
    design_id: uuid.UUID,
    payload: RecipeLockRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> LaserDesignResponse:
    """লেজার রেসিপি লক করে; লক থাকা অবস্থায় শপ-ফ্লোরে অপারেটর কোনো প্যারামিটার এডিট করতে পারবে না"""
    design = await get_design_or_404(db, design_id)
    if design.is_locked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recipe is already locked.",
        )
    if not design.files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot lock recipe without at least one mapped file.",
        )

    design.is_locked = True
    design.status = "LOCKED"
    design.locked_by = current_user.id
    design.locked_at = func.now()
    if payload.lock_notes:
        design.notes = f"{design.notes or ''}\n[Lock Note]: {payload.lock_notes}".strip()

    await db.commit()
    await db.refresh(design)
    return design


@router.post(
    "/{design_id}/unlock",
    response_model=LaserDesignResponse,
    summary="রেসিপি আনলক ও প্যারামিটার এডিটিং উন্মুক্তকরণ (Recipe Unlock Gate)",
)
async def unlock_recipe(
    design_id: uuid.UUID,
    payload: RecipeUnlockRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> LaserDesignResponse:
    """লক করা রেসিপি আনলক করে যাতে ফ্লোরে অপারেটর প্যারামিটার সমন্বয় (Power/Speed/Cycle Time) করতে পারে"""
    design = await get_design_or_404(db, design_id)
    if not design.is_locked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recipe is already unlocked / in draft mode.",
        )

    design.is_locked = False
    design.status = "DRAFT"
    design.locked_by = None
    design.locked_at = None
    note = payload.unlock_notes or f"Unlocked by {current_user.username} for parameter adjustments"
    design.notes = f"{design.notes or ''}\n[Unlock Note]: {note}".strip()

    await db.commit()
    await db.refresh(design)
    return design


@router.get("/{design_id}", response_model=LaserDesignResponse, summary="ডিজাইনের সম্পূর্ণ বিবরণ")
async def get_design_by_id(
    design_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> LaserDesignResponse:
    """আইডি অনুযায়ী লেজার ডিজাইন এবং সংযুক্ত সাইজ ফাইলসমূহ প্রদান করে"""
    return await get_design_or_404(db, design_id)


@router.get("/order/{order_id}", response_model=List[LaserDesignResponse], summary="অর্ডারের রেসিপি তালিকা")
async def get_designs_by_order(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> List[LaserDesignResponse]:
    """অর্ডার আইডি অনুযায়ী সমস্ত ডিজাইন ভার্সন প্রদান করে (Sub-50ms)"""
    stmt = (
        select(LaserDesign)
        .options(selectinload(LaserDesign.files))
        .where(LaserDesign.order_id == order_id, LaserDesign.is_deleted.is_(False))
        .order_by(LaserDesign.version.desc())
    )
    return list((await db.execute(stmt)).scalars().all())


@router.post(
    "/{design_id}/new-version",
    response_model=LaserDesignResponse,
    status_code=status.HTTP_201_CREATED,
    summary="বিদ্যমান রেসিপি থেকে নতুন রিভিশন (New Version) তৈরি",
)
async def create_new_version(
    design_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> LaserDesignResponse:
    """লক করা রেসিপি অপরিবর্তিত রেখে নতুন ড্রাফট রিভিশন (v2, v3...) প্রস্তুত করে"""
    source_design = await get_design_or_404(db, design_id)
    max_ver = (
        await db.execute(
            select(func.max(LaserDesign.version)).where(
                LaserDesign.order_id == source_design.order_id,
                LaserDesign.is_deleted.is_(False),
            )
        )
    ).scalar() or source_design.version

    new_design = LaserDesign(
        order_id=source_design.order_id,
        style_code=source_design.style_code,
        recipe_name=f"{source_design.recipe_name} (v{max_ver + 1})",
        version=max_ver + 1,
        status="DRAFT",
        is_locked=False,
        notes=f"Revision of version {source_design.version}",
    )
    db.add(new_design)
    await db.commit()
    return await get_design_or_404(db, new_design.id)
