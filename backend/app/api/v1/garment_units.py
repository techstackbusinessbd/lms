"""
গার্মেন্ট ইউনিট ও কিউআর প্রিন্টিং এপিআই (Garment Units & QR Printing API)
Denim Laser Automation & Control System (Denim LACS)

অর্ডারের সাইজ রেশিও অনুযায়ী বাল্ক কিউআর তৈরি, থার্মাল ZPL জেনারেশন,
পিএনজি ইমেজ স্ট্রিমিং এবং শপ-ফ্লোর স্ক্যানার লুকআপ এন্ডপয়েন্টস।
রুল ০৪ (<300 Lines), রুল ০৫ (Sub-50ms) এবং রুল ২৩ (Pydantic v2) মেনে প্রস্তুতকৃত।
"""

import math
import uuid
from typing import Dict, List, Optional
from fastapi import (
    APIRouter,
    Body,
    Depends,
    HTTPException,
    Query,
    Response,
    status,
)
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_active_user
from app.core.database import get_db
from app.models.garment_unit import GarmentUnit
from app.models.order import Order
from app.models.user import User
from app.schemas.garment_unit import (
    GarmentUnitBatchGenerateRequest,
    GarmentUnitListResponse,
    GarmentUnitResponse,
    GarmentUnitStageUpdate,
)
from app.services.qr_engine import (
    generate_batch_zpl_stream,
    generate_qr_png_bytes,
    generate_zpl_single_label,
)
from app.services.unit_generator import (
    UnitGenerationError,
    batch_generate_garment_units,
)

router = APIRouter()


@router.post(
    "/generate",
    status_code=status.HTTP_201_CREATED,
    summary="অর্ডারের জন্য বাল্ক কিউআর ও প্যান্ট সিরিয়াল জেনারেশন",
)
async def generate_units_batch(
    payload: GarmentUnitBatchGenerateRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> Dict:
    """অর্ডারের সাইজ রেশিও অনুযায়ী এক ক্লিকে শত শত প্যান্টের সিরিয়াল ও কিউআর কোড প্রস্তুত করে"""
    order = (
        await db.execute(
            select(Order).where(Order.id == payload.order_id, Order.is_deleted.is_(False))
        )
    ).scalar_one_or_none()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{payload.order_id}' not found.",
        )

    try:
        result = await batch_generate_garment_units(
            db=db,
            order=order,
            size_quantities=payload.size_quantities,
            production_type=payload.production_type,
            cut_no=payload.cut_no,
            bundle_no=payload.bundle_no,
        )
        return result
    except UnitGenerationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "/order/{order_id}",
    response_model=GarmentUnitListResponse,
    summary="নির্দিষ্ট অর্ডারের গার্মেন্ট ইউনিট তালিকা",
)
async def list_order_units(
    order_id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
    size_filter: Optional[str] = Query(None, alias="size"),
    stage_filter: Optional[str] = Query(None, alias="stage"),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> GarmentUnitListResponse:
    """অর্ডার অনুযায়ী কিউআর কোড ও প্যান্টের লাইভ প্রগ্রেস তালিকা ফিল্টার সহ প্রদান করে"""
    query = select(GarmentUnit).where(
        GarmentUnit.order_id == order_id, GarmentUnit.is_deleted.is_(False)
    )

    if size_filter and size_filter != "ALL":
        query = query.where(GarmentUnit.size_code == size_filter.strip().upper())
    if stage_filter and stage_filter != "ALL":
        query = query.where(GarmentUnit.current_stage == stage_filter.strip())
    if search:
        s = f"%{search.strip()}%"
        query = query.where(
            or_(GarmentUnit.unit_serial_no.ilike(s), GarmentUnit.qr_code_payload.ilike(s))
        )

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    query = (
        query.order_by(GarmentUnit.created_at.desc(), GarmentUnit.unit_serial_no.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = list((await db.execute(query)).scalars().all())

    return GarmentUnitListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 1,
    )


@router.get(
    "/{unit_id}/qr-png",
    summary="একক কিউআর কোড পিএনজি ইমেজ স্ট্রিম",
)
async def get_unit_qr_png(
    unit_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    """থার্মাল প্রিন্টার প্রিভিউ বা ওয়েব প্রিন্টের জন্য কিউআর পিএনজি রিটার্ন করে"""
    unit = (
        await db.execute(
            select(GarmentUnit).where(GarmentUnit.id == unit_id, GarmentUnit.is_deleted.is_(False))
        )
    ).scalar_one_or_none()
    if not unit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Garment unit not found.")

    png_bytes = generate_qr_png_bytes(unit.qr_code_payload, box_size=8, border=2)
    return Response(content=png_bytes, media_type="image/png")


@router.post(
    "/batch-zpl",
    summary="নির্বাচিত প্যান্টসমূহের জন্য থার্মাল ZPL প্রিন্ট স্পুল জেনারেশন",
)
async def generate_units_zpl(
    unit_ids: List[uuid.UUID] = Body(..., min_length=1, max_length=500),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> Dict[str, str]:
    """জেব্রা বা টিএসপিএল থার্মাল প্রিন্টারে সরাসরি প্রেরণের জন্য র' ZPL টেক্সট স্পুল প্রদান করে"""
    units = (
        await db.execute(
            select(GarmentUnit)
            .options(selectinload(GarmentUnit.order))
            .where(GarmentUnit.id.in_(unit_ids), GarmentUnit.is_deleted.is_(False))
            .order_by(GarmentUnit.unit_serial_no.asc())
        )
    ).scalars().all()

    if not units:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No matching units found.")

    first_order = units[0].order if units else None
    zpl_content = generate_batch_zpl_stream(list(units), order=first_order)
    return {
        "zpl_data": zpl_content,
        "total_labels": str(len(units)),
    }


@router.post(
    "/mark-printed",
    summary="প্রিন্ট সম্পন্ন চিহ্নিতকরণ ও অডিট ট্রেইল",
)
async def mark_units_printed(
    unit_ids: List[uuid.UUID] = Body(..., min_length=1, max_length=500),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, int]:
    """থার্মাল স্টিকার প্রিন্ট হওয়া মাত্র ইউনিটগুলোকে 'PRINTED' স্টেজে আপডেট করে"""
    stmt = select(GarmentUnit).where(
        GarmentUnit.id.in_(unit_ids), GarmentUnit.is_deleted.is_(False)
    )
    units = (await db.execute(stmt)).scalars().all()

    now = func.now()
    count = 0
    for u in units:
        u.current_stage = "PRINTED"
        u.printed_by = current_user.id
        u.printed_at = now
        count += 1

    await db.commit()
    return {"updated_count": count}


@router.get(
    "/scan-lookup/{scan_query}",
    response_model=GarmentUnitResponse,
    summary="ক্যামেরা স্ক্যানার তাৎক্ষণিক লুকআপ (Sub-10ms)",
)
async def scan_lookup_unit(
    scan_query: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> GarmentUnitResponse:
    """লেজার টেবিলে ক্যামেরা স্ক্যান করার সাথে সাথে কাপড়ের ইউনিট ও সাইজ তথ্য উদ্ধার করে"""
    clean = scan_query.strip()
    stmt = select(GarmentUnit).where(
        or_(
            GarmentUnit.qr_code_payload == clean,
            GarmentUnit.unit_serial_no == clean,
        ),
        GarmentUnit.is_deleted.is_(False),
    )
    unit = (await db.execute(stmt)).scalar_one_or_none()
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Garment unit with QR/Serial '{clean}' not found in registry.",
        )
    return unit

