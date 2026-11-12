"""
সিস্টেম সিড ডেটা স্ক্রিপ্ট (System Initial Seed Data Script)
Denim Laser Automation & Control System (Denim LACS)

পোস্টগ্রেস ডিবিতে কারখানার ডিফল্ট রোল, পারমিশন এবং টেস্ট অ্যাডমিন ও ফ্লোর অপারেটর তৈরি করে।
"""

import asyncio
from sqlalchemy import select
from loguru import logger

from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash, get_quick_pin_hash
from app.models.base import generate_uuid7
from app.models.machine import LaserMachine, MachineAuthCredential
from app.models.user import Permission, Role, User


async def seed_initial_system_data() -> None:
    """কারখানার প্রারম্ভিক রোল, ইউজার ও মেশিন ডাটাবেজে যুক্ত করে"""
    async with AsyncSessionLocal() as session:
        # ১. রোল চেক ও তৈরি
        roles_to_seed = [
            ("SUPER_ADMIN_CTO", "Product Director / CTO", "Full factory automation access"),
            ("MERCHANDISER", "Merchandiser", "Order entry and size ratio management"),
            ("LASER_DESIGNER", "Laser Designer", "Jeanologia .jean5 recipe vault mapping"),
            ("LASER_OPERATOR", "Laser Table Operator", "Shop-floor machine operation"),
            ("QC_INSPECTOR", "QC Inspector", "Defect audit and wash clearance sign-off"),
        ]

        role_map = {}
        for code, disp, desc in roles_to_seed:
            stmt = select(Role).where(Role.name == code)
            res = await session.execute(stmt)
            role = res.scalar_one_or_none()
            if not role:
                role = Role(
                    id=generate_uuid7(),
                    name=code,
                    display_name=disp,
                    description=desc,
                )
                session.add(role)
                await session.flush()
                logger.info(f"রোল তৈরি: {code}")
            role_map[code] = role

        # ২. প্রাথমিক অ্যাডমিন ইউজার
        stmt_admin = select(User).where(User.username == "admin")
        res_admin = await session.execute(stmt_admin)
        admin = res_admin.scalar_one_or_none()
        if not admin:
            admin = User(
                id=generate_uuid7(),
                username="admin",
                email="admin@denimlacs.local",
                hashed_password=get_password_hash("Password@2026"),
                quick_pin_hash=get_quick_pin_hash("123456"),
                full_name="Tanvir Ahmed (CTO)",
                employee_badge_id="BADGE-ADMIN",
                role_id=role_map["SUPER_ADMIN_CTO"].id,
                is_active=True,
            )
            session.add(admin)
            logger.info("ডিফল্ট অ্যাডমিন তৈরি: admin / Password@2026 / PIN: 123456")

        # ৩. প্রাথমিক ফ্লোর অপারেটর
        stmt_op = select(User).where(User.username == "operator01")
        res_op = await session.execute(stmt_op)
        op = res_op.scalar_one_or_none()
        if not op:
            op = User(
                id=generate_uuid7(),
                username="operator01",
                email="operator01@denimlacs.local",
                hashed_password=get_password_hash("Operator@2026"),
                quick_pin_hash=get_quick_pin_hash("112233"),
                full_name="Md. Rafiqul Islam (Floor)",
                employee_badge_id="BADGE-M01",
                role_id=role_map["LASER_OPERATOR"].id,
                is_active=True,
            )
            session.add(op)
            logger.info("ডিফল্ট ফ্লোর অপারেটর তৈরি: operator01 / PIN: 112233")

        # ৪. ২০টি Jeanologia মেশিনের প্রথম ৪টি স্যাম্পল মেশিন (M01-M04)
        sample_machines = [
            ("M01", "Jeanologia Flat Conveyor #01", "192.168.1.101"),
            ("M02", "Jeanologia Flat Conveyor #02", "192.168.1.102"),
            ("M03", "Jeanologia Flat Conveyor #03", "192.168.1.103"),
            ("M04", "Jeanologia Flat Conveyor #04", "192.168.1.104"),
        ]
        for m_code, m_name, m_ip in sample_machines:
            stmt_m = select(LaserMachine).where(LaserMachine.machine_code == m_code)
            res_m = await session.execute(stmt_m)
            m = res_m.scalar_one_or_none()
            if not m:
                new_m = LaserMachine(
                    id=generate_uuid7(),
                    machine_code=m_code,
                    name=m_name,
                    ip_address=m_ip,
                    is_active=True,
                )
                session.add(new_m)
                logger.info(f"লেজার মেশিন যুক্ত: {m_code} ({m_ip})")

        await session.commit()
        logger.info("✅ প্রাথমিক সিড ডাটা সফলভাবে সংরক্ষিত হয়েছে।")


if __name__ == "__main__":
    asyncio.run(seed_initial_system_data())

