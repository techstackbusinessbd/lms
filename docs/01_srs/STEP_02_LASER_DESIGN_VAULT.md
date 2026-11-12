# সফটওয়্যার রিকোয়ারমেন্টস স্পেসিফিকেশন (SRS) - ধাপ ২
## মডিউল: লেজার ডিজাইন ভল্ট ও রেসিপি ম্যাপিং (Laser Design Vault & Recipe Management)
**ডকুমেন্ট কোড:** `SRS-LACS-MOD-02`  
**সংস্করণ:** v1.0.0 (Granular Module Specification)  
**মডিউল প্যারেন্ট:** Denim Laser Automation & Control System (Denim LACS)  
**মডিউল ওনার:** লেজার ডিজাইনার (Laser Designer)  
**অনুমোদনকারী কর্তৃপক্ষ:** Product Director / CTO (স্যার)  
**তারিখ:** নভেম্বর ২০২৬  

---

## ১. মডিউল পরিচিতি ও ব্যবসায়িক উদ্দেশ্য (Introduction & Objectives)

### ১.১ প্রেক্ষাপট ও গুরুত্ব
একটি ডেনিম ওয়াশিং প্ল্যান্টে ২০টি Jeanologia ফ্ল্যাট কনভেয়ার লেজার মেশিনে প্রতিদিন হাজার হাজার প্যান্টে হুইস্কার (Whisker), স্ক্র্যাপিং (Scraping), চেভরন (Chevron) এবং ডেস্ট্রাকশন (Destruction) লেজারিং হয়। 
বর্তমানে ডিজাইনারদের পেনড্রাইভে করে ফাইল নিয়ে ২০টি মেশিনে ঘুরে ঘুরে লোড করতে হয়, অথবা লোকাল শেয়ার ফোল্ডার থেকে অপারেটররা ম্যানুয়ালি ফাইল ব্রাউজ করে। এতে ভুল সাইজের ফাইল লোড হওয়া এবং অপারেটর কর্তৃক মনগড়া লেজার পাওয়ার/স্পিড পরিবর্তনের কারণে ফেব্রিক নষ্ট হওয়ার প্রচুর ঘটনা ঘটে।

### ১.২ মূল উদ্দেশ্য
1. **সেন্ট্রাল ফাইল ভল্ট**: ডিজাইনার তার ডেস্কে বসেই অনুমোদিত বায়ার অর্ডারের বিপরীতে Jeanologia eMark-এর নেটিভ `.jean` ও `.jean5` ফাইল সেন্ট্রাল সার্ভারে আপলোড ও লক করবেন।
2. **সাইজ-ওয়াইজ ফ্রন্ট ও ব্যাক ম্যাপিং**: প্রতিটি সাইজের (W28, W30, W32, W34...) বিপরীতে সঠিক `Front.jean5` এবং `Back.jean5` লিঙ্ক করা।
3. **টেম্পার-প্রুফ রেসিপি লকিং (Anti-Tampering Lock)**: লেজার পাওয়ার (Power %), মার্কিং স্পিড (Speed mm/s), ফ্রিকোয়েন্সি (kHz) এবং ডিপিআই (DPI) প্যারামিটার সফটওয়্যার দ্বারা লক থাকবে; শপ-ফ্লোরে কোনো অপারেটর এটি পরিবর্তন করতে পারবে না।
4. **২০টি মেশিনে ব্যাকগ্রাউন্ড প্রি-সিঙ্ক**: অনুমোদিত ফাইলগুলো লোকাল ল্যানের মাধ্যমে ২০টি মেশিনের এজেন্টে আগে থেকেই ক্যাশ হয়ে থাকবে, যাতে টেবিলে কিউআর স্ক্যান করামাত্র **২০০ মিলি-সেকেন্ডের মধ্যে** eMark ফাইলটি সক্রিয় করতে পারে।

---

## ২. ব্যবহারকারীর ভূমিকা ও পারমিশন (User Roles & Access Control)

| রোল (Role) | অনুমতি (Permissions) | দায়িত্ব |
| :--- | :--- | :--- |
| **লেজার ডিজাইনার (Laser Designer - Admin)** | Create, Upload, Edit, Lock, Approve | `.jean` ও `.jean5` ফাইল আপলোড, সাইজ ম্যাপিং, প্যারামিটার লক ও রিভিশন কন্ট্রোল। |
| **টেকনিক্যাল ডিজাইনার / অ্যাসিস্ট্যান্ট** | Upload, Read, Test Mode | টেস্ট স্যাম্পল ফাইল আপলোড ও মেশিনে টেস্ট প্যাটার্ন রান করা। |
| **লেজার শপ-ফ্লোর অপারেটর (২০টি মেশিন)** | Read Only (Automated) | কোনো ফাইলে হাত দিতে পারবে না; কিউআর স্ক্যানের মাধ্যমে সিস্টেম ফাইল লোড করবে। |
| **সিটিও / প্ল্যানিং হেড (CTO / Head)** | Audit, Read, Recipe Oversight | অনুমোদিত সমস্ত স্টাইলের ডিজাইন রেসিপি ও হিস্ট্রি অডিট করা। |

---

## ৩. ডিজাইন লাইফসাইকেল ও স্টেট মেশিন (Design Recipe State Machine)

একটি লেজার রেসিপি নিচের স্টেটগুলো অতিক্রম করে চূড়ান্ত লক হবে:

```
[DRAFT] 
   │ (ডিজাইনার ফাইল আপলোড করে কিন্তু প্যারামিটার টেস্ট বাকি থাকে)
   ▼
[TEST_SAMPLE] 
   │ (১টি জিনোলজিয়া মেশিনে পরীক্ষামূলক ১ পিস স্যাম্পল লেজার রান)
   ▼
[BULK_APPROVED & LOCKED] 
   │ (ডিজাইনার রেসিপি লক করে দেন; সুইং সেকশন এখন এই PO-র কিউআর প্রিন্ট করতে পারবে)
   ▼
[REVISED] 
   │ (বায়ার যদি হুইস্কারের ইনটেনসিটি বা ডিজাইনে পরিবর্তন আনে, তখন নতুন রিভিশন)
   ▼
[ARCHIVED]
```

---

## ৪. স্ক্রিন ও ইউজার ইন্টারফেস স্পেসিফিকেশন (Designer Vault UI)

ডিজাইনার পোর্টালটি (`http://192.168.1.100/designer`) আধুনিক, ক্লিন এবং ড্র্যাগ-অ্যান্ড-ড্রপ ফ্রেন্ডলি হবে:

### ৪.১ অর্ডার সিলেকশন প্যানেল (Order Selection Bar)
* স্ক্রিনের শীর্ষে পেন্ডিং অর্ডারের তালিকা থাকবে (ধাপ ১-এর এন্ট্রি করা অর্ডার):
  * বায়ার: *Levi Strauss* | PO: *884920* | স্টাইল: *511 Slim* | ওয়াশ: *Dark Vintage* | মোট পিস: *৫,০০০*
* স্ট্যাটাস ব্যাজ: `PENDING_DESIGN` (হলুদ রঙের অ্যালার্ট)।

### ৪.২ সাইজ ম্যাপিং গ্রিড (Size-Wise File Mapping Grid)
প্রতিটি অর্ডারে যতগুলো সাইজ রয়েছে, তার জন্য পৃথক আপলোড স্লট থাকবে:

| সাইজ (Size) | ফ্রন্ট ডিজাইন ফাইল (Front Pass) | ব্যাক ডিজাইন ফাইল (Back Pass) | প্যারামিটার স্ট্যাটাস | অ্যাকশন |
| :---: | :---: | :---: | :---: | :---: |
| **W28** | `Style511_W28_F.jean5` (3.4 MB) | `Style511_W28_B.jean5` (4.1 MB) | Power: 65% \| Speed: 2500 \| DPI: 35 | [ Test ] [ Re-upload ] |
| **W30** | `Style511_W30_F.jean5` (3.6 MB) | `Style511_W30_B.jean5` (4.2 MB) | Power: 65% \| Speed: 2500 \| DPI: 35 | [ Test ] [ Re-upload ] |
| **W32** | `Style511_W32_F.jean5` (3.8 MB) | `Style511_W32_B.jean5` (4.5 MB) | Power: 65% \| Speed: 2500 \| DPI: 35 | [ Test ] [ Re-upload ] |
| **W34** | `Style511_W34_F.jean5` (4.0 MB) | `Style511_W34_B.jean5` (4.7 MB) | Power: 68% \| Speed: 2400 \| DPI: 35 | [ Test ] [ Re-upload ] |

### ৪.৩ প্যারামিটার লকার ও কনফিগারেশন প্যানেল (Recipe Locker Panel)
প্রতিটি ফাইলের সাথে নিচের প্যারামিটারগুলো সংরক্ষিত ও লক থাকবে:
* **Laser Power**: ৫০% – ৯০% (ফেব্রিক ওজনের ওপর ভিত্তি করে)
* **Marking Speed**: ১৫০০ – ৩৫০০ mm/s
* **Pulse Frequency**: ১৫ – ৫০ kHz
* **Resolution (DPI)**: ২৫, ৩০, ৩৫, ৪০ বা ৫০ DPI
* **Laser Passes**: ১ পাস (স্ট্যান্ডার্ড) অথবা ২ পাস
* **Focal Distance / Offset (Z-Axis)**: মিলিমিটারে
* **Red Pointer Calibration Box**: প্রস্থ ও উচ্চতা (Bounding Box mm)

---

## ৫. কার্যকরী রিকোয়ারমেন্টস (Functional Requirements - FR)

### FR-DV-01: Jeanologia ফাইল ভ্যালিডেশন ও আপলোড হ্যান্ডলার
- সিস্টেম শুধুমাত্র বৈধ Jeanologia eMark প্রজেক্ট ফাইল (`.jean` এবং `.jean5`) গ্রহণ করবে।
- ফাইল আপলোডের সময় ফাইল হেডার ও স্ট্রাকচার ভ্যালিডেট করবে যেন কোনো অসম্পূর্ণ বা করাপ্ট ফাইল আপলোড না হয়।
- ফাইলের সাইজ লিমিট: প্রতি ফাইল সর্বোচ্চ ৫০ মেগাবাইট।

### FR-DV-02: সাইজ-ওয়াইজ ফ্রন্ট ও ব্যাক টু-স্টেপ ম্যাপিং (Complete Garments - ৮০-৯০%)
- কমপ্লিট প্যান্টের ক্ষেত্রে ডিজাইনার প্রতিটি সাইজের জন্য **২টি ফাইল** বাধ্যতামূলকভাবে লিঙ্ক করবেন:
  * `Step 1 (Front Body)`: হুইস্কার, থাই গ্রাইন্ডিং ও ফ্রন্ট ডেস্ট্রাকশন ফাইল।
  * `Step 2 (Back Body)`: ব্যাক পকেট স্ক্র্যাপিং, ইয়োক ও চেভরন ফাইল।
- যদি কোনো সাইজের ব্যাক ফাইল প্রয়োজন না হয় (শুধু ফ্রন্ট ওয়াশ), তবে ডিজাইনার `Back Pass: None` টগল করতে পারবেন।

### FR-DV-03: কাটিং পার্টস কম্পোনেন্ট ম্যাপিং (Cut Panels - ১০-২০%)
- কাটিং পার্টসের ক্ষেত্রে সিস্টেম একক কম্পোনেন্ট ফাইল আপলোড সাপোর্ট করবে:
  * পার্ট টাইপ: `BACK_POCKET_LEFT`, `BACK_POCKET_RIGHT`, `COIN_POCKET`, `FRONT_PANEL` ইত্যাদি।
  * এখানে কোনো ফ্রন্ট/ব্যাক টগল থাকবে না; সরাসরি একটি নির্দিষ্ট ফাইলে সিঙ্গেল-পাস লেজার হবে।

### FR-DV-04: টেম্পার-প্রুফ রেসিপি লকিং (Anti-Tampering Enforcement)
- ডিজাইনার যখন **[ Approve & Lock Recipe ]** বাটনে চাপ দেবেন, তখন ফাইলের ভেতর ও ডেটাবেজে সংরক্ষিত প্যারামিটারগুলো স্থায়ীভাবে লক হয়ে যাবে।
- শপ-ফ্লোরের কোনো মেশিন বা অপারেটর eMark-এ এই প্যারামিটার ওভাররাইড করতে পারবে না। 
- কেউ eMark সফটওয়্যার থেকে ম্যানুয়ালি পাওয়ার বা স্পিড পরিবর্তনের চেষ্টা করলে এজ-এজেন্ট তৎক্ষণাৎ সেন্ট্রাল লগে সিকিউরিটি অ্যালার্ট পাঠাবে।

### FR-DV-05: ডিজাইনার ভার্সন কন্ট্রোল ও রিভিশন হিস্ট্রি (Recipe Versioning)
- বায়ার যদি প্রোডাকশন চলাকালীন ওয়াশ শেড হালকা বা গাঢ় করতে বলে, ডিজাইনার সরাসরি আগের ফাইল নষ্ট করবেন না।
- সিস্টেম একটি নতুন রিভিশন (যেমন: `Recipe v1.0` ➔ `Recipe v1.1`) তৈরি করবে।
- রিভিশন পরিবর্তনের কারণ (যেমন: *"Buyer requested 5% higher laser intensity on thighs"*) এবং পরিবর্তনের তারিখ ও সময় সংরক্ষিত থাকবে।

### FR-DV-06: ভিজ্যুয়াল প্লেসমেন্ট গাইড ও রেফারেন্স ছবি (Visual Placement Guide)
- ডিজাইনার প্রতিটি স্টাইলের জন্য প্যান্টের ফ্রন্ট ও ব্যাকের একটি অনুমোদিত ছবি (JPEG/PNG) আপলোড করতে পারবেন।
- এই ছবিটি মেশিনের স্ক্রিনে গাইডিং রেফারেন্স হিসেবে প্রদর্শিত হবে, যাতে নতুন কোনো অপারেটরও বুঝতে পারে ফ্ল্যাট টেবিলে প্যান্টটি কোন পজিশনে শোয়াতে হবে।

### FR-DV-07: ২০টি মেশিনের লোকাল এজেন্টে ব্যাকগ্রাউন্ড প্রি-সিঙ্ক (Pre-Sync Engine)
- রেসিপি লক হওয়ার সাথে সাথে সেন্ট্রাল ব্যাকএন্ড লোকাল গিগাবিট ল্যানের মাধ্যমে ২০টি Jeanologia মেশিনের লোকাল ক্যাশে (`C:\Jeanologia_Agent\cache\`) ফাইলগুলো পুশ করে দেবে।
- ফলে অপারেটর যখন টেবিলে কিউআর স্ক্যান করবে, তখন ফাইল সার্ভার থেকে ডাউনলোড হতে সময় নষ্ট হবে না; লোকাল মেমোরি থেকে **০.০৫ সেকেন্ডের মধ্যে** eMark-এ লোড হয়ে যাবে।

### FR-DV-08: অর্ডার স্টেটাস ট্রানজিশন (Unlock Step 3)
- অর্ডারে থাকা সব সাইজের ফ্রন্ট ও ব্যাক ডিজাইন আপলোড ও লক সম্পন্ন হলে সিস্টেম স্বয়ংক্রিয়ভাবে অর্ডারের স্টেটাস আপডেট করবে:
  `orders.status = DESIGN_APPROVED`
- এই স্টেটাস সক্রিয় হওয়ার পরই কেবল ধাপ ৩ (সুইং কিউআর প্রিন্টিং স্টেশন) এই অর্ডারের কিউআর প্রিন্ট করার অনুমতি পাবে।

---

## ৬. অকার্যকরী রিকোয়ারমেন্টস (Non-Functional Requirements - NFR)

### NFR-DV-01: আপলোড পারফরম্যান্স
- একটি স্টাইলের সমস্ত সাইজের ফাইল (যেমন: ১২টি `.jean5` ফাইল, মোট ~৫০MB) ড্র্যাগ-অ্যান্ড-ড্রপ করলে লোকাল ল্যানে **৫ সেকেন্ডের মধ্যে** আপলোড ও ভ্যালিডেশন সম্পন্ন হতে হবে।

### NFR-DV-02: ডেটা ইনটেগ্রিটি ও হ্যাশ চেকার (SHA-256 Checksum)
- সার্ভারে প্রতিটি `.jean5` ফাইলের একটি ইউনিক **SHA-256 Checksum** তৈরি হবে। ২০টি মেশিনের লোকাল ড্রাইভে ফাইল সিঙ্ক করার পর হ্যাশ মিলিয়ে নিশ্চিত করা হবে যে ফাইলটি ১০০% নিখুঁত ও অবিকৃত অবস্থায় পৌঁছেছে।

### NFR-DV-03: স্টোরেজ ফাইল ভল্ট সেফটি
- সমস্ত ফাইল সেন্ট্রাল সার্ভারের সিকিউর ভল্ট ফোল্ডারে (`D:\LACS_VAULT\`) বায়ার, স্টাইল এবং সাইজ অনুযায়ী স্বয়ংক্রিয়ভাবে সাজানো থাকবে। কোনো ডিরেক্টরি পারমিশন সাধারণ কর্মীদের থাকবে না।

---

## ৭. ডেটাবেজ স্কিমা স্পেসিফিকেশন (Database Schema for Step 2)

ধাপ ২ পরিচালনার জন্য PostgreSQL 16-এ নিচের কোর টেবিলগুলো তৈরি হবে:

### টেবিল ১: `laser_recipes` (মাস্টার রেসিপি টেবিল)
```sql
CREATE TABLE laser_recipes (
    id UUID PRIMARY KEY, -- RFC 9562 UUIDv7
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    version VARCHAR(20) DEFAULT 'v1.0',
    status VARCHAR(30) DEFAULT 'DRAFT', -- DRAFT, TEST_SAMPLE, APPROVED_LOCKED, REVISED
    approved_by UUID,                   -- ডিজাইনারের ইউজার আইডি
    approved_at TIMESTAMPTZ,
    front_reference_image VARCHAR(255), -- রেফারেন্স ছবির পাথ
    back_reference_image VARCHAR(255),
    designer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_order_recipe_version UNIQUE (order_id, version)
);
CREATE INDEX idx_laser_recipes_order_id ON laser_recipes(order_id);
CREATE INDEX idx_laser_recipes_status ON laser_recipes(status);
```

### টেবিল ২: `laser_recipe_files` (সাইজ ও পার্ট-ওয়াইজ ফাইল ম্যাপিং টেবিল)
```sql
CREATE TABLE laser_recipe_files (
    id UUID PRIMARY KEY, -- RFC 9562 UUIDv7
    recipe_id UUID NOT NULL REFERENCES laser_recipes(id) ON DELETE CASCADE,
    waist_size VARCHAR(20) NOT NULL,      -- যেমন: 28, 30, 32, 34
    part_type VARCHAR(30) NOT NULL,       -- FRONT_BODY, BACK_BODY, CUT_PANEL
    component_name VARCHAR(50),           -- POCKET_L, COIN_POCKET ইত্যাদি
    file_name VARCHAR(255) NOT NULL,      -- Style511_W32_Front.jean5
    file_path VARCHAR(500) NOT NULL,      -- D:\LACS_VAULT\LEVIS\511\W32\Style511_W32_Front.jean5
    file_size_bytes BIGINT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,     -- ফাইল ইনটেগ্রিটি হ্যাশ
    laser_parameters JSONB NOT NULL,      -- { "power": 65, "speed": 2500, "frequency": 35, "dpi": 35, "passes": 1 }
    is_locked BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_recipe_size_part UNIQUE (recipe_id, waist_size, part_type, component_name)
);
CREATE INDEX idx_recipe_files_lookup ON laser_recipe_files(recipe_id, waist_size, part_type);
```

---

## ৮. ব্যাকএন্ড এপিআই কন্ট্রাক্ট (FastAPI Endpoints for Step 2)

| মেথড | এপিআই পাথ (Endpoint) | বিবরণ | এক্সেস রোল |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/designs/pending-orders` | ডিজাইন ফাইল আপলোডের অপেক্ষায় থাকা অর্ডারের তালিকা | ডিজাইনার |
| **POST** | `/api/v1/designs/recipes/` | নতুন রেসিপি ইনিশিয়ালাইজেশন | ডিজাইনার |
| **POST** | `/api/v1/designs/upload-jean-file` | মাল্টিপার্ট `.jean` / `.jean5` ফাইল আপলোড ও হ্যাশ ভ্যালিডেশন | ডিজাইনার |
| **PUT** | `/api/v1/designs/recipes/{id}/lock` | সমস্ত সাইজের ফাইল ও প্যারামিটার চূড়ান্ত লক ও অনুমোদন করা | ডিজাইনার |
| **GET** | `/api/v1/designs/recipes/by-order/{order_id}` | নির্দিষ্ট অর্ডারের সম্পূর্ণ সাইজ ম্যাপিং ও ফাইল লিংক দেখা | ডিজাইনার / অল |
| **GET** | `/api/v1/designs/edge-sync-manifest/{machine_id}`| ২০টি মেশিনের এজ-এজেন্ট দ্বারা লোকাল ফাইল ক্যাশ সিঙ্ক রিকোয়েস্ট | আইওটি এজেন্ট |

---

এই স্পেসিফিকেশন ডকুমেন্টটি ধাপ ২ (লেজার ডিজাইন ভল্ট ও রেসিপি ম্যাপিং)-এর টেকনিক্যাল ডেভেলপমেন্টের ভিত্তি হিসেবে কাজ করবে।

