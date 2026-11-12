"""
এপিআই v1 মাস্টার রাউটার প্যাকেজ (API v1 Master Router Package)
Denim Laser Automation & Control System (Denim LACS)

এই মডিউলটি সমস্ত v1 সাব-রাউটারকে একত্রিত করে সেন্ট্রাল FastAPI অ্যাপ্লিকেশনে মাউন্ট করে।
"""

from fastapi import APIRouter
from app.api.v1.auth import router as auth_router

api_v1_router = APIRouter()

# অথেনটিকেশন রাউটার সংযোজন
api_v1_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
