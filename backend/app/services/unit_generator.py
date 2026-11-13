"""
বাল্ক গার্মেন্ট ইউনিট জেনারেশন ইঞ্জিন (Bulk Garment Unit Generation Engine)
Denim Laser Automation & Control System (Denim LACS)

অর্ডারের সাইজ রেশিও অনুযায়ী স্বয়ংক্রিয় ইউনিক সিরিয়াল ও কিউআর পে-লোড তৈরি এবং বাল্ক ইনসার্ট।
রুল ০৩ (UUIDv7), রুল ০৫ (Sub-100ms) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
"""

import re
import uuid
from typing import Dict, List, Optional
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.garment_unit import GarmentUnit
from app.models.order import Order
from app.services.qr_engine import build_qr_payload


class UnitGenerationError(Exception):
    """গার্মেন্ট ইউনিট জেনারেশন ব্যর্থতার কাস্টম এক্সেপশন"""
    pass


async def get_next_serial_sequence(
    db: AsyncSession,
    style_code: str,
    size_code: str,
) -> int:
    """
    নির্দিষ্ট স্টাইল ও সাইজের জন্য পরবর্তী ক্রমিক সংখ্যা (Sequence Number) নির্ণয় করে।
    পূর্বে তৈরি সিরিয়ালের সর্বোচ্চ নম্বর খুঁজে পরবর্তী নম্বর শুরু করে।
    """
    prefix = f"{style_code.strip()}-{size_code.strip()}-"
    stmt = (
        select(GarmentUnit.unit_serial_no)
        .where(
            GarmentUnit.style_code == style_code,
            GarmentUnit.size_code == size_code,
            GarmentUnit.is_deleted.is_(False),
        )
        .order_by(GarmentUnit.created_at.desc())
        .limit(50)
    )
    serials = (await db.execute(stmt)).scalars().all()
    max_seq = 0
    pattern = re.compile(rf"^{re.escape(prefix)}(\d+)$")

    for s in serials:
        m = pattern.match(s)
        if m:
            val = int(m.group(1))
            if val > max_seq:
                max_seq = val

    return max_seq + 1


async def batch_generate_garment_units(
    db: AsyncSession,
    order: Order,
    size_quantities: Dict[str, int],
    production_type: str = "COMPLETE_GARMENT",
    cut_no: Optional[str] = None,
    bundle_no: Optional[str] = None,
) -> Dict:
    """
    অর্ডারের সাইজ অনুযায়ী এক ক্লিকে শত শত প্যান্টের সিরিয়াল ও কিউআর কোড প্রস্তুত করে।
    সাব-১০০ms পারফরম্যান্সের জন্য বাল্ক লিস্ট তৈরি ও অ্যাটমিক ডাটাবেজ কমিট।
    """
    if not size_quantities:
        raise UnitGenerationError("Size quantities dictionary cannot be empty.")

    units_to_create: List[GarmentUnit] = []
    generated_breakdown: Dict[str, int] = {}
    sample_first_serial: Optional[str] = None
    sample_last_serial: Optional[str] = None

    for size_code, qty in size_quantities.items():
        if qty <= 0:
            continue
        clean_size = str(size_code).strip().upper()
        current_seq = await get_next_serial_sequence(db, order.style_code, clean_size)

        for i in range(qty):
            seq_num = current_seq + i
            serial_no = f"{order.style_code}-{clean_size}-{seq_num:05d}"
            payload = build_qr_payload(
                style_code=order.style_code,
                size_code=clean_size,
                unit_serial_no=serial_no,
                production_type=production_type,
            )

            unit = GarmentUnit(
                order_id=order.id,
                unit_serial_no=serial_no,
                qr_code_payload=payload,
                style_code=order.style_code,
                size_code=clean_size,
                production_type=production_type,
                cut_no=cut_no,
                bundle_no=bundle_no,
                current_stage="GENERATED",
            )
            units_to_create.append(unit)

            if not sample_first_serial:
                sample_first_serial = serial_no
            sample_last_serial = serial_no

        generated_breakdown[clean_size] = qty

    if not units_to_create:
        raise UnitGenerationError("No valid garment units could be generated with given quantities.")

    # বাল্ক অ্যাড ও কমিট
    db.add_all(units_to_create)
    await db.commit()

    return {
        "order_id": order.id,
        "style_code": order.style_code,
        "total_generated": len(units_to_create),
        "by_size": generated_breakdown,
        "first_serial": sample_first_serial,
        "last_serial": sample_last_serial,
    }

