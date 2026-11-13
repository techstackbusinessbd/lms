"""
কিউআর কোড জেনারেশন ও থার্মাল ZPL এপিআই টেস্ট স্যুট (QR & Unit API Tests)
Denim Laser Automation & Control System (Denim LACS)

স্টেপ ৪.২ ভেরিফিকেশন:
১. POST /api/v1/units/generate — সাইজ রেশিও অনুযায়ী বাল্ক সিরিয়াল ও কিউআর জেনারেশন
২. GET /api/v1/units/order/{id} — পেজিনেটেড তালিকা ও ফিল্টারিং
৩. GET /api/v1/units/{id}/qr-png — পিএনজি ইমেজ স্ট্রিমিং ভ্যালিডেশন
৪. POST /api/v1/units/batch-zpl — জেব্রা থার্মাল ZPL প্রিন্ট স্পুল ভেরিফিকেশন
৫. POST /api/v1/units/mark-printed — প্রিন্ট স্টেজ আপডেট ও অডিট ট্রেইল
৬. GET /api/v1/units/scan-lookup/{query} — ক্যামেরা স্ক্যানার তাৎক্ষণিক লুকআপ (Sub-10ms)
রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
"""

import uuid
from datetime import datetime
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.security import create_access_token
from app.main import app
from app.models.garment_unit import GarmentUnit
from app.models.order import Order
from app.models.user import User


@pytest.fixture
async def auth_headers():
    """অথেনটিকেশন টোকেন হেডার প্রস্তুত করে"""
    async with AsyncSessionLocal() as session:
        user = (await session.execute(select(User).limit(1))).scalar_one()
        token = create_access_token(subject=str(user.id))
        return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def test_order_for_units():
    """টেস্টের জন্য সক্রিয় অর্ডার রিটার্ন করে এবং পরীক্ষা শেষে ক্লিনআপ করে"""
    async with AsyncSessionLocal() as session:
        user = (await session.execute(select(User).limit(1))).scalar_one()
        order = Order(
            company="Denim Global Ltd.",
            buyer_name="American Eagle",
            po_number=f"PO-QR-{uuid.uuid4().hex[:6]}",
            job_no=f"JOB-QR-{uuid.uuid4().hex[:6].upper()}",
            style_code=f"STYLE-{uuid.uuid4().hex[:4].upper()}",
            total_quantity=2000,
            target_delivery_date=datetime.now().date(),
            created_by=user.id,
        )
        session.add(order)
        await session.commit()
        await session.refresh(order)
        order_id = order.id

    yield order

    async with AsyncSessionLocal() as session:
        from sqlalchemy import text
        await session.execute(text(f"DELETE FROM garment_units WHERE order_id = '{order_id}'"))
        await session.execute(text(f"DELETE FROM orders WHERE id = '{order_id}'"))
        await session.commit()


@pytest.mark.asyncio
async def test_batch_generate_units_api(auth_headers, test_order_for_units):
    """বাল্ক কিউআর ও সিরিয়াল জেনারেশন এপিআই ভ্যালিডেশন"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        order = test_order_for_units
        res = await client.post(
            "/api/v1/units/generate",
            json={
                "order_id": str(order.id),
                "size_quantities": {"28": 3, "30": 5, "32": 4},
                "production_type": "COMPLETE_GARMENT",
                "cut_no": "CUT-101",
                "bundle_no": "BUN-202",
            },
            headers=auth_headers,
        )
        assert res.status_code == 201
        data = res.json()
        assert data["order_id"] == str(order.id)
        assert data["total_generated"] == 12
        assert data["by_size"] == {"28": 3, "30": 5, "32": 4}
        assert data["first_serial"] is not None
        assert data["last_serial"] is not None


@pytest.mark.asyncio
async def test_units_query_and_scan_lookup(auth_headers, test_order_for_units):
    """অর্ডার অনুযায়ী ইউনিট তালিকা, পিএনজি স্ট্রিম ও স্ক্যানার লুকআপ টেস্ট"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        order = test_order_for_units
        # ১. ৫টি ইউনিট তৈরি
        gen_res = await client.post(
            "/api/v1/units/generate",
            json={
                "order_id": str(order.id),
                "size_quantities": {"34": 5},
                "production_type": "COMPLETE_GARMENT",
            },
            headers=auth_headers,
        )
        assert gen_res.status_code == 201

        # ২. সাইজ ফিল্টারসহ তালিকা কোয়েরি
        list_res = await client.get(
            f"/api/v1/units/order/{order.id}?size=34",
            headers=auth_headers,
        )
        assert list_res.status_code == 200
        list_data = list_res.json()
        assert list_data["total"] == 5
        assert len(list_data["items"]) == 5
        sample_unit = list_data["items"][0]
        unit_id = sample_unit["id"]
        qr_payload = sample_unit["qr_code_payload"]

        # ৩. কিউআর পিএনজি ইমেজ স্ট্রিমিং
        qr_png_res = await client.get(
            f"/api/v1/units/{unit_id}/qr-png",
            headers=auth_headers,
        )
        assert qr_png_res.status_code == 200
        assert qr_png_res.headers["content-type"] == "image/png"
        assert qr_png_res.content[:8] == b"\x89PNG\r\n\x1a\n"

        # ৪. ক্যামেরা স্ক্যানার লুকআপ (Sub-10ms)
        scan_res = await client.get(
            f"/api/v1/units/scan-lookup/{qr_payload}",
            headers=auth_headers,
        )
        assert scan_res.status_code == 200
        scanned = scan_res.json()
        assert scanned["id"] == unit_id
        assert scanned["size_code"] == "34"
        assert scanned["style_code"] == order.style_code

        # ৫. থার্মাল ZPL প্রিন্ট স্পুল জেনারেশন
        zpl_res = await client.post(
            "/api/v1/units/batch-zpl",
            json=[unit_id],
            headers=auth_headers,
        )
        assert zpl_res.status_code == 200
        zpl_data = zpl_res.json()
        assert "^XA" in zpl_data["zpl_data"]
        assert "^BQN" in zpl_data["zpl_data"]
        assert "^XZ" in zpl_data["zpl_data"]

        # ৬. প্রিন্ট সম্পন্ন হিসেবে মার্ক করা
        mark_res = await client.post(
            "/api/v1/units/mark-printed",
            json=[unit_id],
            headers=auth_headers,
        )
        assert mark_res.status_code == 200
        assert mark_res.json()["updated_count"] == 1

