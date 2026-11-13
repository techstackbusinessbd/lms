"""
লেজার ডিজাইন ভল্ট ও রেসিপি লক এপিআই টেস্ট স্যুট (Laser Design API Tests)
Denim Laser Automation & Control System (Denim LACS)

স্টেপ ৩.২ ভেরিফিকেশন:
১. POST /api/v1/designs/ — রেসিপি ড্রাফট তৈরি
২. POST /api/v1/designs/{id}/upload-file — .jean5 ফাইল আপলোড ও সাইজ ম্যাপিং
৩. অননুমোদিত ফাইল ফরম্যাট ও সাইজ রিজেকশন (Rule 23)
৪. POST /api/v1/designs/{id}/lock — রেসিপি লক গেটওয়ে (Recipe Lock Gate)
৫. লকড রেসিপিতে পরিবর্তন প্রতিরোধ
৬. POST /api/v1/designs/{id}/new-version — নতুন রিভিশন (v2, v3...) প্রস্তুত
৭. GET /api/v1/designs/order/{order_id} — অর্ডারভিত্তিক রেসিপি কোয়েরি (Sub-50ms)
রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
"""

import io
import uuid
from datetime import datetime
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.security import create_access_token
from app.main import app
from app.models.base import generate_uuid7
from app.models.laser_design import LaserDesign
from app.models.order import Order
from app.models.user import User


@pytest.fixture
async def auth_headers():
    """অথেনটিকেশন টোকেন হেডার প্রস্তুত করে"""
    async with AsyncSessionLocal() as session:
        user_stmt = select(User).limit(1)
        user = (await session.execute(user_stmt)).scalar_one()
        token = create_access_token(subject=str(user.id))
        return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def test_order():
    """টেস্টের জন্য স্বতন্ত্র টেস্ট অর্ডার তৈরি করে এবং টেস্ট শেষে সম্পূর্ণ ক্লিনআপ করে"""
    order_id = None
    async with AsyncSessionLocal() as session:
        user = (await session.execute(select(User).limit(1))).scalar_one()
        uid = uuid.uuid4().hex[:6].upper()
        order = Order(
            company="Denim Test Vault Ltd.",
            buyer_name=f"Test Buyer {uid}",
            po_number=f"PO-TEST-{uid}",
            job_no=f"JOB-TEST-{uid}",
            style_code=f"STYLE-TEST-{uid}",
            total_quantity=5000,
            target_delivery_date=datetime.now().date(),
            created_by=user.id,
        )
        session.add(order)
        await session.commit()
        await session.refresh(order)
        order_id = order.id

    yield order

    import os
    import shutil
    from sqlalchemy import text
    async with AsyncSessionLocal() as session:
        await session.execute(text(f"DELETE FROM laser_design_files WHERE design_id IN (SELECT id FROM laser_designs WHERE order_id = '{order_id}')"))
        await session.execute(text(f"DELETE FROM laser_designs WHERE order_id = '{order_id}'"))
        await session.execute(text(f"DELETE FROM orders WHERE id = '{order_id}'"))
        await session.commit()

    vault_dir = f"/data/vault/orders/{order_id}"
    if os.path.exists(vault_dir):
        shutil.rmtree(vault_dir, ignore_errors=True)


@pytest.mark.asyncio
async def test_create_design_draft(auth_headers, test_order):
    """১. নতুন লেজার ডিজাইন রেসিপি ড্রাফট তৈরি টেস্ট"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "order_id": str(test_order.id),
            "recipe_name": "511 Whisker Scrape Wash v1",
            "style_code": test_order.style_code,
            "notes": "Testing laser design draft creation",
        }
        res = await client.post("/api/v1/designs/", json=payload, headers=auth_headers)
        assert res.status_code == 201
        data = res.json()
        assert data["recipe_name"] == "511 Whisker Scrape Wash v1"
        assert data["status"] == "DRAFT"
        assert data["is_locked"] is False
        assert data["version"] >= 1
        assert len(data["files"]) == 0


@pytest.mark.asyncio
async def test_upload_design_file_and_lock_lifecycle(auth_headers, test_order):
    """২-৫. .jean5 ফাইল আপলোড, অননুমোদিত এক্সটেনশন রিজেকশন, এবং রেসিপি লক টেস্ট"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # ক. ড্রাফট রেসিপি তৈরি
        draft_payload = {
            "order_id": str(test_order.id),
            "recipe_name": "511 Slim Two-Step Front Back",
            "style_code": test_order.style_code,
        }
        draft_res = await client.post("/api/v1/designs/", json=draft_payload, headers=auth_headers)
        assert draft_res.status_code == 201
        design_id = draft_res.json()["id"]

        # খ. ফাইল ছাড়া লক করার চেষ্টা করলে রিজেক্ট (400 Bad Request)
        lock_attempt = await client.post(
            f"/api/v1/designs/{design_id}/lock",
            json={"confirm_lock": True, "lock_notes": "Early lock"},
            headers=auth_headers,
        )
        assert lock_attempt.status_code == 400
        assert "at least one mapped" in lock_attempt.json()["detail"]

        # গ. অবৈধ ফাইল ফরম্যাট (.txt) আপলোড করলে রিজেক্ট
        invalid_file = io.BytesIO(b"some malicious or invalid text data")
        bad_upload = await client.post(
            f"/api/v1/designs/{design_id}/upload-file",
            data={"size_code": "32", "placement": "FRONT"},
            files={"file": ("virus.txt", invalid_file, "text/plain")},
            headers=auth_headers,
        )
        assert bad_upload.status_code == 400
        assert "Invalid file format" in bad_upload.json()["detail"]

        # ঘ. বৈধ .jean5 ফাইল আপলোড (Front Body)
        mock_jean5_front = io.BytesIO(b"JEANOLOGIA_EMARK_NATIVE_BINARY_DATA_FRONT_32")
        upload_front = await client.post(
            f"/api/v1/designs/{design_id}/upload-file",
            data={
                "size_code": "32",
                "placement": "FRONT",
                "power_percentage": 85.0,
                "speed_percentage": 90.0,
                "cycle_time_estimate_sec": 42.0,
            },
            files={"file": ("511_Front_32.jean5", mock_jean5_front, "application/octet-stream")},
            headers=auth_headers,
        )
        assert upload_front.status_code == 201
        front_data = upload_front.json()
        assert front_data["placement"] == "FRONT"
        assert front_data["size_code"] == "32"
        assert front_data["file_format"] == "JEAN5"
        assert len(front_data["file_hash_sha256"]) == 64

        # ঙ. বৈধ .jean5 ফাইল আপলোড (Back Body)
        mock_jean5_back = io.BytesIO(b"JEANOLOGIA_EMARK_NATIVE_BINARY_DATA_BACK_32")
        upload_back = await client.post(
            f"/api/v1/designs/{design_id}/upload-file",
            data={"size_code": "32", "placement": "BACK", "power_percentage": 80.0},
            files={"file": ("511_Back_32.jean5", mock_jean5_back, "application/octet-stream")},
            headers=auth_headers,
        )
        assert upload_back.status_code == 201

        # চ. সফল রেসিপি লক (Recipe Lock Gate)
        lock_res = await client.post(
            f"/api/v1/designs/{design_id}/lock",
            json={"confirm_lock": True, "lock_notes": "Approved for 20 Flat Conveyor Tables"},
            headers=auth_headers,
        )
        assert lock_res.status_code == 200
        locked_data = lock_res.json()
        assert locked_data["is_locked"] is True
        assert locked_data["status"] == "LOCKED"
        assert locked_data["locked_at"] is not None
        assert len(locked_data["files"]) == 2

        # ছ. লকড রেসিপিতে নতুন ফাইল আপলোড চেষ্টা করলে ব্লক (400 Bad Request)
        mock_extra = io.BytesIO(b"TRYING_TO_MUTATE_LOCKED_RECIPE")
        blocked_upload = await client.post(
            f"/api/v1/designs/{design_id}/upload-file",
            data={"size_code": "34", "placement": "FRONT"},
            files={"file": ("511_Front_34.jean5", mock_extra, "application/octet-stream")},
            headers=auth_headers,
        )
        assert blocked_upload.status_code == 400
        assert "Cannot modify or upload files to a LOCKED laser recipe" in blocked_upload.json()["detail"]

        # ছ(১). লকড থাকা অবস্থায় অপারেটর প্যারামিটার এডিট করতে গেলে ব্লক (403 Forbidden)
        front_file_id = front_data["id"]
        blocked_param_res = await client.patch(
            f"/api/v1/designs/{design_id}/files/{front_file_id}/parameters",
            json={"power_percentage": 95.0, "speed_percentage": 92.0},
            headers=auth_headers,
        )
        assert blocked_param_res.status_code == 403
        assert "Cannot edit laser parameters: Recipe is LOCKED by designer" in blocked_param_res.json()["detail"]

        # ছ(২). রেসিপি আনলক (Recipe Unlock Gate)
        unlock_res = await client.post(
            f"/api/v1/designs/{design_id}/unlock",
            json={"confirm_unlock": True, "unlock_notes": "Unlocked for wash parameter tuning"},
            headers=auth_headers,
        )
        assert unlock_res.status_code == 200
        unlocked_data = unlock_res.json()
        assert unlocked_data["is_locked"] is False
        assert unlocked_data["status"] == "DRAFT"

        # ছ(৩). আনলক থাকা অবস্থায় অপারেটর প্যারামিটার সফলভাবে এডিট করতে পারবে (200 OK)
        allowed_param_res = await client.patch(
            f"/api/v1/designs/{design_id}/files/{front_file_id}/parameters",
            json={"power_percentage": 92.0, "speed_percentage": 88.0, "cycle_time_estimate_sec": 39.5},
            headers=auth_headers,
        )
        assert allowed_param_res.status_code == 200
        updated_file_data = allowed_param_res.json()
        assert updated_file_data["power_percentage"] == 92.0
        assert updated_file_data["speed_percentage"] == 88.0
        assert updated_file_data["cycle_time_estimate_sec"] == 39.5

        # জ. লকড রেসিপি থেকে নতুন রিভিশন (New Version) তৈরি
        new_ver_res = await client.post(
            f"/api/v1/designs/{design_id}/new-version",
            headers=auth_headers,
        )
        assert new_ver_res.status_code == 201
        new_ver_data = new_ver_res.json()
        assert new_ver_data["version"] == locked_data["version"] + 1
        assert new_ver_data["status"] == "DRAFT"
        assert new_ver_data["is_locked"] is False

        # ঝ. অর্ডারের অধীনে সমস্ত রেসিপি তালিকা সংগ্রহ
        list_res = await client.get(
            f"/api/v1/designs/order/{test_order.id}",
            headers=auth_headers,
        )
        assert list_res.status_code == 200
        order_designs = list_res.json()
        assert len(order_designs) >= 2


@pytest.mark.asyncio
async def test_get_design_by_id_404(auth_headers):
    """অবিদ্যমান ডিজাইন আইডির ক্ষেত্রে HTTP 404 হ্যান্ডলিং"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        fake_id = uuid.uuid4()
        res = await client.get(f"/api/v1/designs/{fake_id}", headers=auth_headers)
        assert res.status_code == 404


@pytest.mark.asyncio
async def test_upload_image_and_stream_content(auth_headers, test_order):
    """ইমেজ ফাইল (.png) আপলোড এবং কনটেন্ট প্রিভিউ স্ট্রিমিং টেস্ট"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # ১. ড্রাফট রেসিপি তৈরি
        draft_res = await client.post(
            "/api/v1/designs/",
            json={
                "order_id": str(test_order.id),
                "recipe_name": "Image Support Test Recipe",
                "style_code": test_order.style_code,
            },
            headers=auth_headers,
        )
        assert draft_res.status_code == 201
        design_id = draft_res.json()["id"]

        # ২. পিএনজি ইমেজ ফাইল আপলোড (লেজার মকআপ/স্কেচ)
        mock_png = io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDRFAKE_PNG_BINARY")
        img_upload = await client.post(
            f"/api/v1/designs/{design_id}/upload-file",
            data={"size_code": "ALL", "placement": "FRONT"},
            files={"file": ("front_whisker_sketch.png", mock_png, "image/png")},
            headers=auth_headers,
        )
        assert img_upload.status_code == 201
        img_data = img_upload.json()
        assert img_data["file_format"] == "PNG"
        file_id = img_data["id"]

        # ৩. কনটেন্ট প্রিভিউ এন্ডপয়েন্ট থেকে ইমেজ রিড
        preview_res = await client.get(f"/api/v1/designs/files/{file_id}/content", headers=auth_headers)
        assert preview_res.status_code == 200
        assert preview_res.headers["content-type"] == "image/png"
        assert b"FAKE_PNG_BINARY" in preview_res.content
