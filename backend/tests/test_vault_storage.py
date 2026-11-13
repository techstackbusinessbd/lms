"""
লেজার ডিজাইন ভল্ট স্টোরেজ ও ওআরএম টেস্ট স্যুট (Laser Vault Storage & ORM Tests)
Denim Laser Automation & Control System (Denim LACS)

স্টেপ ৩.১ ভেরিফিকেশন: ফাইল ভ্যালিডেশন, অ্যাটমিক রাইট, SHA-256 হ্যাশিং,
পাথ ট্রাভার্সাল গার্ড এবং PostgreSQL 16 ওআরএম মডেল ইন্টিগ্রেশন পরীক্ষা।
রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
"""

import os
import tempfile
import uuid
from datetime import datetime
from pathlib import Path
import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.base import generate_uuid7
from app.models.laser_design import LaserDesign, LaserDesignFile
from app.models.order import Order
from app.models.user import User
from app.services.vault_storage import (
    FileIntegrityError,
    InvalidFileFormatError,
    LaserVaultStorageService,
    VaultStorageError,
)


@pytest.fixture
def temp_vault():
    """টেস্টিংয়ের জন্য একটি আইসোলেটেড অস্থায়ী ভল্ট ডিরেক্টরি প্রদান করে"""
    with tempfile.TemporaryDirectory() as tmp_dir:
        service = LaserVaultStorageService(base_dir=tmp_dir)
        yield service


def test_vault_file_validation(temp_vault):
    """বৈধ (.jean / .jean5) এবং অবৈধ ফরম্যাট ভ্যালিডেশন টেস্ট"""
    mock_jean5_content = b"JEAN5_BINARY_MOCK_HEADER_DATA_123456"

    # ১. বৈধ .jean5 এবং .jean ফাইল
    ext1 = temp_vault.validate_file("511_front_sz32.jean5", mock_jean5_content)
    assert ext1 == ".jean5"

    ext2 = temp_vault.validate_file("legacy_pattern.jean", mock_jean5_content)
    assert ext2 == ".jean"

    # ২. অননুমোদিত এক্সটেনশন রিজেকশন (.exe, .txt, .pdf)
    with pytest.raises(InvalidFileFormatError):
        temp_vault.validate_file("malicious.exe", mock_jean5_content)

    with pytest.raises(InvalidFileFormatError):
        temp_vault.validate_file("document.pdf", mock_jean5_content)

    # ৩. খালি ফাইল (0 bytes) রিজেকশন
    with pytest.raises(VaultStorageError):
        temp_vault.validate_file("empty.jean5", b"")


def test_vault_atomic_save_and_read(temp_vault):
    """অ্যাটমিক ফাইল সেভ, রিড ও SHA-256 হ্যাশ ইন্টিগ্রিটি টেস্ট"""
    order_id = generate_uuid7()
    design_id = generate_uuid7()
    mock_content = b"JEANOLOGIA_EMARK_MOCK_RECIPE_PAYLOAD_ABC"

    # ফাইল সেভ
    result = temp_vault.save_design_file(
        order_id=order_id,
        design_id=design_id,
        placement="FRONT",
        size_code="32",
        original_filename="511_Front_32.jean5",
        content=mock_content,
    )

    assert result["file_format"] == "JEAN5"
    assert result["file_size_bytes"] == len(mock_content)
    assert len(result["file_hash_sha256"]) == 64
    assert Path(result["absolute_path"]).is_file()

    # রিড ও ভেরিফিকেশন
    read_bytes = temp_vault.read_design_file(result["file_path"])
    assert read_bytes == mock_content

    # ইন্টিগ্রিটি চেক
    assert temp_vault.verify_file_integrity(result["file_path"], result["file_hash_sha256"]) is True

    # অসঙ্গতিপূর্ণ হ্যাশ দিলে FileIntegrityError ছুঁড়ে মারা
    with pytest.raises(FileIntegrityError):
        temp_vault.verify_file_integrity(result["file_path"], "0000000000000000000000000000000000000000000000000000000000000000")


def test_vault_path_traversal_prevention(temp_vault):
    """ডিরেক্টরি বা পাথ ট্রাভার্সাল অ্যাটাক প্রতিরোধ টেস্ট"""
    with pytest.raises(VaultStorageError) as exc_info:
        temp_vault.resolve_absolute_path("../../etc/passwd")
    assert "Path traversal" in str(exc_info.value)


@pytest.mark.asyncio
async def test_laser_design_orm_lifecycle():
    """PostgreSQL 16-এ LaserDesign এবং LaserDesignFile ওআরএম মডেল টেস্ট"""
    async with AsyncSessionLocal() as db_session:
        # ১. বিদ্যমান ডামি ইউজার ও অর্ডার অনুসন্ধান
        user_stmt = select(User).limit(1)
        user = (await db_session.execute(user_stmt)).scalar_one()

        order_stmt = select(Order).limit(1)
        order = (await db_session.execute(order_stmt)).scalar_one_or_none()

        if not order:
            order = Order(
                company="Denim Solutions Ltd.",
                buyer_name="Levi's",
                po_number="PO-TEST-DESIGN-01",
                style_code="511-SLIM",
                total_quantity=5000,
                target_delivery_date=datetime.now().date(),
                created_by=user.id,
            )
            db_session.add(order)
            await db_session.commit()
            await db_session.refresh(order)

        # ২. নতুন LaserDesign তৈরি
        design = LaserDesign(
            order_id=order.id,
            style_code=order.style_code,
            recipe_name="511 Slim Whisker Wash v1",
            version=1,
            status="DRAFT",
            is_locked=False,
        )
        db_session.add(design)
        await db_session.commit()
        await db_session.refresh(design)

        assert design.id is not None
        assert design.status == "DRAFT"
        assert design.version == 1

        # ৩. সংশ্লিষ্ট LaserDesignFile তৈরি (Front এবং Back Two-Step)
        file_front = LaserDesignFile(
            design_id=design.id,
            size_code="32",
            placement="FRONT",
            file_format="JEAN5",
            original_filename="511_Front_32.jean5",
            file_path=f"orders/{order.id}/designs/{design.id}/FRONT_32_abcd1234.jean5",
            file_size_bytes=102400,
            file_hash_sha256="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            power_percentage=85.0,
            speed_percentage=90.0,
            cycle_time_estimate_sec=42.5,
        )

        file_back = LaserDesignFile(
            design_id=design.id,
            size_code="32",
            placement="BACK",
            file_format="JEAN5",
            original_filename="511_Back_32.jean5",
            file_path=f"orders/{order.id}/designs/{design.id}/BACK_32_ef015678.jean5",
            file_size_bytes=98304,
            file_hash_sha256="ca978112ca1bbdcafac231b39a23dc4da7860819c196610214e42fb947037f13",
            power_percentage=80.0,
            speed_percentage=95.0,
            cycle_time_estimate_sec=38.0,
        )

        db_session.add_all([file_front, file_back])
        await db_session.commit()

        # ৪. কুয়েরি ও রিলেশনশিপ ভেরিফিকেশন (selectinload সহ)
        from sqlalchemy.orm import selectinload
        target_design_id = design.id
        db_session.expire_all()

        query = select(LaserDesign).options(selectinload(LaserDesign.files)).where(LaserDesign.id == target_design_id)
        retrieved_design = (await db_session.execute(query)).scalar_one()

        assert len(retrieved_design.files) == 2
        placements = {f.placement for f in retrieved_design.files}
        assert "FRONT" in placements
        assert "BACK" in placements

        # ৫. রেসিপি লকিং (Recipe Lock) সিমুলেশন
        retrieved_design.is_locked = True
        retrieved_design.status = "LOCKED"
        retrieved_design.locked_by = user.id
        retrieved_design.locked_at = datetime.now()
        await db_session.commit()

        # রি-কোয়েরি করে ভেরিফাই করা
        verify_query = select(LaserDesign).where(LaserDesign.id == target_design_id)
        locked_design = (await db_session.execute(verify_query)).scalar_one()
        assert locked_design.is_locked is True
        assert locked_design.status == "LOCKED"

        # ক্লিনআপ
        await db_session.delete(locked_design)
        await db_session.commit()
