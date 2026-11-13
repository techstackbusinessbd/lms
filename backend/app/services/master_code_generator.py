"""
মাস্টার ডাটা অটো কোড জেনারেটর (Master Data Auto Code Generator)
Denim Laser Automation & Control System (Denim LACS)

Company, Buyer, Brand এবং Season-এর জন্য ধারাবাহিক ইউনিক কোড স্বয়ংক্রিয়ভাবে তৈরি করে।
e.g. CMP-0001, BYR-0001, BRD-0001, SSN-0001
রুল ০৪ (<300 Lines) এবং রুল ১১ (Bangla Comments) মেনে প্রস্তুতকৃত।
"""

from typing import Type
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import BaseModel


async def generate_auto_master_code(
    db: AsyncSession,
    model: Type[BaseModel],
    prefix: str,
    padding: int = 4,
) -> str:
    """
    মাস্টার ডেটাবেজ টেবিল স্ক্যান করে পরবর্তী ধারাবাহিক ইউনিক কোড তৈরি করে।
    যদি পূর্বে তৈরি কোড বিদ্যমান থাকে, তবে এটি স্বয়ংক্রিয়ভাবে ইনক্রিমেন্ট করে কলিশন রোধ করে।
    """
    total = (await db.execute(select(func.count(model.id)))).scalar() or 0
    seq = total + 1
    while True:
        candidate = f"{prefix}-{seq:0{padding}d}"
        exists = (
            await db.execute(select(model.id).where(model.code == candidate))
        ).scalar_one_or_none()
        if not exists:
            return candidate
        seq += 1
