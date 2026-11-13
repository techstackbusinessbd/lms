"""
এপিআই v1 মাস্টার রাউটার প্যাকেজ (API v1 Master Router Package)
Denim Laser Automation & Control System (Denim LACS)

এই মডিউলটি সমস্ত v1 সাব-রাউটারকে একত্রিত করে সেন্ট্রাল FastAPI অ্যাপ্লিকেশনে মাউন্ট করে।
"""

from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.orders import router as orders_router
from app.api.v1.designs import router as designs_router
from app.api.v1.garment_units import router as units_router

api_v1_router = APIRouter()

# অথেনটিকেশন রাউটার সংযোজন
api_v1_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])

# অর্ডার ম্যানেজমেন্ট রাউটার সংযোজন
api_v1_router.include_router(orders_router, prefix="/orders", tags=["Order Management"])

# লেজার ডিজাইন ভল্ট রাউটার সংযোজন (Workflow ধাপ ২)
api_v1_router.include_router(designs_router, prefix="/designs", tags=["Laser Design Vault"])

# কিউআর কোড জেনারেশন ও ট্র্যাকিং রাউটার সংযোজন (Workflow ধাপ ৩ ও ৪)
api_v1_router.include_router(units_router, prefix="/units", tags=["Garment Units & QR"])

