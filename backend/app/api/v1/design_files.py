"""
লেজার ডিজাইন ফাইল ও প্যারামিটার এপিআই (Laser Design Files & Parameters API)
Denim Laser Automation & Control System (Denim LACS)

ফাইল আপলোড, ডাউনলোড/প্রিভিউ, সাইজ ম্যাপিং এবং প্যারামিটার টিউনিং এন্ডপয়েন্টস।
রুল: রেসিপি লক থাকলে অপারেটর প্যারামিটার এডিট করতে পারবে না (403 Forbidden)।
রেসিপি আনলক থাকলে প্যারামিটার এডিট করার পূর্ণ অনুমতি থাকবে।
রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
"""

import uuid
from typing import Literal, Optional
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
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_active_user
from app.core.database import get_db
from app.models.laser_design import LaserDesign, LaserDesignFile
from app.models.user import User
from app.schemas.laser_design import (
    LaserDesignFileParameterUpdate,
    LaserDesignFileResponse,
)
from app.services.vault_storage import (
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
    "/{design_id}/upload-file",
    response_model=LaserDesignFileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="লেজার রেসিপি ফাইল আপলোড ও সাইজ ম্যাপিং",
)
async def upload_design_file(
    design_id: uuid.UUID,
    size_code: str = Form(..., min_length=1, max_length=50),
    placement: Literal["FRONT", "BACK", "PANEL"] = Form(...),
    power_percentage: Optional[float] = Form(None, ge=0.0, le=100.0),
    speed_percentage: Optional[float] = Form(None, ge=0.0, le=100.0),
    cycle_time_estimate_sec: Optional[float] = Form(None, ge=0.0, le=3600.0),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> LaserDesignFileResponse:
    """নির্দিষ্ট সাইজের জন্য ফাইল আপলোড ও ভল্টে সেভ করে"""
    design = await get_design_or_404(db, design_id)
    if design.is_locked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify or upload files to a LOCKED laser recipe.",
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


@router.patch(
    "/{design_id}/files/{file_id}/parameters",
    response_model=LaserDesignFileResponse,
    summary="লেজার ফাইলের প্যারামিটার আপডেট (Operator/Designer Parameter Tuning)",
)
async def update_file_parameters(
    design_id: uuid.UUID,
    file_id: uuid.UUID,
    payload: LaserDesignFileParameterUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> LaserDesignFileResponse:
    """
    লেজার ফাইলের পাওয়ার, স্পিড ও সাইকেল টাইম প্যারামিটার আপডেট করে।
    রুল: রেসিপি লক (LOCKED) থাকলে অপারেটর কোনো প্যারামিটার পরিবর্তন করতে পারবে না (403 Forbidden)।
    রেসিপি আনলক (DRAFT/UNLOCKED) থাকলে প্যারামিটার পরিবর্তন করার পূর্ণ অনুমতি থাকবে।
    """
    design = await get_design_or_404(db, design_id)
    if design.is_locked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot edit laser parameters: Recipe is LOCKED by designer. Operator cannot modify locked recipe parameters.",
        )

    file_stmt = select(LaserDesignFile).where(
        LaserDesignFile.id == file_id,
        LaserDesignFile.design_id == design_id,
        LaserDesignFile.is_deleted.is_(False),
    )
    target_file = (await db.execute(file_stmt)).scalar_one_or_none()
    if not target_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Design file with ID '{file_id}' not found in recipe '{design_id}'.",
        )

    if payload.power_percentage is not None:
        target_file.power_percentage = payload.power_percentage
    if payload.speed_percentage is not None:
        target_file.speed_percentage = payload.speed_percentage
    if payload.cycle_time_estimate_sec is not None:
        target_file.cycle_time_estimate_sec = payload.cycle_time_estimate_sec

    await db.commit()
    await db.refresh(target_file)
    return target_file


@router.get("/files/{file_id}/content", summary="ফাইল কনটেন্ট ডাউনলোড বা প্রিভিউ স্ট্রিম")
async def get_design_file_content(
    file_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    """ভল্ট থেকে নির্দিষ্ট ফাইল স্ট্রিম করে (ইমেজ প্রিভিউ ও ডাউনলোড)"""
    f = (
        await db.execute(
            select(LaserDesignFile).where(
                LaserDesignFile.id == file_id,
                LaserDesignFile.is_deleted.is_(False),
            )
        )
    ).scalar_one_or_none()
    if not f:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design file not found.")

    abs_path = vault_storage_service.resolve_absolute_path(f.file_path)
    if not abs_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Physical file missing from vault.",
        )

    mime = {
        "PNG": "image/png",
        "JPG": "image/jpeg",
        "JPEG": "image/jpeg",
        "WEBP": "image/webp",
        "BMP": "image/bmp",
    }.get(f.file_format.upper(), "application/octet-stream")
    return FileResponse(path=str(abs_path), media_type=mime, filename=f.original_filename)


@router.delete("/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT, summary="ম্যাপ করা ফাইল অপসারণ")
async def delete_design_file(
    file_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    """ভল্ট থেকে ম্যাপ করা নির্দিষ্ট ফাইল মুছে ফেলা (শুধুমাত্র DRAFT রেসিপির জন্য)"""
    f = (
        await db.execute(
            select(LaserDesignFile).where(
                LaserDesignFile.id == file_id,
                LaserDesignFile.is_deleted.is_(False),
            )
        )
    ).scalar_one_or_none()
    if not f:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design file not found.")

    design = await get_design_or_404(db, f.design_id)
    if design.is_locked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete files from a LOCKED recipe.",
        )

    f.is_deleted = True
    await db.commit()
