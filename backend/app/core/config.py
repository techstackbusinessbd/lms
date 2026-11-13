"""
সিস্টেম কনফিগারেশন সেটিংস (System Configuration Settings)
Denim Laser Automation & Control System (Denim LACS)

এই মডিউলটি pydantic-settings ব্যবহার করে পরিবেশ ভেরিয়েবল (.env) থেকে
সমস্ত সেটিংস টাইপ-সেফ পদ্ধতিতে লোড করে।
"""

from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    অ্যাপ্লিকেশনের কেন্দ্রীয় কনফিগারেশন ক্লাস।
    সমস্ত ভেরিয়েবল কঠোর টাইপ-ভ্যালিডেশনের মাধ্যমে পরিচালিত হয়।
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # অ্যাপ্লিকেশন প্রোফাইল ও বেসিক মেটাডাটা
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "Denim Laser Automation & Control System (Denim LACS)"
    API_V1_STR: str = "/api/v1"

    # PostgreSQL ডেটাবেজ সেটিংস
    POSTGRES_SERVER: str = "lacs-dev-db"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "lacs_dev"
    POSTGRES_USER: str = "lacs_user"
    POSTGRES_PASSWORD: str = "lacs_secure_pass_2026"

    # সিকিউরিটি ও ক্রিপ্টোগ্রাফি কনফিগারেশন
    SECRET_KEY: str = "lacs_dev_secret_key_change_in_production_2026"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # ৭ দিন (সাপ্তাহিক শিফট সেশন)
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # সিওআরএস (CORS) পলিসি কনফিগারেশন
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:5173",
        "http://192.168.1.100",
    ]

    # সেন্ট্রাল লেজার ডিজাইন ভল্ট ফাইল স্টোরেজ পাথ
    VAULT_STORAGE_PATH: str = "/data/vault"

    @property
    def async_database_url(self) -> str:
        """
        SQLAlchemy 2.0 AsyncIO-এর জন্য asyncpg সংযোগ স্ট্রিং তৈরি করে।
        যেমন: postgresql+asyncpg://user:pass@host:5432/dbname
        """
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


# গ্লোবাল সেটিংস অবজেক্ট তৈরি
settings: Settings = Settings()

