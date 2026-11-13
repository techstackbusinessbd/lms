"""
লেজার ডিজাইন ভল্ট ও রেসিপি লক এপিআই এন্ডপয়েন্টস (Laser Design Vault Endpoints)
Denim Laser Automation & Control System (Denim LACS)

Jeanologia eMark (.jean এবং .jean5) রেসিপি আপলোড, সাইজ ম্যাপিং ও
প্রোডাকশনের জন্য রেসিপি লক (Recipe Lock Gate) পরিচালনার এন্ডপয়েন্টসমূহ।
রুল ০৪ (<300 Lines), রুল ০৫ (Sub-100ms) এবং রুল ২৩ (Pydantic v2) মেনে প্রস্তুতকৃত।
"""

import uuid
from typing import List, Literal, Optional
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_active_user
from app.core.database import get_db
from app.models.laser_design import LaserDesign, LaserDesignFile
from app.models.order import Order
from app.models.user import User
from app.schemas.laser_design import (
    LaserDesignCreate,
    LaserDesignFileResponse,
    LaserDesignResponse,
    RecipeLockRequest,
)
from app.services.vault_storage import (
    FileIntegrityError,
    InvalidFileFormatError,
    VaultStorageError,
    vault_storage_service,
)

router = APIRouter()


async def get_design_or_404(db: AsyncSession, design_id: uuid.UUID) -> LaserDesign:
    """আইডি অনুযায়ী লেজার ডিজাইন এবং সংযুক্ত সাইজ ফাইল অনুসন্ধান করে"""
    stmt = (
        select(LaserDesign)
        .options(selectinload(LaserDesign.files))
        .where(LaserDesign.id == design_id, LaserDesign.is_deleted.is_(False))
    )
    design = (await db.execute(stmt)).scalar_one_or_none()
    if not design:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Laser design recipe with ID '{design_id}' not found.",
        )
    return design


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
    order = (await db.execute(select(Order).where(Order.id == payload.order_id, Order.is_deleted.is_(False)))).scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Order '{payload.order_id}' not found.")

    max_ver = (await db.execute(select(func.max(LaserDesign.version)).where(LaserDesign.order_id == payload.order_id, LaserDesign.is_deleted.is_(False)))).scalar() or 0
    new_design = LaserDesign(
        order_id=payload.order_id, style_code=payload.style_code or order.style_code,
        recipe_name=payload.recipe_name, version=max_ver + 1, status="DRAFT", is_locked=False, notes=payload.notes,
    )
    db.add(new_design)
    await db.commit()
    return await get_design_or_404(db, new_design.id)


@router.post(
    "/{design_id}/upload-file",
    response_model=LaserDesignFileResponse,
    status_code=status.HTTP_201_CREATED,
    summary=".jean5 / .jean রেসিপি ফাইল আপলোড ও সাইজ ম্যাপিং",
)
async def upload_design_file(
    design_id: uuid.UUID,
    file: UploadFile = File(..., description="Jeanologia .jean বা .jean5 ফাইল"),
    size_code: str = Form(..., min_length=1, max_length=50),
    placement: Literal["FRONT", "BACK", "PANEL"] = Form(...),
    power_percentage: Optional[float] = Form(None, ge=0.0, le=100.0),
    speed_percentage: Optional[float] = Form(None, ge=0.0, le=100.0),
    cycle_time_estimate_sec: Optional[float] = Form(None, ge=0.0),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> LaserDesignFileResponse:
    """লেজার রেসিপি ফাইল ভল্টে আপলোড এবং নির্দিষ্ট সাইজে ম্যাপ করে"""
    design = await get_design_or_404(db, design_id)
    if design.is_locked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify or upload files to a LOCKED laser recipe. Please create a new revision.",
        )

    try:
        content = await file.read()
        storage_meta = vault_storage_service.save_design_file(
            order_id=design.order_id,
            design_id=design.id,
            placement=placement,
            size_code=size_code,
            original_filename=file.filename or f"recipe_{size_code}.jean5",
            content=content,
        )
    except (InvalidFileFormatError, VaultStorageError) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    file_stmt = select(LaserDesignFile).where(
        LaserDesignFile.design_id == design.id,
        LaserDesignFile.size_code == size_code,
        LaserDesignFile.placement == placement,
        LaserDesignFile.is_deleted.is_(False),
    )
    existing_file = (await db.execute(file_stmt)).scalar_one_or_none()

    if existing_file:
        existing_file.file_path = storage_meta["file_path"]
        existing_file.file_size_bytes = storage_meta["file_size_bytes"]
        existing_file.file_hash_sha256 = storage_meta["file_hash_sha256"]
        existing_file.original_filename = file.filename or existing_file.original_filename
        existing_file.file_format = storage_meta["file_format"]
        existing_file.power_percentage = power_percentage
        existing_file.speed_percentage = speed_percentage
        existing_file.cycle_time_estimate_sec = cycle_time_estimate_sec
        target_file = existing_file
    else:
        new_file = LaserDesignFile(
            design_id=design.id,
            size_code=size_code,
            placement=placement,
            file_format=storage_meta["file_format"],
            original_filename=file.filename or f"recipe_{size_code}.jean5",
            file_path=storage_meta["file_path"],
            file_size_bytes=storage_meta["file_size_bytes"],
            file_hash_sha256=storage_meta["file_hash_sha256"],
            power_percentage=power_percentage,
            speed_percentage=speed_percentage,
            cycle_time_estimate_sec=cycle_time_estimate_sec,
        )
        db.add(new_file)
        target_file = new_file

    await db.commit()
    await db.refresh(target_file)
    return target_file


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
    """লেজার রেসিপি চূড়ান্ত লক করে যাতে শপ-ফ্লোরে অপারেশনের আগে প্যারামিটার অপরিবর্তনীয় থাকে"""
    design = await get_design_or_404(db, design_id)
    if design.is_locked:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Recipe is already locked.")
    if not design.files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot lock recipe without at least one mapped .jean5 file.",
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
    designs = (await db.execute(stmt)).scalars().all()
    return list(designs)


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
    max_ver = (await db.execute(select(func.max(LaserDesign.version)).where(LaserDesign.order_id == source_design.order_id, LaserDesign.is_deleted.is_(False)))).scalar() or source_design.version
    new_design = LaserDesign(
        order_id=source_design.order_id, style_code=source_design.style_code,
        recipe_name=f"{source_design.recipe_name} (v{max_ver + 1})", version=max_ver + 1,
        status="DRAFT", is_locked=False, notes=f"Revision of version {source_design.version}",
    )
    db.add(new_design)
    await db.commit()
    return await get_design_or_404(db, new_design.id)


@router.get("/files/{file_id}/content", summary="ফাইল কনটেন্ট ডাউনলোড বা প্রিভিউ স্ট্রিম")
async def get_design_file_content(
    file_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    """ভল্ট থেকে নির্দিষ্ট ফাইল স্ট্রিম করে (ইমেজ প্রিভিউ ও ডাউনলোড)"""
    stmt = select(LaserDesignFile).where(LaserDesignFile.id == file_id, LaserDesignFile.is_deleted.is_(False))
    f = (await db.execute(stmt)).scalar_one_or_none()
    if not f:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design file not found.")

    abs_path = vault_storage_service.resolve_absolute_path(f.file_path)
    if not abs_path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Physical file missing from vault.")

    mime = {
        "PNG": "image/png", "JPG": "image/jpeg", "JPEG": "image/jpeg",
        "WEBP": "image/webp", "BMP": "image/bmp",
    }.get(f.file_format.upper(), "application/octet-stream")
    return FileResponse(path=str(abs_path), media_type=mime, filename=f.original_filename)


@router.delete("/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT, summary="ম্যাপ করা ফাইল অপসারণ")
async def delete_design_file(
    file_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    """ভল্ট থেকে ম্যাপ করা নির্দিষ্ট ফাইল মুছে ফেলা (শুধুমাত্র DRAFT রেসিপির জন্য)"""
    stmt = select(LaserDesignFile).where(LaserDesignFile.id == file_id, LaserDesignFile.is_deleted.is_(False))
    f = (await db.execute(stmt)).scalar_one_or_none()
    if not f:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design file not found.")

    design = await get_design_or_404(db, f.design_id)
    if design.is_locked:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete files from a LOCKED recipe.")

    f.is_deleted = True
    await db.commit()
