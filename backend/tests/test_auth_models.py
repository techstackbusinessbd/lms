"""
ইউজার, রোল ও মেশিন ডেটাবেজ মডেল টেস্ট স্যুট (User, Role & Machine Model Tests)
Denim Laser Automation & Control System (Denim LACS)

এই টেস্ট মডিউলটি ফেজ ১ এর স্টেপ ১.১ অনুযায়ী নিম্নলিখিত বিষয়গুলো যাচাই করে:
১. Role ও Permission মডেলের ওআরএম ম্যাপিং ও মেনি-টু-মেনি রিলেশনশিপ
২. User মডেলের সাথে Role এর ফরেন কি রিলেশনশিপ ও ফিল্ড ভ্যালিডেশন
৩. LaserMachine এবং MachineAuthCredential মডেলের ওআরএম রিলেশনশিপ ও ইনডেক্সিং
৪. প্রতিটি মডেলে RFC 9562 UUIDv7 টাইম-সর্টেড প্রাইমারি কি নিশ্চিতকরণ
"""

import uuid
import pytest
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.base import generate_uuid7
from app.models.machine import LaserMachine, MachineAuthCredential
from app.models.user import Permission, Role, User


@pytest.mark.asyncio
async def test_role_and_permission_crud() -> None:
    """
    Role ও Permission তৈরি, মেনি-টু-মেনি বাইন্ডিং এবং কোয়েরি যাচাইকরণ
    """
    async with AsyncSessionLocal() as session:
        # টেস্ট পারমিশন তৈরি
        perm1 = Permission(
            id=generate_uuid7(),
            name="test:designs:upload",
            display_name="Upload Jean5 File",
            module="designs",
            description="Permission to upload and map .jean5 files",
        )
        perm2 = Permission(
            id=generate_uuid7(),
            name="test:designs:lock",
            display_name="Lock Recipe",
            module="designs",
            description="Permission to lock recipe for production",
        )

        # টেস্ট রোল তৈরি সাথে পারমিশন অ্যাসাইন করা
        role = Role(
            id=generate_uuid7(),
            name="TEST_LASER_DESIGNER",
            display_name="Laser Recipe Designer",
            description="Responsible for Jeanologia .jean5 recipe authoring",
            permissions=[perm1, perm2],
        )
        session.add(role)
        await session.commit()

        # রোল কুয়েরি করে পারমিশন যাচাই
        stmt = select(Role).where(Role.name == "TEST_LASER_DESIGNER")
        result = await session.execute(stmt)
        fetched_role = result.scalar_one()

        assert fetched_role is not None
        assert fetched_role.id.version == 7, "রোলের আইডি অবশ্যই UUIDv7 হতে হবে"
        assert len(fetched_role.permissions) == 2
        perm_names = [p.name for p in fetched_role.permissions]
        assert "test:designs:upload" in perm_names
        assert "test:designs:lock" in perm_names

        # ক্লিনআপ
        await session.delete(fetched_role)
        stmt_p = select(Permission).where(Permission.module == "designs")
        res_p = await session.execute(stmt_p)
        for p in res_p.scalars():
            if p.name.startswith("test:"):
                await session.delete(p)
        await session.commit()


@pytest.mark.asyncio
async def test_user_creation_with_role() -> None:
    """
    ইউজার তৈরি ও রোলের সাথে রিলেশনশিপ সফলভাবে কাজ করছে কি না তা যাচাই
    """
    async with AsyncSessionLocal() as session:
        # রোল তৈরি
        role = Role(
            id=generate_uuid7(),
            name="TEST_QC_INSPECTOR",
            display_name="QC Inspector",
            description="Performs quality audit and lot clearance",
        )
        session.add(role)
        await session.commit()

        # ইউজার তৈরি
        user = User(
            id=generate_uuid7(),
            username="test.inspector01",
            email="test.inspector01@denimfactory.com",
            hashed_password="$argon2id$v=19$m=65536,t=3,p=4$dummy_hash_for_testing",
            quick_pin_hash="$argon2id$v=19$m=65536,t=3,p=4$dummy_pin_hash",
            full_name="Md. Rafiqul Islam",
            employee_badge_id="BADGE-9021",
            role_id=role.id,
            is_active=True,
        )
        session.add(user)
        await session.commit()

        # ইউজার কুয়েরি
        stmt = select(User).where(User.username == "test.inspector01")
        res = await session.execute(stmt)
        fetched_user = res.scalar_one()

        assert fetched_user is not None
        assert fetched_user.id.version == 7, "ইউজারের আইডি অবশ্যই UUIDv7 হতে হবে"
        assert fetched_user.role.name == "TEST_QC_INSPECTOR"
        assert fetched_user.is_active is True
        assert fetched_user.is_deleted is False

        # ক্লিনআপ
        await session.delete(fetched_user)
        await session.delete(role)
        await session.commit()


@pytest.mark.asyncio
async def test_laser_machine_and_credentials() -> None:
    """
    Jeanologia লেজার মেশিন ও এজ-এজেন্ট ক্রেডেনশিয়াল রিলেশনশিপ টেস্ট
    """
    async with AsyncSessionLocal() as session:
        # লেজার মেশিন তৈরি (যেমন M01)
        machine = LaserMachine(
            id=generate_uuid7(),
            machine_code="M99_TEST",
            name="Jeanologia Flat Conveyor #99 (Test)",
            ip_address="192.168.1.199",
            mac_address="00:1A:2B:3C:4D:99",
            is_active=True,
        )
        session.add(machine)
        await session.commit()

        # এজেন্টের ক্রেডেনশিয়াল তৈরি
        cred = MachineAuthCredential(
            id=generate_uuid7(),
            machine_id=machine.id,
            api_token_hash="$argon2id$v=19$m=65536,t=3,p=4$agent_token_hash_test",
            allowed_ip_address="192.168.1.199",
            is_revoked=False,
        )
        session.add(cred)
        await session.commit()

        # মেশিন কুয়েরি করে ক্রেডেনশিয়াল ভেরিফিকেশন
        stmt = select(LaserMachine).where(LaserMachine.machine_code == "M99_TEST")
        res = await session.execute(stmt)
        fetched_machine = res.scalar_one()

        assert fetched_machine is not None
        assert fetched_machine.id.version == 7
        assert len(fetched_machine.credentials) == 1
        assert fetched_machine.credentials[0].allowed_ip_address == "192.168.1.199"
        assert fetched_machine.credentials[0].is_revoked is False

        # ক্লিনআপ (cascade delete will delete credential as well)
        await session.delete(fetched_machine)
        await session.commit()
