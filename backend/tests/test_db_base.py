"""
ডেটাবেজ বেস মডেল ও UUIDv7 ভেরিফিকেশন টেস্ট (Database Base Model & UUIDv7 Verification Tests)
Denim Laser Automation & Control System (Denim LACS)
"""

import time
import uuid
import pytest
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, BaseModel, generate_uuid7
from app.core.database import async_engine, AsyncSessionLocal, get_db


class DummyTestModel(BaseModel):
    """টেস্ট মডেল যা BaseModel থেকে ইনহেরিট করে"""
    __tablename__ = "dummy_test_table"

    name: Mapped[str] = mapped_column(String(50), nullable=False)


def test_uuid7_generation_and_sorting() -> None:
    """
    RFC 9562 UUIDv7 জেনারেশন ও টাইম-সর্টিং বৈশিষ্ট্য যাচাই
    """
    id_1 = generate_uuid7()
    time.sleep(0.002)  # ২ মিলিসেকেন্ড বিরতি
    id_2 = generate_uuid7()

    # ভার্সন ৭ ও ভ্যারিয়েন্ট ভেরিফিকেশন
    assert id_1.version == 7, "UUID Version অবশ্যই ৭ হতে হবে"
    assert id_2.version == 7, "UUID Version অবশ্যই ৭ হতে হবে"
    assert id_1.variant == uuid.RFC_4122, "UUID Variant RFC 4122/9562 হতে হবে"

    # টাইম-অর্ডারিং ভেরিফিকেশন (B-Tree ফ্র্যাগমেন্টেশন প্রতিরোধ পরীক্ষা)
    assert id_1 < id_2, "পূর্ববর্তী আইডি পরবর্তী আইডির চেয়ে ছোট হতে হবে (Strict Time Ordering)"


def test_base_model_schema_attributes() -> None:
    """
    BaseModel-এর ডিফল্ট কলাম ও মেথড ভেরিফিকেশন
    """
    sample = DummyTestModel(name="Jeanologia Laser Table 01")

    # কলাম যাচাই
    assert hasattr(sample, "id"), "id কলাম বিদ্যমান থাকতে হবে"
    assert hasattr(sample, "created_at"), "created_at কলাম বিদ্যমান থাকতে হবে"
    assert hasattr(sample, "updated_at"), "updated_at কলাম বিদ্যমান থাকতে হবে"
    assert hasattr(sample, "is_deleted"), "is_deleted কলাম বিদ্যমান থাকতে হবে"

    # সফট ডিলিট ডিফল্ট মান
    assert sample.is_deleted is False, "ডিফল্ট is_deleted False হতে হবে"


@pytest.mark.asyncio
async def test_session_generator_lifecycle() -> None:
    """
    get_db অ্যাসিনক্রোনাস জেনারেটর লাইফসাইকেল টেস্ট
    """
    generator = get_db()
    session = await anext(generator)
    assert session is not None, "সেশন অবজেক্ট সফলভাবে প্রস্তুত হতে হবে"

    # সেশন সফলভাবে ক্লোজ হওয়া নিশ্চিত করা
    try:
        await anext(generator)
    except StopAsyncIteration:
        pass  # জেনারেটর সফলভাবে সমাপ্ত হয়েছে

