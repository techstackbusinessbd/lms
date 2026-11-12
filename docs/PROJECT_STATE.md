# প্রজেক্ট স্ট্যাটাস ও কনসিস্টেন্সি ট্র্যাকার (Single Source of Truth)
## Denim Laser Automation & Control System (Denim LACS)

**প্রজেক্ট নাম:** Denim Laser Automation & Control System (Denim LACS)  
**বর্তমান ফেজ:** ফেজ ১ - আর্কিটেকচার ও ডকুমেন্টেশন (Pre-Development Phase)  
**অনুমোদনকারী কর্তৃপক্ষ:** Product Director / CTO (স্যার)  
**সর্বশেষ সিঙ্ক:** নভেম্বর ২০২৬  

---

## ১. অপরিবর্তনীয় গ্রাউন্ড ট্রুথ (Unbreakable Ground Truth)

যেকোনো নতুন ফিচার বা কোড লেখার আগে এই সত্যগুলো ভেরিফাই করতে হবে:
1. **মেশিন সংখ্যা ও ধরণ**: ২০টি Jeanologia ফ্ল্যাট কনভেয়ার লেজার মেশিন (Flat Conveyor Table)।
2. **লেজার সফটওয়্যার ও ফরম্যাট**: Jeanologia eMark সফটওয়্যার (`.jean` এবং `.jean5` নেটিভ ফরম্যাট)।
3. **উৎপাদনের অনুপাত**: ৮০-৯০% সম্পূর্ণ প্যান্ট (Complete Garment) এবং ১০-২০% কাটিং পার্টস (Cut Panels)।
4. **টেক স্ট্যাক (Locked)**:
   - ব্যাকএন্ড: **Python 3.13+** (FastAPI + SQLAlchemy 2.0 Async + asyncpg)
   - ডেটাবেজ: **PostgreSQL 16** (RFC 9562 UUIDv7 Primary Keys)
   - ফ্রন্টএন্ড: **React 19** + TypeScript 5.6+ + Vite 6 + Tailwind CSS v4 + TanStack Table v8
   - এজ-এজেন্ট: **Python 3.13 Standalone** (`laser_agent.exe` < 30MB RAM)
   - নেটওয়ার্ক: **লোকাল গিগাবিট ল্যান (১০০% অফলাইন ফাংশনাল)**

---

## ২. অনুমোদিত ৮টি ধারাবাহিক ধাপ (The Locked 8-Step Chain)

| ধাপ নম্বর | কাজের নাম | দায়িত্বপ্রাপ্ত রোল | স্ট্যাটাস |
| :---: | :--- | :--- | :---: |
| **ধাপ ১** | **অর্ডার ম্যানেজমেন্ট ও এন্ট্রি (Order Entry)** | মার্চেন্ডাইজার / প্ল্যানিং অফিসার | **SRS ড্রাফট সম্পন্ন** |
| **ধাপ ২** | **লেজার ডিজাইন ভল্ট ও রেসিপি ম্যাপিং** | লেজার ডিজাইনার (আপনি) | **SRS ড্রাফট সম্পন্ন** |
| **ধাপ ৩** | **QR Code Generate & Print** | সুইং / কাটিং কিউআর অপারেটর | **SRS ড্রাফট সম্পন্ন** |
| **ধাপ ৪** | **QR Code Attachment (ফ্রন্ট-ব্যাক জয়েন)** | সুইং অ্যাসেম্বলি অপারেটর | **SRS ড্রাফট সম্পন্ন** |
| **ধাপ ৫** | **Body Received at Laser (ট্রলি ইনটেক)** | লেজার রিসিভিং সুপারভাইজার | **SRS ড্রাফট সম্পন্ন** |
| **ধাপ ৬** | **Design File Auto-Ready at Machine** | সফটওয়্যার এজেন্ট (স্বয়ংক্রিয়) + মেশিন অপারেটর | **SRS ড্রাফট সম্পন্ন** |
| **ধাপ ৭** | **Production & Live Counting** | লেজার অপারেটর + সেন্ট্রাল সার্ভার | **SRS ড্রাফট সম্পন্ন** |
| **ধাপ ৮** | **QC Audit & Lot Handover** | লেজার কিউসি ইন্সপেক্টর | **SRS ড্রাফট সম্পন্ন** |

---

## ৩. বর্তমান অগ্রগতি ও পরবর্তী মাইলস্টোন

### ✅ যা যা সম্পন্ন হয়েছে:
- [x] প্রজেক্ট কনসিস্টেন্সি মেমরি লক (`g:\LMS\GEMINI.md` ও `~/.gemini/GEMINI.md`)-এ স্থায়ী সংরক্ষণ।
- [x] সুসংগঠিত ফোল্ডার আর্কিটেকচার (`01_srs`, `02_architecture`, `03_rules`, `04_workflows_sop`)।
- [x] প্রজেক্ট ও কঠোর কোডিং রুলস (`docs/03_rules/ENGINEERING_AND_CODING_RULES.md`) — সিনিয়র ক্রাফটসম্যানশিপ, এরর-লেস কোডিং, বাংলা কমেন্টিং ও ইংরেজি ইউআই/ইউএক্স রুলসহ ১৩টি কোর রুলস আপডেট।
- [x] টেকনোলজি স্ট্যাক স্পেসিফিকেশন (`docs/02_architecture/TECH_STACK.md`)।
- [x] স্ট্যান্ডার্ড অপারেটিং প্রসিডিউর ও RACI ম্যাট্রিক্স (`docs/04_workflows_sop/SOP_WORKFLOW_STEPS.md`)।
- [x] ধাপ ১-এর পুঙ্খানুপুঙ্খ এসআরএস (`docs/01_srs/STEP_01_ORDER_MANAGEMENT.md`)।
- [x] ধাপ ২-এর পুঙ্খানুপুঙ্খ এসআরএস (`docs/01_srs/STEP_02_LASER_DESIGN_VAULT.md`)।
- [x] ধাপ ৩-এর পুঙ্খানুপুঙ্খ এসআরএস (`docs/01_srs/STEP_03_QR_CODE_GENERATION_AND_PRINTING.md`)।
- [x] ধাপ ৪-এর পুঙ্খানুপুঙ্খ এসআরএস (`docs/01_srs/STEP_04_QR_CODE_ATTACHMENT.md`)।
- [x] ধাপ ৫-এর পুঙ্খানুপুঙ্খ এসআরএস (`docs/01_srs/STEP_05_BODY_RECEIVING_AT_LASER.md`)।
- [x] ধাপ ৬-এর পুঙ্খানুপুঙ্খ এসআরএস (`docs/01_srs/STEP_06_EMARK_AUTO_READY.md`)।
- [x] ধাপ ৭-এর পুঙ্খানুপুঙ্খ এসআরএস (`docs/01_srs/STEP_07_PRODUCTION_AND_LIVE_COUNTING.md`)।
- [x] ধাপ ৮-এর পুঙ্খানুপুঙ্খ এসআরএস (`docs/01_srs/STEP_08_QC_AUDIT_AND_LOT_HANDOVER.md`)।
- [x] ইনফ্রাস্ট্রাকচার ও হার্ডওয়্যার এসআরএস (`docs/01_srs/INFRASTRUCTURE_AND_HARDWARE_SETUP.md`)।
- [x] অ্যাথেন্টিকেশন ও সিকিউরিটি এসআরএস (`docs/01_srs/AUTHENTICATION_AND_SECURITY_SRS.md`)।
- [x] ডকার কনটেইনারাইজেশন ও সিঙ্গেল-পিসি সার্ভার এসআরএস (`docs/01_srs/DOCKER_CONTAINERIZATION_AND_DEPLOYMENT_SRS.md`)।
- [x] ভার্সন কন্ট্রোল ও এজ অটো-আপডেট এসআরএস (`docs/01_srs/VERSION_CONTROL_AND_RELEASE_MANAGEMENT_SRS.md`)।
- [x] ডেভেলপমেন্ট রোডম্যাপ ও মাইক্রো-স্টেপ প্ল্যান (`docs/02_architecture/DEVELOPMENT_PHASES_AND_ROADMAP.md`) — ১০টি ফেজ ও ৩০টি টেস্টেবল মাইক্রো-স্টেপ।
- [x] লাইভ ডেভেলপমেন্ট প্রগ্রেস ট্র্যাকার (`docs/DEVELOPMENT_TRACKER.md`) — প্রতিটি মাইক্রো-স্টেপের লাইভ স্ট্যাটাস ও ভেরিফিকেশন গেট।

### ⏳ বর্তমান কাজ (Next Action):
- [ ] ধাপ ১ থেকে ৮-এর পূর্ণ এসআরএস ও কনসোলিডেটেড ডেটাবেজ স্কিমা (PostgreSQL 16, RFC 9562 UUIDv7) সিটিও স্যার কর্তৃক পুঙ্খানুপুঙ্খ পর্যালোচনা ও চূড়ান্ত অনুমোদন গ্রহণ।
- [ ] সিটিও স্যারের চূড়ান্ত অনুমোদনের পরই কোডিং/ডেভেলপমেন্ট ফেজ শুরু করা।

