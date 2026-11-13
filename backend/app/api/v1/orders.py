"""
অর্ডার ম্যানেজমেন্ট এপিআই এন্ডপয়েন্টস (Order Management API Endpoints)
Denim Laser Automation & Control System (Denim LACS)

এই মডিউলটি বায়ার পারচেজ অর্ডার (PO) এন্ট্রি, তালিকা প্রদর্শন, সার্চ, ফিল্টারিং,
আপডেট এবং সফট-ডিলিট অপারেশন পরিচালনা করে।
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
    summary="নতুন বায়ার অর্ডার তৈরি করুন (Create Order)",
    description="বায়ারের PO নম্বর, স্টাইল কোড, ফেব্রিক এবং মোট কোয়ান্টিটি দিয়ে নতুন অর্ডার তৈরি করে।",
)
async def create_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Order:
    """
    নতুন অর্ডার ডাটাবেজে সংরক্ষণ করে।
    একই PO নম্বর এবং Style কোডের কোনো বিদ্যমান আন-ডিলিটেড অর্ডার থাকলে HTTP 409 Conflict ত্রুটি ছুড়ে দেয়।
    """
    # ১. একই PO এবং Style-এর ডুপ্লিকেশন চেক
    existing_stmt = select(Order).where(
        Order.po_number == payload.po_number,
        Order.style_code == payload.style_code,
        Order.is_deleted.is_(False),
    )
    result = await db.execute(existing_stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Order with PO Number '{payload.po_number}' and Style Code "
                f"'{payload.style_code}' already exists."
            ),
        )

    # ২. নতুন ওআরএম অবজেক্ট তৈরি ও টাইম-সর্টেড UUIDv7 প্রাইমারি কি অ্যাসাইন
    new_order = Order(
        buyer_name=payload.buyer_name,
        po_number=payload.po_number,
        style_code=payload.style_code,
        style_name=payload.style_name,
        fabric_description=payload.fabric_description,
        wash_reference=payload.wash_reference,
        total_quantity=payload.total_quantity,
        target_delivery_date=payload.target_delivery_date,
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
    summary="অর্ডারের পেজিনেটেড তালিকা (List Orders)",
    description="সার্চ, স্ট্যাটাস, প্রায়োরিটি ও বায়ার ফিল্টারিং সহ পেজিনেটেড তালিকা প্রদান করে (TanStack Table অপ্টিমাইজড)।",
)
async def list_orders(
    page: int = Query(1, ge=1, description="পেজ নম্বর"),
    page_size: int = Query(20, ge=1, le=100, description="প্রতি পেজে রেকর্ডের সংখ্যা"),
    search: Optional[str] = Query(None, description="PO, Style বা Buyer দিয়ে লাইভ সার্চ"),
    status: Optional[str] = Query(None, description="অর্ডারের স্ট্যাটাস ফিল্টার"),
    priority: Optional[str] = Query(None, description="প্রায়োরিটি ফিল্টার (NORMAL, HIGH, URGENT)"),
    buyer: Optional[str] = Query(None, description="নির্দিষ্ট বায়ার ফিল্টার"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> OrderListResponse:
    """
    সাব-১০০ms উচ্চ ক্ষমতাসম্পন্ন পেজিনেটেড অর্ডার তালিকা রিটার্ন করে।
    বি-ট্রি ইনডেক্স ব্যবহার করে তাৎক্ষণিক ফিল্টারিং সম্পন্ন হয়।
    """
    base_query = select(Order).where(Order.is_deleted.is_(False))

    # লাইভ সার্চ ফিল্টারিং (PO, Style বা Buyer Name)
    if search:
        search_term = f"%{search.strip()}%"
        base_query = base_query.where(
            or_(
                Order.po_number.ilike(search_term),
                Order.style_code.ilike(search_term),
                Order.buyer_name.ilike(search_term),
            )
        )

    # স্ট্যাটাস ফিল্টার
    if status:
        base_query = base_query.where(Order.status == status)

    # প্রায়োরিটি ফিল্টার
    if priority:
        base_query = base_query.where(Order.priority == priority)

    # বায়ার ফিল্টার
    if buyer:
        base_query = base_query.where(Order.buyer_name == buyer)

    # মোট রেকর্ডের সংখ্যা গণনা
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
    summary="নির্দিষ্ট অর্ডারের বিস্তারিত তথ্য (Get Order Details)",
    description="UUIDv7 আইডি দিয়ে একক অর্ডারের পূর্ণাঙ্গ তথ্য সংগ্রহ করে।",
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
    description="বিদ্যমান অর্ডারের তথ্য আপডেট করে এবং স্বয়ংক্রিয়ভাবে রিভিশন নম্বর বৃদ্ধি করে।",
)
async def update_order(
    order_id: uuid.UUID,
    payload: OrderUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> Order:
    """অর্ডার আপডেট করে এবং current_revision ইনক্রিমেন্ট করে"""
    stmt = select(Order).where(Order.id == order_id, Order.is_deleted.is_(False))
    order = (await db.execute(stmt)).scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' was not found.",
        )

    # যদি PO বা Style পরিবর্তন করা হয়, তবে অন্য কোনো অর্ডারে ডুপ্লিকেট হয় কি না চেক
    new_po = payload.po_number or order.po_number
    new_style = payload.style_code or order.style_code
    if new_po != order.po_number or new_style != order.style_code:
        dup_stmt = select(Order).where(
            Order.po_number == new_po,
            Order.style_code == new_style,
            Order.id != order_id,
            Order.is_deleted.is_(False),
        )
        if (await db.execute(dup_stmt)).scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Another order with PO '{new_po}' and Style '{new_style}' already exists.",
            )

    # আপডেট ফিল্ডগুলো প্রয়োগ
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(order, field, value)

    # রিভিশন নম্বর স্বয়ংক্রিয়ভাবে বৃদ্ধি
    order.current_revision += 1

    await db.commit()
    await db.refresh(order)
    return order


@router.patch(
    "/{order_id}/status",
    response_model=OrderResponse,
    summary="অর্ডার স্ট্যাটাস ট্রানজিশন (Update Order Status)",
    description="অর্ডারের লাইফসাইকেল স্ট্যাটাস (যেমন: PENDING_DESIGN -> DESIGN_APPROVED) পরিবর্তন করে।",
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
        existing_notes = order.notes or ""
        order.notes = f"{existing_notes}\n[Status Change to {payload.status}]: {payload.notes}".strip()

    await db.commit()
    await db.refresh(order)
    return order


@router.delete(
    "/{order_id}",
    status_code=status.HTTP_200_OK,
    summary="অর্ডার সফট-ডিলিট (Soft Delete Order)",
    description="অর্ডারটিকে লজিক্যালি মুছে দেয় (is_deleted = true), কোনো ডেটা ফিজিক্যালি ধ্বংস করা হয় না।",
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
        "message": f"Order '{order.po_number}' has been soft-deleted successfully.",
        "order_id": str(order_id),
    }

