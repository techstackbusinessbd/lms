"""
পাইটেস্ট কনফিগারেশন ও ফিবাশ্চার মডিউল (Pytest Configuration & Database Fixtures)
Denim Laser Automation & Control System (Denim LACS)

টেস্ট রানটাইমে NullPool ব্যবহার করে যাতে asyncpg কানেকশন একাধিক ইভেন্ট লুপের মাঝে কনফ্লিক্ট না করে।
"""

from typing import AsyncGenerator
import pytest
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.core import database

# টেস্ট মোডে NullPool কনফিগারেশন
test_async_engine = create_async_engine(
    settings.async_database_url,
    poolclass=NullPool,
    echo=False,
)

# গ্লোবাল ডাটাবেজ মডিউলে টেস্ট ইঞ্জিন বাইন্ডিং
database.async_engine = test_async_engine
database.AsyncSessionLocal = async_sessionmaker(
    bind=test_async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


@pytest.fixture(autouse=True)
async def dispose_db_engine_after_test() -> AsyncGenerator[None, None]:
    """
    প্রতিটি টেস্ট সম্পন্ন হওয়ার পর ইঞ্জিন ক্লিনআপ নিশ্চিত করা।
    """
    yield
    await test_async_engine.dispose()
