# লাইভ ডেভেলপমেন্ট ট্র্যাকার (Live Development Progress Tracker)
## ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
**ডকুমেন্ট কোড:** `TRACKER-LACS-DEV-LIVE`  
**সংস্করণ:** v1.0.0 (Living Single Source of Development Truth)  
**অনুমোদনকারী কর্তৃপক্ষ:** Product Director / CTO (স্যার)  
**সর্বশেষ আপডেট:** ১২ নভেম্বর ২০২৬  

---

## ১. সার্বিক অগ্রগতি মিটার (Executive Progress Gauge)

```text
[ মোট ফেজ সংখ্যা ]: ১০টি ফেজ
[ মোট মাইক্রো-স্টেপ ]: ৩১টি স্টেপ
[ সম্পন্নকৃত স্টেপ ]: ০১ / ৩১ (৩.২%)
[ বর্তমানে চলমান ]: ফেজ ০, স্টেপ ০.১ (Docker Dev Stack & Backend Skeleton)
[ সিস্টেম স্ট্যাটাস ]: ডকার ব্যাকএন্ড স্কেলিটন কোডিং চলছে (🔄 IN_PROGRESS)
```

---

## ২. মাইক্রো-স্টেপ অগ্রগতি ট্র্যাকিং ম্যাট্রিক্স (Master Tracking Matrix)

### স্ট্যাটাস লেজেন্ড:
* `⏳ PENDING`: অপেক্ষমাণ (কাজ শুরু হয়নি)
* `🔄 IN_PROGRESS`: বর্তমানে সক্রিয়ভাবে কোডিং চলছে
* `🧪 TESTED`: এরর-লেস টেস্ট সম্পন্ন (লোকাল ভেরিফাইড)
* `✅ APPROVED`: সিটিও স্যার কর্তৃক পর্যালোচিত ও অনুমোদিত

| ফেজ ও স্টেপ | টাস্কের নাম | সংশ্লিষ্ট ফাইল/কম্পোনেন্ট | স্ট্যাটাস | টেস্ট ও ভেরিফিকেশন | সিটিও সাইন-অফ |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **০.০** | Consolidated Database Schema & ERD | `docs/02_architecture/DATABASE_SCHEMA_AND_ERD.md` | `✅ APPROVED` | PostgreSQL 16, UUIDv7 & DDL Audit | ✅ অনুমোদিত (১২/১১/২৬) |
| **০.১** | Docker Dev Stack & Backend Skeleton | `deployment/docker-compose.dev.yml`, `backend/app/core/config.py` | `🧪 TESTED` | Python Syntax & Pydantic Verified | ⏳ পর্যালোচনায় |
| **০.২** | Async DB Engine & UUIDv7 Base | `backend/app/core/database.py`, `models/base.py` | `⏳ PENDING` | Async Engine & UUIDv7 Ping | ⏳ অপেক্ষমাণ |
| **০.৩** | React 19 Frontend Skeleton | `frontend/package.json`, `vite.config.ts` | `⏳ PENDING` | Strict Typecheck (`noImplicitAny`) | ⏳ অপেক্ষমাণ |
| **০.৪** | Master UI Design System | `frontend/src/components/ui/*` | `⏳ PENDING` | 48px Touch & Clean UI Audit | ⏳ অপেক্ষমাণ |
| **১.১** | Auth Database Models | `backend/app/models/user.py`, `migrations/` | `⏳ PENDING` | Alembic Migration Up/Down | ⏳ অপেক্ষমাণ |
| **১.২** | Auth Service & Quick-PIN API | `backend/app/services/auth_service.py` | `⏳ PENDING` | Argon2id & JWT Test | ⏳ অপেক্ষমাণ |
| **১.৩** | Frontend Login & PIN Pad | `frontend/src/pages/auth/Login.tsx` | `⏳ PENDING` | Touch UX & Rate Limit Check | ⏳ অপেক্ষমাণ |
| **২.১** | Order Database Models | `backend/app/models/order.py` | `⏳ PENDING` | Size Matrix Relational Integrity | ⏳ অপেক্ষমাণ |
| **২.২** | Order Service & Endpoints | `backend/app/services/order_service.py` | `⏳ PENDING` | PO Breakdown CRUD Test | ⏳ অপেক্ষমাণ |
| **২.৩** | Order Management UI | `frontend/src/pages/orders/OrderList.tsx` | `⏳ PENDING` | TanStack Virtualized Table | ⏳ অপেক্ষমাণ |
| **৩.১** | Laser Design Vault Storage | `backend/app/models/design.py`, `D:\LACS_VAULT\` | `⏳ PENDING` | File System Access & Permissions | ⏳ অপেক্ষমাণ |
| **৩.২** | Recipe Upload & Lock API | `backend/app/services/vault_service.py` | `⏳ PENDING` | SHA-256 Checksum Validation | ⏳ অপেক্ষমাণ |
| **৩.৩** | Designer Portal UI | `frontend/src/pages/designer/Vault.tsx` | `⏳ PENDING` | Drag-Drop & Parameter Lock | ⏳ অপেক্ষমাণ |
| **৪.১** | Garment Unit DB Models | `backend/app/models/garment.py` | `⏳ PENDING` | Unique QR Hash Index Check | ⏳ অপেক্ষমাণ |
| **৪.২** | QR Generator & ZPL Engine | `backend/app/services/zpl_service.py` | `⏳ PENDING` | Raw ZPL II Emulation Test | ⏳ অপেক্ষমাণ |
| **৪.৩** | Thermal Print Station UI | `frontend/src/pages/printing/QRStation.tsx` | `⏳ PENDING` | Batch Print Queue Test | ⏳ অপেক্ষমাণ |
| **৫.১** | Intake & Chalan DB Models | `backend/app/models/intake.py` | `⏳ PENDING` | Chalan Foreign Keys Check | ⏳ অপেক্ষমাণ |
| **৫.২** | Intake Verification API | `backend/app/services/intake_service.py` | `⏳ PENDING` | Shortage Detection Algorithm | ⏳ অপেক্ষমাণ |
| **৫.৩** | Intake Tablet UI | `frontend/src/pages/intake/Receiving.tsx` | `⏳ PENDING` | High-Contrast Ambient Lighting | ⏳ অপেক্ষমাণ |
| **৬.১** | Edge Agent Core & Service | `edge_agent/src/agent_service.py` | `⏳ PENDING` | RAM Check (<30 MB Cap) | ⏳ অপেক্ষমাণ |
| **৬.২** | Scanner Serial Listener | `edge_agent/src/scanner_listener.py` | `⏳ PENDING` | Sub-20ms pySerial Auto-Reconnect | ⏳ অপেক্ষমাণ |
| **৬.৩** | Atomic File Dispatcher | `edge_agent/src/file_dispatcher.py` | `⏳ PENDING` | `.tmp` to `.jean5` Atomic Replace | ⏳ অপেক্ষমাণ |
| **৬.৪** | Local SQLite Spillover Buffer | `edge_agent/src/offline_buffer.py` | `⏳ PENDING` | LAN Outage Survival & Sync | ⏳ অপেক্ষমাণ |
| **৭.১** | Production Logging DB Models | `backend/app/models/production.py` | `⏳ PENDING` | High-Concurrency Index Check | ⏳ অপেক্ষমাণ |
| **৭.২** | FastAPI WebSocket Engine | `backend/app/websockets/`, `oee_service.py` | `⏳ PENDING` | 20-Machine Broadcast (<50ms) | ⏳ অপেক্ষমাণ |
| **৭.৩** | Live 20-Machine Fleet UI | `frontend/src/pages/dashboard/LiveFleet.tsx` | `⏳ PENDING` | Zero-Polling WebSockets UI | ⏳ অপেক্ষমাণ |
| **৮.১** | QC Audit & Handover Models | `backend/app/models/qc.py` | `⏳ PENDING` | Defect Taxonomy Enum Check | ⏳ অপেক্ষমাণ |
| **৮.২** | QC & Re-Laser Routing API | `backend/app/services/qc_service.py` | `⏳ PENDING` | -20% Power Offset Routing Test | ⏳ অপেক্ষমাণ |
| **৮.৩** | QC Tablet & Wash Intake UI | `frontend/src/pages/qc/InspectionTablet.tsx` | `⏳ PENDING` | 1-Touch Hotspot Logging Test | ⏳ অপেক্ষমাণ |
| **৯.১** | Docker Compose Deployment | `deployment/docker-compose.yml`, `nginx.conf` | `⏳ PENDING` | 1-Click Server Spin-up | ⏳ অপেক্ষমাণ |
| **৯.২** | Agent PyInstaller Binary | `edge_agent/build_agent.bat` | `⏳ PENDING` | `laser_agent.exe` Standalone Run | ⏳ অপেক্ষমাণ |
| **৯.৩** | End-to-End Latency Audit | Complete System Test | `⏳ PENDING` | Sub-200ms Scan-to-Laser SLA | ⏳ অপেক্ষমাণ |

---

## ৩. বর্তমান সক্রিয় স্টেপ কার্ড (Current Active Step Card)

```yaml
Current Active Step: "না (অনুমোদনের অপেক্ষায়)"
Next Step in Queue: "ফেজ ০, স্টেপ ০.০ - Consolidated Database Schema & ERD Architecture"
Primary File Target: "docs/02_architecture/DATABASE_SCHEMA_AND_ERD.md"
Goal: "সম্পূর্ণ ৮টি ধাপের ২০+ টেবিলের DDL, RFC 9562 UUIDv7, B-Tree ইনডেক্স ও রিলেশনশিপ অনুমোদন"
Success Metric: "রুল ০২ অনুযায়ী সিটিও স্যারের শতভাগ সাইন-অফ ও জিরো কনফ্লিক্ট আর্কিটেকচার"
CTO Sign-off Status: "অপেক্ষমাণ"
```

---

## ৪. স্টেপ পরিবর্তনের স্ট্যান্ডার্ড প্রটোকল (Step Transition Protocol)

প্রতিটি মাইক্রো-স্টেপ কোড করার ক্ষেত্রে নিচের ধাপগুলো বাধ্যতামূলকভাবে অনুসরণ করা হবে:
1. **[স্টেপ শুরু]**: সিটিও স্যারের অনুমতি পাওয়ামাত্র ট্র্যাকারে স্ট্যাটাস `🔄 IN_PROGRESS` হবে।
2. **[কোডিং সম্পন্ন]**: সর্বোচ্চ ৩০০ লাইনের মধ্যে মডুলার, এরর-লেস কোড এবং বাংলায় কমেন্ট লিখে ফাইল সেভ হবে।
3. **[টেস্টিং ও অডিট]**: টাইপচেক ও টেস্ট রান করে স্ট্যাটাস `🧪 TESTED` করা হবে।
4. **[সিটিও রিভিউ ও সাইন-অফ]**: কোড ও ফলাফল স্যারের সামনে উপস্থাপন করা হবে। স্যার অনুমোদন দিলে স্ট্যাটাস `✅ APPROVED` হবে এবং অগ্রগতি শতাংশ আপডেট হবে।
5. পরবর্তী স্টেপে যাওয়ার পূর্বে পুনরায় স্যারের অনুমতি নেওয়া হবে।

