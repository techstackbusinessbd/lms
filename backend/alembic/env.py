"""
অ্যালেম্বিক অ্যাসিনক্রোনাস মাইগ্রেশন এনভায়রনমেন্ট (Alembic Async Migration Environment)
Denim Laser Automation & Control System (Denim LACS)

এই ফাইলটি PostgreSQL 16 ডেটাবেজে স্কিমা ভার্সন কন্ট্রোল ও অ্যাসিনক্রোনাস মাইগ্রেশন পরিচালনা করে।
"""

import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context
from app.core.config import settings
from app.models.base import Base

# অ্যালেম্বিক কনফিগারেশন অবজেক্ট
config = context.config

# লগিং কনফিগারেশন সেটআপ
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# সমস্ত ওআরএম মডেলের মেটাডাটা বাইন্ডিং
target_metadata = Base.metadata

# ডায়নামিকালি সেটিংস থেকে ডেটাবেজ ইউআরএল নির্ধারণ
config.set_main_option("sqlalchemy.url", settings.async_database_url)


def run_migrations_offline() -> None:
    """
    অফলাইন মোডে মাইগ্রেশন স্ক্রিপ্ট তৈরি করে।
    সরাসরি ডেটাবেজ সংযোগ ছাড়া এসকিউএল স্ক্রিপ্ট জেনারেট করার জন্য ব্যবহৃত হয়।
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """
    সক্রিয় ডাটাবেজ কানেকশনে সিঙ্ক মোডে মাইগ্রেশন এক্সিকিউট করে।
    """
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,  # কলাম টাইপ পরিবর্তন শনাক্তকরণ
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """
    অ্যাসিনক্রোনাস ইঞ্জিন দিয়ে মাইগ্রেশন সম্পাদন করে।
    """
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """
    অনলাইন মোডে ডেটাবেজে সরাসরি অ্যাসিনক্রোনাস মাইগ্রেশন রান করে।
    """
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

