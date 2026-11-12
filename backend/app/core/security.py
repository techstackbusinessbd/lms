"""
ক্রিপ্টোগ্রাফিক সিকিউরিটি ও টোকেন ইঞ্জিন (Cryptographic Security & Token Engine)
Denim Laser Automation & Control System (Denim LACS)

এই মডিউলটি Argon2id ক্রিপ্টোগ্রাফিক অ্যালগরিদম ব্যবহার করে নিরাপদ পাসওয়ার্ড ও
শপ-ফ্লোর Quick-PIN হ্যাশিং, ভেরিফিকেশন এবং JWT এক্সেস টোকেন জেনারেশন পরিচালনা করে।
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import jwt
from passlib.context import CryptContext

from app.core.config import settings

# Argon2id ক্রিপ্টোগ্রাফিক কনটেক্সট (পাসওয়ার্ড ও ফ্লোর পিনের জন্য)
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
    argon2__memory_cost=65536,  # 64 MB
    argon2__time_cost=3,        # 3 iterations
    argon2__parallelism=4,     # 4 parallel threads
)

# JWT সাইনিং অ্যালগরিদম
JWT_ALGORITHM = "HS256"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    ব্যবহারকারীর ইনপুটকৃত প্লেইন পাসওয়ার্ড Argon2id হ্যাশের সাথে যাচাই করে।
    """
    if not plain_password or not hashed_password:
        return False
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    প্লেইন পাসওয়ার্ডকে নিরাপদ Argon2id হ্যাশে রূপান্তর করে।
    """
    return pwd_context.hash(password)


def verify_quick_pin(plain_pin: str, hashed_pin: str) -> bool:
    """
    শপ-ফ্লোর অপারেটরের ৪-৬ ডিজিটের টাচ-স্ক্রিন Quick-PIN যাচাই করে।
    """
    if not plain_pin or not hashed_pin:
        return False
    return pwd_context.verify(plain_pin, hashed_pin)


def get_quick_pin_hash(pin: str) -> str:
    """
    অপারেটরের Quick-PIN কে নিরাপদ Argon2id হ্যাশে রূপান্তর করে।
    """
    return pwd_context.hash(pin)


def create_access_token(
    subject: str,
    claims: Optional[Dict[str, Any]] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    ব্যবহারকারী বা এজেন্টের জন্য ক্রিপ্টোগ্রাফিক্যালি সাইনড JWT Access Token তৈরি করে।
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "type": "access_token",
    }

    if claims:
        to_encode.update(claims)

    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    JWT Access Token ডিকোড ও ভ্যালিডেট করে পে-লোড রিটার্ন করে।
    টোকেন মেয়াদোত্তীর্ণ বা বিকৃত হলে None প্রদান করে।
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
            options={"require": ["exp", "sub", "iat"]},
        )
        return payload
    except (jwt.PyJWTError, Exception):
        return None
