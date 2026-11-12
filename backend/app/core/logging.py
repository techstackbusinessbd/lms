"""
লগিং কনফিগারেশন মডিউল (Logging Configuration Module)
Denim Laser Automation & Control System (Denim LACS)

এই মডিউলটি সম্পূর্ণ সিস্টেমের স্ট্রাকচার্ড JSON লগিং কনফিগারেশন পরিচালনা করে।
"""

import sys
from loguru import logger


def setup_logging() -> None:
    """
    অ্যাপ্লিকেশনের কেন্দ্রীয় লগার সেটআপ ফাংশন।
    লগগুলো কনসোল এবং ফাইলে প্রমিত ফরম্যাটে রেকর্ড করার নিয়ম কনফিগার করে।
    """
    # ডিফল্ট হ্যান্ডলার সরানো হচ্ছে
    logger.remove()

    # কনসোল আউটপুট ফরম্যাট কনফিগারেশন
    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
        "<level>{message}</level>"
    )

    # কনসোলে রঙিন স্ট্রাকচার্ড লগ যুক্ত করা
    logger.add(
        sys.stdout,
        format=log_format,
        level="INFO",
        colorize=True,
    )

    # এরর লগের জন্য আলাদা রোটেশন ফাইল
    logger.add(
        "logs/lacs_backend_error.log",
        format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} - {message}",
        level="ERROR",
        rotation="10 MB",
        retention="30 days",
        compression="zip",
        encoding="utf-8",
    )

    logger.info("সেন্ট্রাল লগিং সিস্টেম সফলভাবে সক্রিয় করা হয়েছে।")

