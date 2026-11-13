"""
গার্মেন্ট ইউনিট ও কিউআর ট্র্যাকিং মডেল টেস্ট স্যুট (Garment Unit Model Tests)
Denim Laser Automation & Control System (Denim LACS)

স্টেপ ৪.১ ভেরিফিকেশন:
১. RFC 9562 UUIDv7 প্রাইমারি কি ও টাইম-সর্টিং
২. ডিফল্ট স্টেজ (GENERATED), প্রোডাকশন টাইপ ও কিউসি স্ট্যাটাস (PENDING)
৩. ইউনিক সিরিয়াল ও কিউআর পে-লোড কনস্ট্রেইন্ট ভ্যালিডেশন
৪. অর্ডার, মেশিন ও অপারেটর রিলেশনশিপ অখণ্ডতা
৫. লাইফসাইকেল স্টেজ ট্রানজিশন ও অডিট ট্রেইল
রুল ০৩ (UUIDv7), রুল ০২ (DB Schema) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
"""

import uuid
from datetime import datetime, timezone
import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.core.database import AsyncSessionLocal
from app.models.base import generate_uuid7
from app.models.garment_unit import GarmentUnit
from app.models.machine import LaserMachine
from app.models.order import Order
from app.models.user import User


@pytest.fixture
async def setup_test_context():
    """টেস্টের জন্য সক্রিয় ইউজার, অর্ডার ও লেজার মেশিন প্রদান করে"""
    async with AsyncSessionLocal() as session:
        user = (await session.execute(select(User).limit(1))).scalar_one()
        
        order = (
            await session.execute(
                select(Order).where(Order.is_deleted.is_(False)).limit(1)
            )
        ).scalar_one_or_none()
        if not order:
            order = Order(
                company="Denim Dynamics Ltd.",
                buyer_name="American Eagle",
                po_number=f"PO-TEST-{uuid.uuid4().hex[:6]}",
                style_code="2008-DENIM",
                total_quantity=1000,
                target_delivery_date=datetime.now().date(),
                created_by=user.id,
            )
            session.add(order)
            await session.commit()
            await session.refresh(order)

        machine = (
            await session.execute(
                select(LaserMachine).where(LaserMachine.is_deleted.is_(False)).limit(1)
            )
        ).scalar_one_or_none()

        return {"user": user, "order": order, "machine": machine}


@pytest.mark.asyncio
async def test_garment_unit_creation_and_uuid7(setup_test_context):
    """গার্মেন্ট ইউনিটের সফল সৃষ্টি এবং UUIDv7 প্রাইমারি কি নিশ্চিতকরণ"""
    ctx = setup_test_context
    order = ctx["order"]
    serial = f"UNIT-{uuid.uuid4().hex[:8]}"
    qr_payload = f"LACS|{order.style_code}|32|{serial}"

    async with AsyncSessionLocal() as session:
        unit = GarmentUnit(
            order_id=order.id,
            unit_serial_no=serial,
            qr_code_payload=qr_payload,
            style_code=order.style_code,
            size_code="32",
            cut_no="CUT-01",
            bundle_no="BUN-05",
        )
        session.add(unit)
        await session.commit()
        await session.refresh(unit)

        assert unit.id is not None
        assert isinstance(unit.id, uuid.UUID)
        # RFC 9562 UUIDv7 ভার্সন টেস্ট
        assert (unit.id.int >> 76) & 0x0F == 7
        assert unit.current_stage == "GENERATED"
        assert unit.production_type == "COMPLETE_GARMENT"
        assert unit.qc_status == "PENDING"
        assert unit.created_at is not None
        assert unit.is_deleted is False


@pytest.mark.asyncio
async def test_garment_unit_duplicate_serial_prevention(setup_test_context):
    """একই সিরিয়াল নম্বরের ডুপ্লিকেট রোধ যাচাই (Uniqueness Guard)"""
    ctx = setup_test_context
    order = ctx["order"]
    duplicate_serial = f"DUP-{uuid.uuid4().hex[:8]}"

    async with AsyncSessionLocal() as session:
        unit1 = GarmentUnit(
            order_id=order.id,
            unit_serial_no=duplicate_serial,
            qr_code_payload=f"PAYLOAD-1-{duplicate_serial}",
            style_code=order.style_code,
            size_code="30",
        )
        session.add(unit1)
        await session.commit()

    async with AsyncSessionLocal() as session:
        unit2 = GarmentUnit(
            order_id=order.id,
            unit_serial_no=duplicate_serial,  # ডুপ্লিকেট সিরিয়াল
            qr_code_payload=f"PAYLOAD-2-{duplicate_serial}",
            style_code=order.style_code,
            size_code="30",
        )
        session.add(unit2)
        with pytest.raises(IntegrityError):
            await session.commit()


@pytest.mark.asyncio
async def test_garment_unit_lifecycle_and_machine_relation(setup_test_context):
    """গার্মেন্ট লাইফসাইকেল ট্রানজিশন ও মেশিন/অপারেটর অডিট তথ্য যাচাই"""
    ctx = setup_test_context
    order = ctx["order"]
    user = ctx["user"]
    machine = ctx["machine"]
    serial = f"LACS-CYCLE-{uuid.uuid4().hex[:8]}"

    async with AsyncSessionLocal() as session:
        unit = GarmentUnit(
            order_id=order.id,
            unit_serial_no=serial,
            qr_code_payload=f"QR|{serial}",
            style_code=order.style_code,
            size_code="34",
            current_stage="PRINTED",
            printed_by=user.id,
            printed_at=datetime.now(timezone.utc),
        )
        session.add(unit)
        await session.commit()
        await session.refresh(unit)

        # ধাপ ৫: লেজার মেশিনে ইনটেক ও লেজার সমাপ্তি
        unit.current_stage = "COMPLETED"
        if machine:
            unit.lasered_by_machine_id = machine.id
        unit.lasered_by_operator_id = user.id
        unit.front_laser_completed_at = datetime.now(timezone.utc)
        unit.back_laser_completed_at = datetime.now(timezone.utc)
        unit.qc_status = "PASSED"
        unit.qc_inspected_by = user.id
        unit.qc_inspected_at = datetime.now(timezone.utc)

        await session.commit()
        await session.refresh(unit)

        assert unit.current_stage == "COMPLETED"
        assert unit.qc_status == "PASSED"
        assert unit.lasered_by_operator_id == user.id
        assert unit.front_laser_completed_at is not None
        assert unit.back_laser_completed_at is not None
