"""
সেন্ট্রাল লেজার ডিজাইন ভল্ট ফাইল স্টোরেজ সার্ভিস (Laser Design Vault Storage Service)
Denim Laser Automation & Control System (Denim LACS)

Jeanologia .jean এবং .jean5 ফাইলসমূহের লোকাল ফাইলসিস্টেম স্টোরেজ,
পাথ ট্রাভার্সাল সুরক্ষা, অ্যাটমিক ফাইল রাইট (Atomic Write), এবং SHA-256 ইন্টিগ্রিটি ভেরিফিকেশন।
রুল ০৪ (<300 Lines) এবং রুল ০৫ (Sub-200ms Latency) মেনে প্রস্তুতকৃত।
"""

import hashlib
import os
import re
import uuid
from pathlib import Path
from typing import Dict, Optional, Tuple
from app.core.config import settings


class VaultStorageError(Exception):
    """ভল্ট ফাইল স্টোরেজ সংক্রান্ত কাস্টম এক্সেপশন বেস ক্লাস"""
    pass


class InvalidFileFormatError(VaultStorageError):
    """অননুমোদিত ফাইল ফরম্যাট এরর (.jean বা .jean5 ব্যতীত)"""
    pass


class FileIntegrityError(VaultStorageError):
    """ফাইল করাপশন বা হ্যাশ অমিল এরর"""
    pass


class LaserVaultStorageService:
    """
    লেজার ডিজাইন ভল্ট স্টোরেজ সার্ভিস।
    ফ্যাক্টরি সার্ভারের সেন্ট্রাল স্টোরেজে রেসিপি ফাইল সংরক্ষণ ও পুনরুদ্ধার পরিচালনা করে।
    """

    ALLOWED_EXTENSIONS = {".jean5", ".jean", ".png", ".jpg", ".jpeg", ".webp", ".bmp"}
    MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # সর্বোচ্চ ৫০ মেগাবাইট

    def __init__(self, base_dir: Optional[str] = None):
        """ভল্ট রুট ডিরেক্টরি ইনিশিয়ালাইজ ও পাথ নিশ্চিতকরণ"""
        path_str = base_dir or getattr(settings, "VAULT_STORAGE_PATH", "/app/storage/laser_vault")
        self.root_path = Path(path_str).resolve()
        self._ensure_storage_directory()

    def _ensure_storage_directory(self) -> None:
        """ভল্ট ডিরেক্টরি বিদ্যমান না থাকলে তৈরি করা"""
        try:
            self.root_path.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            # ডকার ভলিউম বা পারমিশন ফেইলব্যাক হ্যান্ডলিং
            fallback = Path("./storage/laser_vault").resolve()
            fallback.mkdir(parents=True, exist_ok=True)
            self.root_path = fallback

    @staticmethod
    def sanitize_name(name: str) -> str:
        """পাথ ট্রাভার্সাল ও স্পেশাল ক্যারেক্টার প্রতিরোধে স্ট্রিং স্যানিটাইজার"""
        clean = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", name)
        return clean.strip("._") or "unnamed"

    def validate_file(self, filename: str, content: bytes) -> str:
        """
        ফাইল ফরম্যাট ও সাইজ ভ্যালিডেশন
        রিটার্ন করে লোয়ারকেস এক্সটেনশন (e.g. '.jean5')
        """
        ext = Path(filename).suffix.lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            raise InvalidFileFormatError(
                f"Invalid file format '{ext}'. Allowed formats: .jean5, .jean, .png, .jpg, .jpeg, .webp, .bmp."
            )

        if len(content) == 0:
            raise VaultStorageError("Uploaded design file is empty (0 bytes).")

        if len(content) > self.MAX_FILE_SIZE_BYTES:
            raise VaultStorageError(
                f"File size exceeds maximum allowed limit of {self.MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB."
            )

        return ext

    @staticmethod
    def calculate_sha256(content: bytes) -> str:
        """ফাইলের কনটেন্ট থেকে SHA-256 ক্রিপ্টোগ্রাফিক হ্যাশ জেনারেশন"""
        return hashlib.sha256(content).hexdigest()

    def save_design_file(
        self,
        order_id: uuid.UUID,
        design_id: uuid.UUID,
        placement: str,
        size_code: str,
        original_filename: str,
        content: bytes,
    ) -> Dict[str, any]:
        """
        অ্যাটমিক রাইট (Atomic Write) প্রক্রিয়ায় ভল্টে ফাইল সংরক্ষণ করে।
        অর্ধেক লেখা ফাইল যাতে তৈরি না হয়, সেজন্য প্রথমে .tmp ফাইলে লিখে রিনেম করা হয়।
        """
        ext = self.validate_file(original_filename, content)
        file_hash = self.calculate_sha256(content)
        file_size = len(content)

        clean_placement = self.sanitize_name(placement.upper())
        clean_size = self.sanitize_name(size_code.upper())
        clean_ext = ext.lstrip(".").lower()
        file_format = "JPG" if clean_ext in {"jpg", "jpeg"} else clean_ext.upper()

        # স্ট্যান্ডার্ড ফাইল ফরম্যাট: FRONT_32_a1b2c3d4.jean5 / FRONT_32_a1b2c3d4.png
        hash_prefix = file_hash[:8]
        stored_filename = f"{clean_placement}_{clean_size}_{hash_prefix}.{clean_ext}"

        # ডিরেক্টরি হায়ারার্কি: orders/{order_id}/designs/{design_id}/
        relative_dir = Path("orders") / str(order_id) / "designs" / str(design_id)
        target_dir = self.root_path / relative_dir
        target_dir.mkdir(parents=True, exist_ok=True)

        target_file_path = target_dir / stored_filename
        temp_file_path = target_dir / f"{stored_filename}.tmp.{uuid.uuid4().hex[:6]}"

        try:
            # ১. অস্থায়ী ফাইলে রাইট করা
            with open(temp_file_path, "wb") as f:
                f.write(content)
                f.flush()
                os.fsync(f.fileno())

            # ২. অ্যাটমিক রিনেম (POSIX-এ ইন্সট্যান্ট ও থ্রেড-সেফ)
            os.replace(temp_file_path, target_file_path)

        except Exception as e:
            if temp_file_path.exists():
                try:
                    temp_file_path.unlink()
                except OSError:
                    pass
            raise VaultStorageError(f"Failed to persist laser design file to vault: {str(e)}")

        relative_file_path = str(relative_dir / stored_filename).replace("\\", "/")

        return {
            "file_path": relative_file_path,
            "absolute_path": str(target_file_path),
            "file_size_bytes": file_size,
            "file_hash_sha256": file_hash,
            "file_format": file_format,
            "stored_filename": stored_filename,
        }

    def resolve_absolute_path(self, relative_path: str) -> Path:
        """
        রিলেটিভ পাথ থেকে সুরক্ষিত অ্যাবসোলিউট পাথ বের করে।
        পাথ ট্রাভার্সাল (Directory Traversal Attack) প্রতিরোধ করে।
        """
        clean_rel = relative_path.lstrip("/\\")
        target_path = (self.root_path / clean_rel).resolve()

        # রুট ডিরেক্টরির বাইরে যাওয়া রোধ
        if not str(target_path).startswith(str(self.root_path)):
            raise VaultStorageError("Path traversal attempt detected. Access denied.")

        return target_path

    def read_design_file(self, relative_path: str) -> bytes:
        """ভল্ট থেকে ফাইল বাইনারি কনটেন্ট রিড করে"""
        abs_path = self.resolve_absolute_path(relative_path)
        if not abs_path.is_file():
            raise VaultStorageError(f"Laser design file not found: {relative_path}")

        try:
            with open(abs_path, "rb") as f:
                return f.read()
        except Exception as e:
            raise VaultStorageError(f"Could not read design file from vault: {str(e)}")

    def verify_file_integrity(self, relative_path: str, expected_hash: str) -> bool:
        """ফাইলটির বর্তমান হ্যাশ প্রত্যাশিত হ্যাশের সাথে মিলিয়ে ইন্টিগ্রিটি যাচাই করে"""
        content = self.read_design_file(relative_path)
        actual_hash = self.calculate_sha256(content)
        if actual_hash.lower() != expected_hash.lower():
            raise FileIntegrityError(
                f"File integrity check failed for '{relative_path}'. "
                f"Expected: {expected_hash}, Actual: {actual_hash}"
            )
        return True

    def delete_design_file(self, relative_path: str) -> bool:
        """ভল্ট থেকে ফাইল মুছে ফেলা (যদি বিদ্যমান থাকে)"""
        try:
            abs_path = self.resolve_absolute_path(relative_path)
            if abs_path.is_file():
                abs_path.unlink()
                return True
            return False
        except Exception:
            return False


# সিঙ্গেলটন স্টোরেজ সার্ভিস ইনস্ট্যান্স
vault_storage_service = LaserVaultStorageService()

