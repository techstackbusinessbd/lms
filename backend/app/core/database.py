"""
অ্যাসিনক্রোনাস ডেটাবেজ ইঞ্জিন ও সেশন ম্যানেজার (Async Database Engine & Session Manager)
Denim Laser Automation & Control System (Denim LACS)

এই মডিউলটি SQLAlchemy 2.0 AsyncIO এবং asyncpg ড্রাইভার ব্যবহার করে
PostgreSQL 16 ডেটাবেজের সাথে উচ্চ-ক্ষমতাসম্পন্ন সংযোগ ও কানেকশন পুলিং পরিচালনা করে।
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy import text
from app.core.config import settings
from app.core.logging import logger

# SQLAlchemy 2.0 অ্যাসিনক্রোনাস ইঞ্জিন ইনিশিয়ালাইজেশন
# কানেকশন ড্রপ প্রতিরোধে pool_pre_ping সক্রিয় এবং রিসোর্স অপ্টিমাইজেশনের জন্য পুল সাইজ কনফিগার করা
async_engine: AsyncEngine = create_async_engine(
    url=settings.async_database_url,
    echo=False,  # প্রোডাকশন ও ডেভেলপমেন্টে অতিরিক্ত এসকিউএল লগিং বন্ধ রাখা
    pool_size=10,  # স্ট্যান্ডার্ড কানেকশন পুল ক্যাপাসিটি
    max_overflow=5,  # পিক ট্রাফিকের সময় সর্বোচ্চ ওভারফ্লো কানেকশন
    pool_timeout=30,  # কানেকশন পাওয়ার জন্য সর্বোচ্চ অপেক্ষা (সেকেন্ড)
    pool_recycle=1800,  # ৩০ মিনিট পর পর কানেকশন রিসাইকেল
    pool_pre_ping=True,  # কানেকশন দেওয়ার আগে ডেটাবেজ পিং ভেরিফিকেশন
)

# অ্যাসিনক্রোনাস সেশন মেকার ফ্যাক্টরি
AsyncSessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,  # কমিটের পর অবজেক্ট অ্যাট্রিবিউট সক্রিয় রাখা
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI ডিপেন্ডেন্সি ইনজেকশন ফাংশন।
    প্রতিটি এপিআই রিকোয়েস্টের জন্য একটি আইসোলেটেড AsyncSession প্রদান করে
    এবং রিকোয়েস্ট শেষে সেশনটি নিরাপদভাবে ক্লোজ করে।
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as error:
            await session.rollback()
            logger.error(f"Database session exception occurred, rolled back: {error}")
            raise
        finally:
            await session.close()


async def verify_db_connection() -> bool:
    """
    সিস্টেম স্টার্টআপ ও হেলথচেকের সময় ডেটাবেজ সংযোগ সক্রিয় আছে কিনা যাচাই করে।
    সফল হলে True এবং সংযোগ ব্যর্থ হলে False প্রদান করে।
    """
    try:
        async with async_engine.connect() as connection:
            result = await connection.execute(text("SELECT 1"))
            return result.scalar() == 1
    except Exception as error:
        logger.warning(f"Database healthcheck ping failed: {error}")
        return False

