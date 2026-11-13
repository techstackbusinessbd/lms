"""
মাস্টার ডাটা এপিআই টেস্ট স্যুট (Master Data API Tests)
Denim Laser Automation & Control System (Denim LACS)

Company, Buyer, Brand, Season CRUD এপিআই এবং ভ্যালিডেশন পরীক্ষা।
রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
"""

import uuid
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select, text

from app.core.database import AsyncSessionLocal
from app.core.security import create_access_token
from app.main import app
from app.models.user import User


@pytest.fixture
async def auth_headers():
    async with AsyncSessionLocal() as session:
        user_stmt = select(User).limit(1)
        user = (await session.execute(user_stmt)).scalar_one()
        token = create_access_token(subject=str(user.id))
        return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_company_crud_lifecycle(auth_headers):
    uid = uuid.uuid4().hex[:6].upper()
    code = f"CO-{uid}"
    name = f"Factory Unit {uid}"

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # ১. কোম্পানি তৈরি (Create)
        create_res = await ac.post(
            "/api/v1/master/companies",
            headers=auth_headers,
            json={
                "code": code,
                "name": name,
                "address": "Dhaka EPZ",
                "is_active": True,
            },
        )
        assert create_res.status_code == 201
        data = create_res.json()
        company_id = data["id"]
        assert data["code"] == code
        assert data["name"] == name

        # ডুপ্লিকেট প্রতিরোধ
        dup_res = await ac.post(
            "/api/v1/master/companies",
            headers=auth_headers,
            json={"code": code, "name": f"Another Name {uid}"},
        )
        assert dup_res.status_code == 400

        # ২. তালিকা অনুসন্ধান (List)
        list_res = await ac.get(f"/api/v1/master/companies?search={uid}", headers=auth_headers)
        assert list_res.status_code == 200
        assert list_res.json()["total"] >= 1

        # ৩. আপডেট (Update)
        update_res = await ac.put(
            f"/api/v1/master/companies/{company_id}",
            headers=auth_headers,
            json={"name": f"{name} Updated"},
        )
        assert update_res.status_code == 200
        assert update_res.json()["name"] == f"{name} Updated"

        # ৪. সফট ডিলিট (Delete)
        del_res = await ac.delete(f"/api/v1/master/companies/{company_id}", headers=auth_headers)
        assert del_res.status_code == 204

        # মুছে ফেলার পর নট ফাউন্ড
        get_res = await ac.get(f"/api/v1/master/companies/{company_id}", headers=auth_headers)
        assert get_res.status_code == 404

    # টেস্ট শেষ হলে ডিবি পরিষ্কার
    async with AsyncSessionLocal() as session:
        await session.execute(text(f"DELETE FROM companies WHERE id = '{company_id}'"))
        await session.commit()


@pytest.mark.asyncio
async def test_buyer_and_brand_crud_lifecycle(auth_headers):
    uid = uuid.uuid4().hex[:6].upper()
    buyer_code = f"BUY-{uid}"
    buyer_name = f"Buyer Corp {uid}"
    brand_code = f"BRD-{uid}"
    brand_name = f"Brand {uid}"

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # ১. বায়ার তৈরি
        buyer_res = await ac.post(
            "/api/v1/master/buyers",
            headers=auth_headers,
            json={
                "code": buyer_code,
                "name": buyer_name,
                "country": "USA",
                "contact_email": f"test@{uid}.com",
            },
        )
        assert buyer_res.status_code == 201
        buyer_data = buyer_res.json()
        buyer_id = buyer_data["id"]

        # ২. ব্র্যান্ড তৈরি (বায়ারের সাথে লিংকড)
        brand_res = await ac.post(
            "/api/v1/master/brands",
            headers=auth_headers,
            json={
                "buyer_id": buyer_id,
                "code": brand_code,
                "name": brand_name,
                "is_active": True,
            },
        )
        assert brand_res.status_code == 201
        brand_data = brand_res.json()
        brand_id = brand_data["id"]
        assert brand_data["buyer_name"] == buyer_name

        # ৩. বায়ার অনুযায়ী ব্র্যান্ড ফিল্টার
        filter_res = await ac.get(f"/api/v1/master/brands?buyer_id={buyer_id}", headers=auth_headers)
        assert filter_res.status_code == 200
        assert filter_res.json()["total"] == 1
        assert filter_res.json()["items"][0]["code"] == brand_code

        # ৪. ব্র্যান্ড আপডেট
        up_res = await ac.put(
            f"/api/v1/master/brands/{brand_id}",
            headers=auth_headers,
            json={"name": f"{brand_name} Premium"},
        )
        assert up_res.status_code == 200
        assert up_res.json()["name"] == f"{brand_name} Premium"

        # ৫. ক্লিনআপ
        await ac.delete(f"/api/v1/master/brands/{brand_id}", headers=auth_headers)
        await ac.delete(f"/api/v1/master/buyers/{buyer_id}", headers=auth_headers)

    async with AsyncSessionLocal() as session:
        await session.execute(text(f"DELETE FROM brands WHERE id = '{brand_id}'"))
        await session.execute(text(f"DELETE FROM buyers WHERE id = '{buyer_id}'"))
        await session.commit()


@pytest.mark.asyncio
async def test_season_crud_lifecycle(auth_headers):
    uid = uuid.uuid4().hex[:6].upper()
    code = f"SS-{uid}"
    name = f"Season {uid}"

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # ১. সিজন তৈরি
        res = await ac.post(
            "/api/v1/master/seasons",
            headers=auth_headers,
            json={"code": code, "name": name, "is_active": True},
        )
        assert res.status_code == 201
        season_id = res.json()["id"]

        # ২. সিজন লিস্ট
        list_res = await ac.get(f"/api/v1/master/seasons?search={uid}", headers=auth_headers)
        assert list_res.status_code == 200
        assert list_res.json()["total"] >= 1

        # ৩. আপডেট
        up_res = await ac.put(
            f"/api/v1/master/seasons/{season_id}",
            headers=auth_headers,
            json={"name": f"{name} 2026"},
        )
        assert up_res.status_code == 200
        assert up_res.json()["name"] == f"{name} 2026"

        # ৪. ডিলিট
        del_res = await ac.delete(f"/api/v1/master/seasons/{season_id}", headers=auth_headers)
        assert del_res.status_code == 204

    async with AsyncSessionLocal() as session:
        await session.execute(text(f"DELETE FROM seasons WHERE id = '{season_id}'"))
        await session.commit()


@pytest.mark.asyncio
async def test_auto_generated_master_codes(auth_headers):
    uid = uuid.uuid4().hex[:6].upper()
    transport = ASGITransport(app=app)
    created_ids = {}

    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # ১. কোম্পানি অটো কোড (CMP-XXXX)
        res_cmp = await ac.post(
            "/api/v1/master/companies",
            headers=auth_headers,
            json={"name": f"Auto Co {uid}"},
        )
        assert res_cmp.status_code == 201
        data_cmp = res_cmp.json()
        assert data_cmp["code"].startswith("CMP-")
        created_ids["company"] = data_cmp["id"]

        # ২. বায়ার অটো কোড (BYR-XXXX)
        res_byr = await ac.post(
            "/api/v1/master/buyers",
            headers=auth_headers,
            json={"name": f"Auto Buyer {uid}"},
        )
        assert res_byr.status_code == 201
        data_byr = res_byr.json()
        assert data_byr["code"].startswith("BYR-")
        created_ids["buyer"] = data_byr["id"]

        # ৩. ব্র্যান্ড অটো কোড (BRD-XXXX)
        res_brd = await ac.post(
            "/api/v1/master/brands",
            headers=auth_headers,
            json={"name": f"Auto Brand {uid}", "buyer_id": created_ids["buyer"]},
        )
        assert res_brd.status_code == 201
        data_brd = res_brd.json()
        assert data_brd["code"].startswith("BRD-")
        created_ids["brand"] = data_brd["id"]

        # ৪. সিজন অটো কোড (SSN-XXXX)
        res_ssn = await ac.post(
            "/api/v1/master/seasons",
            headers=auth_headers,
            json={"name": f"Auto Season {uid}"},
        )
        assert res_ssn.status_code == 201
        data_ssn = res_ssn.json()
        assert data_ssn["code"].startswith("SSN-")
        created_ids["season"] = data_ssn["id"]

    # ক্লিনআপ
    async with AsyncSessionLocal() as session:
        await session.execute(text(f"DELETE FROM brands WHERE id = '{created_ids['brand']}'"))
        await session.execute(text(f"DELETE FROM buyers WHERE id = '{created_ids['buyer']}'"))
        await session.execute(text(f"DELETE FROM companies WHERE id = '{created_ids['company']}'"))
        await session.execute(text(f"DELETE FROM seasons WHERE id = '{created_ids['season']}'"))
        await session.commit()
