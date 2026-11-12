"""
পাইটেস্ট কনফিগারেশন ও ফিবাশ্চার মডিউল (Pytest Configuration & Database Fixtures)
Denim Laser Automation & Control System (Denim LACS)

প্রতিটি টেস্টের পর অ্যাসিনক্রোনাস ডেটাবেজ পুল ডিসপোজ করে নতুন ইভেন্ট লুপের জন্য সংযোগ প্রস্তুত করে।
"""

from typing import AsyncGenerator
import pytest
from app.core.database import async_engine


@pytest.fixture(autouse=True)
async def dispose_db_engine_after_test() -> AsyncGenerator[None, None]:
    """
    প্রতিটি টেস্ট সম্পন্ন হওয়ার পর কানেকশন পুল ডিসপোজ করা,
    যাতে asyncpg বিভিন্ন ইভেন্ট লুপে কানেকশন শেয়ারিং এরর না ঘটায়।
    """
    yield
    await async_engine.dispose()
