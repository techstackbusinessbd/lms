"""
অর্ডার ম্যানেজমেন্ট এপিআই এন্ডপয়েন্টস (Order Management API Endpoints - Garments Enterprise Spec)
Denim Laser Automation & Control System (Denim LACS)

সিটিও স্যারের স্পেসিফিকেশন অনুসারী ১০টি কোর ফিল্ড:
Company, Buyer, Style, Job No., Brand, Season, Order Qty, UOM, Ship Date, Dealing Merchant

রুল ০৪ মেনে অনূর্ধ্ব ৩০০ লাইন, রুল ০৫ মেনে সাব-১০০ms রেসপন্স টাইম,
এবং রুল ২৩ মেনে Pydantic v2 সার্ভার-সাইড ভ্যালিডেশন নিশ্চিত করে।
"""

import math
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, get_db
from app.models.order import Order
from app.models.user import User
from app.schemas.order import (
    OrderCreate,
    OrderListResponse,
    OrderResponse,
    OrderStatusUpdate,
    OrderUpdate,
)

router = APIRouter()


@router.post(
    "/",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="নতুন গার্মেন্টস অর্ডার তৈরি করুন (Create Order)",
    description="Company, Buyer, Style, Job No., Brand, Season, Order Qty, UOM, Ship Date এবং Dealing Merchant দিয়ে অর্ডার সেভ করে।",
)
async def create_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Order:
    """নতুন অর্ডার ডাটাবেজে সংরক্ষণ করে এবং Job No / Style ডুপ্লিকেশন চেক করে"""
    # একই Job No ও Style-এর ডুপ্লিকেশন চেক
    existing_stmt = select(Order).where(
        Order.job_no == payload.job_no,
        Order.style_code == payload.style_code,
        Order.is_deleted.is_(False),
    )
    result = await db.execute(existing_stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Order with Job No. '{payload.job_no}' and Style Code "
                f"'{payload.style_code}' already exists."
            ),
        )

    # নতুন ওআরএম অবজেক্ট তৈরি
    new_order = Order(
        company=payload.company,
        buyer_name=payload.buyer_name,
        style_code=payload.style_code,
        job_no=payload.job_no,
        brand=payload.brand,
        season=payload.season,
        total_quantity=payload.total_quantity,
        uom=payload.uom,
        target_delivery_date=payload.target_delivery_date,
        dealing_merchant=payload.dealing_merchant,
        po_number=payload.po_number or payload.job_no,
        style_name=payload.style_name,
        fabric_description=payload.fabric_description,
        wash_reference=payload.wash_reference,
        priority=payload.priority,
        notes=payload.notes,
        created_by=current_user.id,
    )

    db.add(new_order)
    await db.commit()
    await db.refresh(new_order)
    return new_order


@router.get(
    "/",
    response_model=OrderListResponse,
    summary="গার্মেন্টস অর্ডারের পেজিনেটেড তালিকা (List Orders)",
    description="Job No., Buyer, Style, Company এবং Merchant দিয়ে লাইভ সার্চ ও পেজিনেশন।",
)
async def list_orders(
    page: int = Query(1, ge=1, description="পেজ নম্বর"),
    page_size: int = Query(20, ge=1, le=100, description="প্রতি পেজে রেকর্ড"),
    search: Optional[str] = Query(None, description="Job No, PO, Style, Buyer বা Company দিয়ে সার্চ"),
    status: Optional[str] = Query(None, description="অর্ডারের স্ট্যাটাস"),
    company: Optional[str] = Query(None, description="কোম্পানি / ইউনিট ফিল্টার"),
    buyer: Optional[str] = Query(None, description="নির্দিষ্ট বায়ার"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> OrderListResponse:
    """সাব-১০০ms উচ্চ ক্ষমতাসম্পন্ন পেজিনেটেড অর্ডার তালিকা রিটার্ন করে"""
    base_query = select(Order).where(Order.is_deleted.is_(False))

    # লাইভ সার্চ ফিল্টারিং
    if search:
        s = f"%{search.strip()}%"
        base_query = base_query.where(
            or_(
                Order.job_no.ilike(s),
                Order.po_number.ilike(s),
                Order.style_code.ilike(s),
                Order.buyer_name.ilike(s),
                Order.company.ilike(s),
                Order.dealing_merchant.ilike(s),
            )
        )

    if status:
        base_query = base_query.where(Order.status == status)
    if company:
        base_query = base_query.where(Order.company == company)
    if buyer:
        base_query = base_query.where(Order.buyer_name == buyer)

    # মোট সংখ্যা
    count_stmt = select(func.count()).select_from(base_query.subquery())
    total_count = (await db.execute(count_stmt)).scalar() or 0

    # পেজিনেশন ও টাইম-সর্টেড অর্ডার
    offset = (page - 1) * page_size
    query = (
        base_query.order_by(Order.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )

    items = (await db.execute(query)).scalars().all()
    total_pages = math.ceil(total_count / page_size) if total_count > 0 else 1

    return OrderListResponse(
        items=list(items),
        total=total_count,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{order_id}",
    response_model=OrderResponse,
    summary="নির্দিষ্ট অর্ডারের বিস্তারিত (Get Order Details)",
)
async def get_order(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> Order:
    """একক অর্ডারের সম্পূর্ণ বিবরণ লোড করে"""
    stmt = select(Order).where(Order.id == order_id, Order.is_deleted.is_(False))
    order = (await db.execute(stmt)).scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' was not found.",
        )
    return order


@router.put(
    "/{order_id}",
    response_model=OrderResponse,
    summary="অর্ডার সংশোধন ও রিভিশন বৃদ্ধি (Update Order)",
)
async def update_order(
    order_id: uuid.UUID,
    payload: OrderUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> Order:
    """অর্ডার আপডেট করে এবং current_revision বৃদ্ধি করে"""
    stmt = select(Order).where(Order.id == order_id, Order.is_deleted.is_(False))
    order = (await db.execute(stmt)).scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' was not found.",
        )

    # আপডেট ফিল্ডগুলো প্রয়োগ
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(order, field, value)

    order.current_revision += 1
    await db.commit()
    await db.refresh(order)
    return order


@router.patch(
    "/{order_id}/status",
    response_model=OrderResponse,
    summary="অর্ডার স্ট্যাটাস ট্রানজিশন (Update Order Status)",
)
async def update_order_status(
    order_id: uuid.UUID,
    payload: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> Order:
    """অর্ডারের স্ট্যাটাস স্টেট পরিবর্তন করে"""
    stmt = select(Order).where(Order.id == order_id, Order.is_deleted.is_(False))
    order = (await db.execute(stmt)).scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' was not found.",
        )

    order.status = payload.status
    if payload.notes:
        existing = order.notes or ""
        order.notes = f"{existing}\n[Status Change to {payload.status}]: {payload.notes}".strip()

    await db.commit()
    await db.refresh(order)
    return order


@router.delete(
    "/{order_id}",
    status_code=status.HTTP_200_OK,
    summary="অর্ডার সফট-ডিলিট (Soft Delete Order)",
)
async def delete_order(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> dict:
    """অর্ডার সফট ডিলিট করে"""
    stmt = select(Order).where(Order.id == order_id, Order.is_deleted.is_(False))
    order = (await db.execute(stmt)).scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' was not found.",
        )

    order.is_deleted = True
    await db.commit()

    return {
        "success": True,
        "message": f"Order '{order.job_no or order.po_number}' has been soft-deleted.",
        "order_id": str(order_id),
    }
