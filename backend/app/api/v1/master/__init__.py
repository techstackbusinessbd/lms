"""
মাস্টার ডাটা সাব-রাউটার বান্ডেল (Master Data Sub-Router Bundle)
Denim Laser Automation & Control System (Denim LACS)

Company, Buyer, Brand এবং Season এপিআই রাউটারসমূহ একত্রিত করে।
"""

from fastapi import APIRouter
from app.api.v1.master.companies import router as companies_router
from app.api.v1.master.buyers import router as buyers_router
from app.api.v1.master.brands import router as brands_router
from app.api.v1.master.seasons import router as seasons_router

master_router = APIRouter()

master_router.include_router(companies_router, prefix="/companies", tags=["Master Data - Companies"])
master_router.include_router(buyers_router, prefix="/buyers", tags=["Master Data - Buyers"])
master_router.include_router(brands_router, prefix="/brands", tags=["Master Data - Brands"])
master_router.include_router(seasons_router, prefix="/seasons", tags=["Master Data - Seasons"])
