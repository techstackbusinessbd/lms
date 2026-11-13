"""
কিউআর কোড ও থার্মাল ZPL প্রিন্ট ইঞ্জিন (QR Code & ZPL Thermal Stencil Engine)
Denim Laser Automation & Control System (Denim LACS)

ক্যামেরা স্ক্যানারের জন্য অপ্টিমাইজড কম্প্যাক্ট কিউআর কোড জেনারেশন,
জেব্রা/টিএসপিএল থার্মাল প্রিন্টারের জন্য ZPL প্রিন্ট স্টেনসিল এবং ওয়েব প্রিভিউ পিএনজি জেনারেশন।
রুল ০৪ (<300 Lines), রুল ০৫ (Sub-50ms) এবং রুল ১১ (Bangla Comments) মেনে প্রস্তুতকৃত।
"""

import io
from typing import Dict, List, Optional
import qrcode
from qrcode.constants import ERROR_CORRECT_M

from app.models.garment_unit import GarmentUnit
from app.models.order import Order


def build_qr_payload(
    style_code: str,
    size_code: str,
    unit_serial_no: str,
    production_type: str = "COMPLETE_GARMENT",
) -> str:
    """
    ফিক্সড ক্যামেরা স্ক্যানারের জন্য কম্প্যাক্ট কিউআর পেলোড তৈরি করে।
    কম্প্যাক্ট পাইপ-ডিলিমিটেড ফরম্যাট ক্যামেরা স্ক্যানারে অনূর্ধ্ব ৫ms-এ ডিকোড হয়।
    Format: LACS|<STYLE>|<SIZE>|<SERIAL>|<TYPE_CODE>
    """
    type_code = "CG" if production_type == "COMPLETE_GARMENT" else "CP"
    clean_style = style_code.strip().replace("|", "-")
    clean_size = size_code.strip().replace("|", "-")
    clean_serial = unit_serial_no.strip().replace("|", "-")
    return f"LACS|{clean_style}|{clean_size}|{clean_serial}|{type_code}"


def parse_qr_payload(payload: str) -> Dict[str, str]:
    """
    ক্যামেরা স্ক্যানার থেকে প্রাপ্ত কিউআর পেলোড দ্রুত পার্স করে।
    Sub-1ms পার্সিং পারফরম্যান্স।
    """
    parts = payload.strip().split("|")
    if len(parts) >= 5 and parts[0] == "LACS":
        return {
            "prefix": parts[0],
            "style_code": parts[1],
            "size_code": parts[2],
            "unit_serial_no": parts[3],
            "production_type": "COMPLETE_GARMENT" if parts[4] == "CG" else "CUT_PANEL",
        }
    # ব্যাকওয়ার্ড সামঞ্জস্যতা
    return {"raw_payload": payload, "unit_serial_no": payload}


def generate_qr_png_bytes(payload: str, box_size: int = 8, border: int = 2) -> bytes:
    """
    ব্রাউজার প্রিভিউ ও ডিরেক্ট ওয়েব প্রিন্টের জন্য উচ্চ রেজোলিউশনের পিএনজি বাইট স্ট্রিম তৈরি করে।
    মিডিয়াম এরর কারেকশন (১৫%) ওয়াশ বা ডেনিম ডাস্টের মাঝেও নির্ভরযোগ্য স্ক্যানিং নিশ্চিত করে।
    """
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_M,
        box_size=box_size,
        border=border,
    )
    qr.add_data(payload)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def generate_zpl_single_label(
    unit: GarmentUnit,
    order: Optional[Order] = None,
    buyer_name: Optional[str] = None,
    job_no: Optional[str] = None,
) -> str:
    """
    একটি একক গার্মেন্ট পিসের জন্য ইন্ডাস্ট্রিয়াল Zebra ZPL কমান্ড জেনারেট করে।
    স্ট্যান্ডার্ড ডেনিম সিম লেবেল সাইজ: ৫০ মিমি x ৩০ মিমি (বা ২ ইঞ্চি x ১ ইঞ্চি)।
    Zebra প্রিন্টারের ইন্টারনাল কিউআর বারকোড ইঞ্জিন (^BQN) সরাসরি হার্ডওয়্যারে প্রসেস করে।
    """
    b_name = (buyer_name or (order.buyer_name if order else "DENIM RMG"))[:18].upper()
    s_code = (unit.style_code or (order.style_code if order else ""))[:18].upper()
    j_no = (job_no or (order.job_no or order.po_number if order else "PO"))[:18].upper()
    size = unit.size_code.upper()
    serial = unit.unit_serial_no
    payload = unit.qr_code_payload

    # ZPL লেবেল কমান্ড (২০৩ DPI থার্মাল প্রিন্টারের জন্য অপ্টিমাইজড)
    zpl = (
        "^XA\n"
        "^PW420\n"
        "^LL250\n"
        "^LH0,0\n"
        # ১. বায়ার নাম ও স্টাইল হেডার
        f"^FO25,20^A0N,22,22^FD{b_name}^FS\n"
        f"^FO25,48^A0N,20,20^FDSTYLE: {s_code}^FS\n"
        f"^FO25,72^A0N,18,18^FDJOB: {j_no}^FS\n"
        # ২. বড় ও স্পষ্ট সাইজ ইন্ডিকেটর
        f"^FO25,102^A0N,40,40^FDSIZE: {size}^FS\n"
        # ৩. হিউম্যান-রিডেবল সিরিয়াল নম্বর
        f"^FO25,155^A0N,18,18^FD{serial}^FS\n"
        # ৪. হার্ডওয়্যার কিউআর কোড (^BQN,2,4,M,7)
        f"^FO225,25^BQN,2,5,M,7^FDQA,{payload}^FS\n"
        # ৫. লেবেল ফুটার মার্ক
        "^FO25,190^GB370,1,1^FS\n"
        "^FO25,198^A0N,14,14^FDDENIM LACS AUTO-READY TRACE^FS\n"
        "^XZ\n"
    )
    return zpl


def generate_batch_zpl_stream(
    units: List[GarmentUnit],
    order: Optional[Order] = None,
) -> str:
    """
    একাধিক গার্মেন্ট ইউনিটের ZPL লেবেলকে একটি একক হাই-স্পিড প্রিন্ট স্পুল স্ট্রিমে একত্রিত করে।
    রোল প্রিন্টারে একাধারে ১০০-৫০০ স্টিকার প্রিন্টের জন্য ব্যবহৃত হয়।
    """
    labels = [generate_zpl_single_label(unit, order=order) for unit in units]
    return "".join(labels)
