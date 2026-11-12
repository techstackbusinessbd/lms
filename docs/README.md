# ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
## ডকুমেন্টেশন ও আর্কিটেকচার পোর্টাল (Master Documentation Hub)

**প্রজেক্ট নাম:** Denim Laser Automation & Control System (Denim LACS)  
**টার্গেট প্ল্যাটফর্ম:** ২০টি Jeanologia ফ্ল্যাট কনভেয়ার লেজার মেশিন (eMark Software)  
**অনুমোদনকারী কর্তৃপক্ষ:** Product Director / CTO (স্যার)  
**ভার্সন:** v1.1.0  
**সর্বশেষ আপডেট:** নভেম্বর ২০২৬  

---

## ১. প্রজেক্ট ফোল্ডার স্ট্রাকচার (Project Directory Architecture)

সম্পূর্ণ সফটওয়্যার প্রজেক্টটি নিচের বিশ্বমানের এন্টারপ্রাইজ ফোল্ডার কাঠামোতে পরিচালিত হচ্ছে:

```text
G:\LMS\
│
├── STEP_TRACKER.md                     # 🚀 মাস্টার লাইভ স্টেপ ট্র্যাকার (৩০টি মাইক্রো-স্টেপ রিয়েলটাইম মনিটর)
├── GEMINI.md                           # ⚠️ ওয়ার্কস্পেস মেমরি ও কনসিস্টেন্সি গার্ড
│
├── docs\                               # সুসংগঠিত মাস্টার ডকুমেন্টেশন
│   ├── DEVELOPMENT_TRACKER.md          # 📊 লাইভ ডেভেলপমেন্ট প্রগ্রেস ট্র্যাকার (৩০টি মাইক্রো-স্টেপ)
│   ├── PROJECT_STATE.md                # প্রজেক্ট স্ট্যাটাস ও কনসিস্টেন্সি ট্র্যাকার
│   ├── 01_srs\                         # সফটওয়্যার রিকোয়ারমেন্টস স্পেসিফিকেশন
│   │   ├── MASTER_SRS.md               # মাস্টার সিস্টেম এসআরএস
│   │   ├── INFRASTRUCTURE_AND_HARDWARE_SETUP.md # ইনফ্রাস্ট্রাকচার ও হার্ডওয়্যার এসআরএস
│   │   ├── AUTHENTICATION_AND_SECURITY_SRS.md # অ্যাথেন্টিকেশন ও সিকিউরিটি এসআরএস
│   │   ├── DOCKER_CONTAINERIZATION_AND_DEPLOYMENT_SRS.md # ডকার ও সিঙ্গেল-পিসি সার্ভার এসআরএস
│   │   ├── VERSION_CONTROL_AND_RELEASE_MANAGEMENT_SRS.md # ভার্সন কন্ট্রোল ও এজ অটো-আপডেট এসআরএস
│   │   ├── STEP_01_ORDER_MANAGEMENT.md # ধাপ ১: অর্ডার ম্যানেজমেন্ট মডিউল এসআরএস
│   │   ├── STEP_02_LASER_DESIGN_VAULT.md # ধাপ ২: লেজার ডিজাইন ভল্ট ও রেসিপি এসআরএস
│   │   ├── STEP_03_QR_CODE_GENERATION_AND_PRINTING.md # ধাপ ৩: কিউআর প্রিন্টিং এসআরএস
│   │   ├── STEP_04_QR_CODE_ATTACHMENT.md # ধাপ ৪: সুইং কিউআর অ্যাটাচমেন্ট এসআরএস
│   │   ├── STEP_05_BODY_RECEIVING_AT_LASER.md # ধাপ ৫: লেজার বডি রিসিভিং এসআরএস
│   │   ├── STEP_06_EMARK_AUTO_READY.md # ধাপ ৬: eMark অটো-রেডি ও এজ-এজেন্ট এসআরএস
│   │   ├── STEP_07_PRODUCTION_AND_LIVE_COUNTING.md # ধাপ ৭: প্রোডাকশন ও লাইভ ওবিআই এসআরএস
│   │   └── STEP_08_QC_AUDIT_AND_LOT_HANDOVER.md # ধাপ ৮: কিউসি অডিট ও ওয়াশ হ্যান্ডওভার এসআরএস
│   │
│   ├── 02_architecture\                # প্রযুক্তি ও আর্কিটেকচারাল স্পেসিফিকেশন
│   │   ├── TECH_STACK.md               # পাইথন ৩.১৩, পোস্টগ্রেস, রিঅ্যাক্ট ১৯ স্পেক
│   │   ├── DATABASE_SCHEMA_AND_ERD.md  # একীভূত ডেটাবেজ আর্কিটেকচার ও ইআরডি (PostgreSQL 16)
│   │   └── DEVELOPMENT_PHASES_AND_ROADMAP.md # ১০টি ফেজ ও ৩০টি মাইক্রো-স্টেপ রোডম্যাপ
│   │
│   ├── 03_rules\                       # ইঞ্জিনিয়ারিং ও কঠোর কোডিং রুলস
│   │   └── ENGINEERING_AND_CODING_RULES.md # কোডিং স্ট্যান্ডার্ডস ও নীতিসমূহ
│   │
│   └── 04_workflows_sop\               # স্ট্যান্ডার্ড অপারেটিং প্রসিডিউর (এসওপি)
│       └── SOP_WORKFLOW_STEPS.md       # ৮টি কাজের ধাপ ও RACI রেসপনসিবিলিটি ম্যাট্রিক্স
│
├── backend\                            # Python 3.13+ FastAPI সেন্ট্রাল ব্যাকএন্ড (পরিকল্পিত)
│   ├── app\
│   │   ├── api\v1\                     # এপিআই রাউটস (orders, designs, sync, tracking)
│   │   ├── core\                       # কনফিগ (.env), সিকিউরিটি, ডাটাবেজ সেশন
│   │   ├── models\                     # SQLAlchemy 2.0 Async ওআরএম মডেল
│   │   ├── schemas\                    # Pydantic v2 DTO রিকোয়েস্ট/রেসপন্স স্কিমা
│   │   └── services\                   # বিজনেস লজিক সার্ভিসেস
│   ├── migrations\                     # Alembic ডাটাবেজ মাইগ্রেশন স্ক্রিপ্ট
│   └── requirements.txt                # পাইথন ৩.১৩ প্যাকেজ ডিপেন্ডেন্সি
│
├── frontend\                           # React 19 + TypeScript + Tailwind CSS (পরিকল্পিত)
│   ├── src\
│   │   ├── components\                 # পুনর্ব্যবহারযোগ্য UI কম্পোনেন্টস (Buttons, Badges)
│   │   ├── pages\                      # অর্ডার এন্ট্রি, ডিজাইনার ভল্ট, প্রিন্ট স্টেশন, ওবিআই
│   │   ├── hooks\                      # TanStack Query v5 ও WebSocket হুকস
│   │   └── lib\                        # ZPL থার্মাল প্রিন্ট ও ইউটিলিটি
│   └── package.json
│
├── edge_agent\                         # ২০টি Jeanologia Windows IPC-র জন্য লাইটওয়েট এজেন্ট
│   ├── src\
│   │   ├── scanner_listener.py         # ইউএসবি বারকোড স্ক্যানার রিডার (pySerial)
│   │   ├── file_dispatcher.py          # eMark হটফোল্ডারে অ্যাটমিক ফাইল রাইটার
│   │   └── offline_buffer.py           # লোকাল SQLite ফল্ট-টলারেন্ট স্পিলওভার
│   ├── config.ini                      # মেশিন স্পেসিফিক কনফিগারেশন
│   └── build_agent.bat                 # PyInstaller দিয়ে laser_agent.exe তৈরির স্ক্রিপ্ট
│
└── deployment\                         # প্রোডাকশন ডিপ্লয়মেন্ট কনফিগারেশন
    ├── docker-compose.yml              # সেন্ট্রাল সার্ভার ১-ক্লিক রান স্ক্রিপ্ট
    ├── Dockerfile.backend              # ব্যাকএন্ড ডকার কনটেইনার
    ├── Dockerfile.frontend             # ফ্রন্টএন্ড ডকার ও Nginx বিল্ড
    └── nginx.conf                      # রিভার্স প্রক্সি কনফিগারেশন
```

---

## ২. লেজার ডিজাইন ফাইল ভল্ট ফোল্ডার স্ট্রাকচার (Designer File Storage Structure)

সার্ভারের লোকাল এসএসডি ডিস্কে এবং ২০টি Jeanologia মেশিনে আপনার `.jean` এবং `.jean5` ফাইলগুলো যেভাবে সুশৃঙ্খলভাবে সাজানো থাকবে:

### সেন্ট্রাল সার্ভার ভল্ট (`D:\LACS_VAULT\`):
```text
D:\LACS_VAULT\
│
└── [BUYER_NAME]\                       # যেমন: LEVIS
    └── [STYLE_CODE]\                   # যেমন: STYLE_511
        └── [WASH_REF]\                 # যেমন: DARK_VINTAGE_W104
            │
            ├── COMPLETE_GARMENTS\      # ৮০-৯০% সম্পূর্ণ প্যান্টের ফাইল
            │   ├── W28\
            │   │   ├── Style511_W28_Front.jean5
            │   │   └── Style511_W28_Back.jean5
            │   ├── W30\
            │   │   ├── Style511_W30_Front.jean5
            │   │   └── Style511_W30_Back.jean5
            │   ├── W32\
            │   │   ├── Style511_W32_Front.jean5
            │   │   └── Style511_W32_Back.jean5
            │   └── W34\
            │       ├── Style511_W34_Front.jean5
            │       └── Style511_W34_Back.jean5
            │
            └── CUT_PANELS\             # ১০-২০% কাটিং পার্টসের ফাইল
                ├── Pocket_Left.jean5
                ├── Pocket_Right.jean5
                └── Coin_Pocket.jean5
```

### ২০টি Jeanologia মেশিনের লোকাল আইপিসিতে (`C:\Jeanologia_Agent\`):
```text
C:\Jeanologia_Agent\
├── laser_agent.exe                     # ব্যাকগ্রাউন্ড উইন্ডোজ সার্ভিস
├── config.ini                          # মেশিনের নিজস্ব কনফিগ (MACHINE_ID=M07)
├── offline_buffer.db                   # নেটওয়ার্ক ড্রপ করলে লোকাল বাফার
├── logs\                               # প্রতিদিনের স্ক্যান ও অপারেশনের এরর লগ
└── active_job\                         # eMark এই ফোল্ডারের দিকে নজর রাখবে (Hotfolder)
    ├── current_front.jean5             # স্ক্যান হওয়া মাত্র পুশ করা ফাইল
    └── current_back.jean5
```

---

## ৩. মাস্টার ডকুমেন্টেশন তালিকা ও লিঙ্ক

1. 📑 **ধাপ ১: অর্ডার ম্যানেজমেন্ট এসআরএস**: [`docs/01_srs/STEP_01_ORDER_MANAGEMENT.md`](file:///g:/LMS/docs/01_srs/STEP_01_ORDER_MANAGEMENT.md)
2. 📑 **ধাপ ২: লেজার ডিজাইন ভল্ট ও রেসিপি এসআরএস**: [`docs/01_srs/STEP_02_LASER_DESIGN_VAULT.md`](file:///g:/LMS/docs/01_srs/STEP_02_LASER_DESIGN_VAULT.md)
3. 📑 **ধাপ ৩: কিউআর কোড জেনারেশন ও প্রিন্টিং এসআরএস**: [`docs/01_srs/STEP_03_QR_CODE_GENERATION_AND_PRINTING.md`](file:///g:/LMS/docs/01_srs/STEP_03_QR_CODE_GENERATION_AND_PRINTING.md)
4. 📑 **ধাপ ৪: সুইং কিউআর অ্যাটাচমেন্ট এসআরএস**: [`docs/01_srs/STEP_04_QR_CODE_ATTACHMENT.md`](file:///g:/LMS/docs/01_srs/STEP_04_QR_CODE_ATTACHMENT.md)
5. 📑 **ধাপ ৫: লেজার বডি রিসিভিং ও ইনটেক এসআরএস**: [`docs/01_srs/STEP_05_BODY_RECEIVING_AT_LASER.md`](file:///g:/LMS/docs/01_srs/STEP_05_BODY_RECEIVING_AT_LASER.md)
6. 📑 **ধাপ ৬: eMark অটো-রেডি ও এজ-এজেন্ট এসআরএস**: [`docs/01_srs/STEP_06_EMARK_AUTO_READY.md`](file:///g:/LMS/docs/01_srs/STEP_06_EMARK_AUTO_READY.md)
7. 📑 **ধাপ ৭: প্রোডাকশন ও লাইভ OEE এসআরএস**: [`docs/01_srs/STEP_07_PRODUCTION_AND_LIVE_COUNTING.md`](file:///g:/LMS/docs/01_srs/STEP_07_PRODUCTION_AND_LIVE_COUNTING.md)
8. 📑 **ধাপ ৮: কিউসি অডিট ও ওয়াশ হ্যান্ডওভার এসআরএস**: [`docs/01_srs/STEP_08_QC_AUDIT_AND_LOT_HANDOVER.md`](file:///g:/LMS/docs/01_srs/STEP_08_QC_AUDIT_AND_LOT_HANDOVER.md)
9. 📄 **সিস্টেম মাস্টার এসআরএস**: [`docs/01_srs/MASTER_SRS.md`](file:///g:/LMS/docs/01_srs/MASTER_SRS.md)
10. 🛠️ **টেকনোলজি স্ট্যাক স্পেসিফিকেশন**: [`docs/02_architecture/TECH_STACK.md`](file:///g:/LMS/docs/02_architecture/TECH_STACK.md)
11. 📜 **কোডিং ও ইঞ্জিনিয়ারিং রুলস**: [`docs/03_rules/ENGINEERING_AND_CODING_RULES.md`](file:///g:/LMS/docs/03_rules/ENGINEERING_AND_CODING_RULES.md)
12. 📋 **স্ট্যান্ডার্ড অপারেটিং প্রসিডিউর (SOP ও RACI)**: [`docs/04_workflows_sop/SOP_WORKFLOW_STEPS.md`](file:///g:/LMS/docs/04_workflows_sop/SOP_WORKFLOW_STEPS.md)
13. 🖥️ **ইনফ্রাস্ট্রাকচার ও হার্ডওয়্যার স্পেসিফিকেশন**: [`docs/01_srs/INFRASTRUCTURE_AND_HARDWARE_SETUP.md`](file:///g:/LMS/docs/01_srs/INFRASTRUCTURE_AND_HARDWARE_SETUP.md)
14. 🔐 **অ্যাথেন্টিকেশন ও সিকিউরিটি স্পেসিফিকেশন**: [`docs/01_srs/AUTHENTICATION_AND_SECURITY_SRS.md`](file:///g:/LMS/docs/01_srs/AUTHENTICATION_AND_SECURITY_SRS.md)
15. 🗺️ **ডেভেলপমেন্ট রোডম্যাপ ও মাইক্রো-স্টেপ প্ল্যান**: [`docs/02_architecture/DEVELOPMENT_PHASES_AND_ROADMAP.md`](file:///g:/LMS/docs/02_architecture/DEVELOPMENT_PHASES_AND_ROADMAP.md)
16. 📊 **লাইভ ডেভেলপমেন্ট প্রগ্রেস ট্র্যাকার**: [`docs/DEVELOPMENT_TRACKER.md`](file:///g:/LMS/docs/DEVELOPMENT_TRACKER.md)
17. 🐳 **ডকার কনটেইনারাইজেশন ও সিঙ্গেল-পিসি সার্ভার এসআরএস**: [`docs/01_srs/DOCKER_CONTAINERIZATION_AND_DEPLOYMENT_SRS.md`](file:///g:/LMS/docs/01_srs/DOCKER_CONTAINERIZATION_AND_DEPLOYMENT_SRS.md)
18. 🔄 **ভার্সন কন্ট্রোল ও এজ অটো-আপডেট এসআরএস**: [`docs/01_srs/VERSION_CONTROL_AND_RELEASE_MANAGEMENT_SRS.md`](file:///g:/LMS/docs/01_srs/VERSION_CONTROL_AND_RELEASE_MANAGEMENT_SRS.md)
19. 🗄️ **একীভূত ডেটাবেজ আর্কিটেকচার ও ইআরডি**: [`docs/02_architecture/DATABASE_SCHEMA_AND_ERD.md`](file:///g:/LMS/docs/02_architecture/DATABASE_SCHEMA_AND_ERD.md)

