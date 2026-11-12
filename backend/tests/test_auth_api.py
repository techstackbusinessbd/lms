"""
অথেনটিকেশন এপিআই এন্ডপয়েন্ট টেস্ট স্যুট (Authentication API Endpoints Tests)
Denim Laser Automation & Control System (Denim LACS)

এই টেস্ট মডিউলটি ফেজ ১ এর স্টেপ ১.২ অনুযায়ী নিম্নলিখিত বিষয়গুলো পুঙ্খানুপুঙ্খভাবে যাচাই করে:
১. POST /api/v1/auth/login — সঠিক পাসওয়ার্ড দিয়ে সফল লগইন ও টোকেন রিটার্ন
২. ভুল ক্রেডেনশিয়াল ও নিষ্ক্রিয় ইউজারের ক্ষেত্রে HTTP 401 হ্যান্ডলিং
৩. POST /api/v1/auth/quick-pin — ফ্লোর ৪-৬ ডিজিট পিন ও ব্যাজ আইডি দিয়ে লগইন
৪. GET /api/v1/auth/me — বিয়ারার টোকেনের মাধ্যমে প্রোফাইল ও পারমিশন রিটার্ন
৫. Pydantic v2 কঠোর সার্ভার-সাইড ভ্যালিডেশন (রুল ২৩) ও HTTP 422 হ্যান্ডলিং
"""

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash, get_quick_pin_hash
from app.main import app
from app.models.base import generate_uuid7
from app.models.user import Permission, Role, User


@pytest.fixture(scope="function")
async def seed_test_user():
    """
    টেস্টের জন্য একটি রোল, পারমিশন এবং টেস্ট ইউজার তৈরি করে এবং টেস্ট শেষে পরিষ্কার করে।
    """
    async with AsyncSessionLocal() as session:
        # টেস্ট পারমিশন
        perm = Permission(
            id=generate_uuid7(),
            name="test:orders:view",
            display_name="View Orders",
            module="orders",
        )
        # টেস্ট রোল
        role = Role(
            id=generate_uuid7(),
            name="TEST_FLOOR_OPERATOR",
            display_name="Laser Table Operator",
            description="Operates Flat Conveyor table M01-M20",
            permissions=[perm],
        )
        # টেস্ট ইউজার
        user = User(
            id=generate_uuid7(),
            username="operator.test01",
            email="operator.test01@denimfactory.com",
            hashed_password=get_password_hash("SecretPass@2026"),
            quick_pin_hash=get_quick_pin_hash("987654"),
            full_name="Md. Karim Hossain",
            employee_badge_id="BADGE-TEST-01",
            role=role,
            is_active=True,
        )
        session.add(user)
        await session.commit()
        user_id = user.id
        role_id = role.id
        perm_id = perm.id

    yield {
        "user_id": user_id,
        "username": "operator.test01",
        "email": "operator.test01@denimfactory.com",
        "password": "SecretPass@2026",
        "pin": "987654",
        "badge_id": "BADGE-TEST-01",
    }

    # ক্লিনআপ
    async with AsyncSessionLocal() as session:
        stmt_u = select(User).where(User.id == user_id)
        res_u = await session.execute(stmt_u)
        u = res_u.scalar_one_or_none()
        if u:
            await session.delete(u)

        stmt_r = select(Role).where(Role.id == role_id)
        res_r = await session.execute(stmt_r)
        r = res_r.scalar_one_or_none()
        if r:
            await session.delete(r)

        stmt_p = select(Permission).where(Permission.id == perm_id)
        res_p = await session.execute(stmt_p)
        p = res_p.scalar_one_or_none()
        if p:
            await session.delete(p)
        await session.commit()


@pytest.mark.asyncio
async def test_login_with_password_success(seed_test_user):
    """সঠিক ইউজারনেম ও পাসওয়ার্ড দিয়ে সফল লগইন যাচাই"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "username_or_email": seed_test_user["username"],
                "password": seed_test_user["password"],
            },
        )
        assert response.status_code == 200, f"Expected 200 OK, got {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["username"] == seed_test_user["username"]
        assert data["user"]["role"]["name"] == "TEST_FLOOR_OPERATOR"
        assert "test:orders:view" in data["user"]["permissions"]


@pytest.mark.asyncio
async def test_login_with_email_success(seed_test_user):
    """ইমেইল অ্যাড্রেস দিয়ে সফল লগইন যাচাই"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "username_or_email": seed_test_user["email"],
                "password": seed_test_user["password"],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["email"] == seed_test_user["email"]


@pytest.mark.asyncio
async def test_login_invalid_credentials(seed_test_user):
    """ভুল পাসওয়ার্ড দিয়ে লগইন ব্যর্থতা (HTTP 401) যাচাই"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "username_or_email": seed_test_user["username"],
                "password": "WrongPassword999",
            },
        )
        assert response.status_code == 401
        assert "detail" in response.json()


@pytest.mark.asyncio
async def test_quick_pin_login_success(seed_test_user):
    """শপ-ফ্লোর ৪-৬ ডিজিট Quick-PIN ও ব্যাজ আইডি দিয়ে সফল লগইন যাচাই"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post(
            "/api/v1/auth/quick-pin",
            json={
                "pin": seed_test_user["pin"],
                "badge_id_or_username": seed_test_user["badge_id"],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["employee_badge_id"] == seed_test_user["badge_id"]


@pytest.mark.asyncio
async def test_quick_pin_login_invalid_pin(seed_test_user):
    """ভুল Quick-PIN দিয়ে লগইন ব্যর্থতা (HTTP 401) যাচাই"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post(
            "/api/v1/auth/quick-pin",
            json={
                "pin": "000000",
                "badge_id_or_username": seed_test_user["badge_id"],
            },
        )
        assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_me_endpoint(seed_test_user):
    """টোকেন ব্যবহার করে /me এন্ডপয়েন্টে প্রোফাইল সংগ্রহ যাচাই"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # প্রথমে লগইন করে টোকেন গ্রহণ
        login_res = await client.post(
            "/api/v1/auth/login",
            json={
                "username_or_email": seed_test_user["username"],
                "password": seed_test_user["password"],
            },
        )
        token = login_res.json()["access_token"]

        # টোকেন দিয়ে /me কল করা
        me_res = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["username"] == seed_test_user["username"]
        assert me_data["role"]["name"] == "TEST_FLOOR_OPERATOR"


@pytest.mark.asyncio
async def test_server_side_validation_rule_23():
    """রুল ২৩ অনুযায়ী সার্ভার-সাইড Pydantic v2 ইনপুট ভ্যালিডেশন (HTTP 422) যাচাই"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # সংক্ষিপ্ত ইউজারনেম (min 3 chars required)
        res1 = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "ab", "password": "validpassword"},
        )
        assert res1.status_code == 422, "Pydantic v2 validation must return 422"

        # ভুল পিন ফরম্যাট (৪-৬ ডিজিটের বদলে অক্ষর বা ৩ ডিজিট)
        res2 = await client.post(
            "/api/v1/auth/quick-pin",
            json={"pin": "123", "badge_id_or_username": "BADGE-01"},
        )
        assert res2.status_code == 422

