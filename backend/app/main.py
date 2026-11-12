"""
অ্যাপ্লিকেশন প্রধান এন্ট্রি পয়েন্ট (Main Application Entry Point)
Denim Laser Automation & Control System (Denim LACS)

এই ফাইলটি FastAPI অ্যাপ্লিকেশন ফ্যাক্টরি, লাইফস্প্যান ইভেন্টস, CORS মিডলওয়্যার
এবং প্রাথমিক সিস্টেম হেলথচেক এন্ডপয়েন্ট পরিচালনা করে।
"""

from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import AsyncGenerator, Dict, Any

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.api.v1 import api_v1_router
from app.core.config import settings
from app.core.database import verify_db_connection
from app.core.logging import setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    অ্যাপ্লিকেশন লাইফস্প্যান কন্ট্রোলার।
    সার্ভার স্টার্টআপ ও শাটডাউনের ইভেন্টগুলো অ্যাসিনক্রোনাস পদ্ধতিতে পরিচালনা করে।
    """
    # ১. সেন্ট্রাল স্ট্রাকচার্ড লগার চালু করা
    setup_logging()
    logger.info(f"🚀 {settings.PROJECT_NAME} ব্যাকএন্ড সফলভাবে চালু হচ্ছে...")
    logger.info(f"পরিবেশ: {settings.ENVIRONMENT} | এপিআই প্রিফিক্স: {settings.API_V1_STR}")
    logger.info("টার্গেট কারখানা সেটআপ: ২০টি Jeanologia ফ্ল্যাট কনভেয়ার লেজার মেশিন (eMark).")

    yield

    # ২. শাটডাউন লজিক
    logger.info("🛑 ব্যাকএন্ড সার্ভার গ্রেসফুলি শাটডাউন সম্পন্ন করছে...")


# FastAPI কোর অ্যাপ্লিকেশন ইনিশিয়ালাইজেশন
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="২০টি Jeanologia ফ্ল্যাট কনভেয়ার লেজার মেশিনের অটোমেশন ও কন্ট্রোল ব্যাকএন্ড।",
    version="v1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# কারখানার লোকাল ল্যান সাবনেট ও ব্রাউজারের জন্য CORS মিডলওয়্যার সংযোজন
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# API v1 রাউটার মাউন্ট করা
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
async def root() -> Dict[str, str]:
    """
    সিস্টেম রুট এন্ডপয়েন্ট।
    প্রাথমিক পিং রেসপন্স ও ডকুমেন্টেশন লিঙ্ক প্রদান করে।
    """
    return {
        "system": settings.PROJECT_NAME,
        "version": "v1.0.0",
        "status": "online",
        "documentation": "/docs",
    }


@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
async def health_check() -> Dict[str, Any]:
    """
    সিস্টেম হেলথচেক এন্ডপয়েন্ট (Docker Healthcheck ও শপ-ফ্লোর মনিটর দ্বারা ব্যবহৃত)।
    সেন্ট্রাল ব্যাকএন্ড এবং ডেটাবেজ সংযোগের বর্তমান রানটাইম নিশ্চিত করে।
    """
    db_connected = await verify_db_connection()
    return {
        "status": "healthy" if db_connected else "degraded",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database_target": f"{settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}",
        "services": {
            "fastapi": "operational",
            "database": "connected" if db_connected else "unreachable",
            "docker_runtime": "active",
        },
    }


