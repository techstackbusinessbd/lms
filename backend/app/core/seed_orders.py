"""
রিয়েলিস্টিক ডেনিম গার্মেন্টস অর্ডার সিড ডেটা (Realistic Garments Orders Seed)
Denim Laser Automation & Control System (Denim LACS)

পোস্টগ্রেস ডেটাবেজে ৫টি বাস্তবসম্মত ডেনিম পারচেজ অর্ডার যুক্ত করে যাতে ইউআই প্রফেশনাল ও লাইভ দেখায়।
"""

import asyncio
from datetime import date
from sqlalchemy import select
from loguru import logger

from app.core.database import AsyncSessionLocal
from app.models.base import generate_uuid7
from app.models.order import Order
from app.models.user import User


async def seed_garments_orders() -> None:
    async with AsyncSessionLocal() as session:
        # আগের সক্রিয় অর্ডার আছে কি না পরীক্ষা
        res = await session.execute(select(Order).where(Order.is_deleted == False))
        existing = res.scalars().all()
        if len(existing) >= 5:
            logger.info(f"ইতিমধ্যে {len(existing)}টি সক্রিয় অর্ডার রয়েছে।")
            return

        # যেকোনো একটি ইউজার নেওয়া
        res_user = await session.execute(select(User).limit(1))
        user = res_user.scalar_one_or_none()
        if not user:
            logger.error("কোনো ইউজার পাওয়া যায়নি। সিডিং ব্যর্থ।")
            return

        sample_orders = [
            Order(
                id=generate_uuid7(),
                job_no="JOB-2026-0101",
                po_number="PO-LEVI-8849",
                company="Denim Solutions Ltd. Unit-1",
                buyer_name="Levi Strauss & Co.",
                brand="Levi's Red Tab",
                style_code="511 Slim Fit Denim",
                season="Spring/Summer 2026",
                total_quantity=2400,
                uom="PCS",
                target_delivery_date=date(2026, 12, 15),
                dealing_merchant="Tanvir Rahman",
                status="IN_PRODUCTION",
                notes="Laser front whisker and back chevrons on Table #01-#04",
                created_by=user.id,
            ),
            Order(
                id=generate_uuid7(),
                job_no="JOB-2026-0102",
                po_number="PO-HM-7731",
                company="Pacific Jeans Unit-2",
                buyer_name="H&M",
                brand="H&M Divided",
                style_code="Straight 90s Vintage",
                season="Autumn/Winter 2026",
                total_quantity=1800,
                uom="PCS",
                target_delivery_date=date(2026, 11, 30),
                dealing_merchant="Arif Hasan",
                status="DESIGN_APPROVED",
                notes=".jean5 recipe locked. Ready for QR generation.",
                created_by=user.id,
            ),
            Order(
                id=generate_uuid7(),
                job_no="JOB-2026-0103",
                po_number="PO-ZARA-9912",
                company="Denim Solutions Ltd. Unit-1",
                buyer_name="Zara Man",
                brand="Zara Denim Lab",
                style_code="Tapered Cargo Denim",
                season="Fall 2026",
                total_quantity=3200,
                uom="PCS",
                target_delivery_date=date(2027, 1, 10),
                dealing_merchant="Farzana Akter",
                status="PENDING_DESIGN",
                notes="Pattern marker waiting for laser vault upload.",
                created_by=user.id,
            ),
            Order(
                id=generate_uuid7(),
                job_no="JOB-2026-0104",
                po_number="PO-AE-5520",
                company="Ananta Denim Ltd.",
                buyer_name="American Eagle",
                brand="AEO Premium",
                style_code="Ne(X)t Level Flex Air",
                season="Summer 2026",
                total_quantity=5000,
                uom="PCS",
                target_delivery_date=date(2026, 12, 28),
                dealing_merchant="Tanvir Rahman",
                status="IN_PRODUCTION",
                notes="High stretch 12.5oz denim. Light whisker intensity.",
                created_by=user.id,
            ),
            Order(
                id=generate_uuid7(),
                job_no="JOB-2026-0105",
                po_number="PO-GAP-3319",
                company="Pacific Jeans Unit-1",
                buyer_name="GAP Inc.",
                brand="GAP 1969",
                style_code="Classic Bootcut Fit",
                season="Spring 2026",
                total_quantity=1500,
                uom="PCS",
                target_delivery_date=date(2026, 11, 20),
                dealing_merchant="Mahmudul Karim",
                status="COMPLETED",
                notes="100% lasered and QC audit cleared.",
                created_by=user.id,
            ),
        ]

        session.add_all(sample_orders)
        await session.commit()
        logger.info(f"✅ {len(sample_orders)}টি বাস্তবসম্মত এন্টারপ্রাইজ গার্মেন্টস অর্ডার সফলভাবে যুক্ত হয়েছে।")


if __name__ == "__main__":
    asyncio.run(seed_garments_orders())
