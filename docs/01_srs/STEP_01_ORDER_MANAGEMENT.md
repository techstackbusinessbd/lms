# সফটওয়্যার রিকোয়ারমেন্টস স্পেসিফিকেশন (SRS) - ধাপ ১
## মডিউল: অর্ডার ম্যানেজমেন্ট ও এন্ট্রি সিস্টেম (Order Management Module)
**ডকুমেন্ট কোড:** `SRS-LACS-MOD-01`  
**সংস্করণ:** v1.0.0 (Granular Module Specification)  
**মডিউল প্যারেন্ট:** Denim Laser Automation & Control System (Denim LACS)  
**অনুমোদনকারী কর্তৃপক্ষ:** Product Director / CTO (স্যার)  
**তারিখ:** নভেম্বর ২০২৬  

---

## ১. মডিউল পরিচিতি ও ব্যবসায়িক উদ্দেশ্য (Introduction & Objectives)

### ১.১ উদ্দেশ্য
একটি ডেনিম ওয়াশিং প্ল্যান্টে কোনো কাজই বায়ারের পারচেজ অর্ডার (PO - Purchase Order) ছাড়া শুরু হতে পারে না। 
**ধাপ ১ (অর্ডার ম্যানেজমেন্ট ও এন্ট্রি সিস্টেম)** হলো পুরো লেজার অটোমেশন সিস্টেমের প্রবেশদ্বার (Entry Gate)। 

এই মডিউলের মাধ্যমে মার্চেন্ডাইজিং বা প্রোডাকশন প্ল্যানিং টিম বায়ারের সমস্ত অর্ডার, পিও নম্বর, স্টাইল কোড, ফেব্রিক ডিটেইলস, মোট পিস (Total Order Quantity) এন্ট্রি দেবে।

> ⚠️ **সিটিও স্যার কর্তৃক অনুমোদিত পর্যায়ভিত্তিক বাস্তবায়ন কৌশল (Phased Implementation Strategy):**
> * **১ম পর্যায় (Current Phase 1 - Lean Order Flow):** অর্ডার এন্ট্রি সম্পূর্ণভাবে **টোটাল অর্ডার কোয়ান্টিটি (Total Order Qty)** ভিত্তিক পরিচালিত হবে। প্রাথমিক অপারেশনে সাইজ ব্রেকডাউন বাধ্যতামূলক থাকবে না; সিস্টেম সরাসরি মোট কোয়ান্টিটি দিয়ে অর্ডার ক্রিয়েশন, প্রোডাকশন ট্র্যাকিং ও কিউআর চেইন পরিচালনা করবে।
> * **ভবিষ্যৎ পর্যায় (Future Phase 2 - Advanced Expansion):** পরবর্তী ধাপে সাইজ ব্রেকডাউন ম্যাট্রিক্স (Size Breakdown Grid) এবং লেজার ডিজাইন ফাইল আপলোড (`.jean5` Vault Upload) পূর্ণাঙ্গভাবে যুক্ত করা হবে।

---

## ২. ব্যবহারকারীর ভূমিকা ও পারমিশন (User Roles & Access Control)

| রোল (Role) | অনুমতি (Permissions) | দায়িত্ব |
| :--- | :--- | :--- |
| **মার্চেন্ডাইজার (Merchandiser)** | Create, Read, Update, Import | নতুন বায়ার অর্ডার এন্ট্রি, সাইজ ব্রেকডাউন দেওয়া, এক্সেল শিট আপলোড। |
| **প্ল্যানিং ইন-চার্জ (Planning Head)** | Create, Read, Update, Approve | অর্ডারের কাটিং/লেজার টার্গেট ডেট ও প্রায়োরিটি নির্ধারণ করা। |
| **লেজার ডিজাইনার (Laser Designer)** | Read, State Transition | পেন্ডিং অর্ডার দেখা, সাইজ রেশিও অনুযায়ী ডিজাইন তৈরি ও লক করা। |
| **লেজার অ্যাডমিন / সিটিও (Admin / CTO)** | Full Access, Audit, Delete | সব অর্ডার অডিট, মডিফিকেশন ও পারফরম্যান্স মেট্রিক্স দেখা। |

---

## ৩. অর্ডার লাইফসাইকেল ও স্টেট মেশিন (Order State Machine)

একটি অর্ডার তৈরি হওয়া থেকে লেজার শেষ হওয়া পর্যন্ত নিচের স্টেটগুলো অতিক্রম করবে:

```
[DRAFT] 
   │ (মার্চেন্ডাইজার সব ডাটা পূরণ করে সেভ করবে)
   ▼
[PENDING_DESIGN] 
   │ (ডিজাইনার নোটিফিকেশন পাবে এবং সাইজ অনুযায়ী .jean5 ফাইল লিংক করবে)
   ▼
[DESIGN_APPROVED] 
   │ (ডিজাইনার রেসিপি লক করবে; এখন সুইং কিউআর প্রিন্ট করতে পারবে)
   ▼
[IN_PRODUCTION] 
   │ (লেজার ফ্লোরে প্রথম প্যান্ট স্ক্যান হওয়ামাত্র অটোমেটিক এই স্টেটে যাবে)
   ▼
[COMPLETED] 
   │ (অর্ডারের সব পিস লেজার ও কিউসি পাস হলে)
   ▼
[ARCHIVED]
```

---

## ৪. স্ক্রিন ও ডাটা ফিল্ড স্পেসিফিকেশন (UI Form Fields & Wireframe)

অর্ডার এন্ট্রি ফর্মে নিচের ডাটা ফিল্ডগুলো থাকা বাধ্যতামূলক:

### ৪.১ গার্মেন্টস এন্টারপ্রাইজ ১০টি কোর ফিল্ড (Enterprise Garments Order Fields)
সিটিও স্যারের প্রত্যক্ষ নির্দেশনা অনুসারী ১০টি বাধ্যতামূলক ইনফরমেশন ফিল্ড:

| # | ফিল্ডের নাম (Field Name) | ফিল্ড টাইপ | বিবরণ ও ভ্যালিডেশন | বাস্তব উদাহরণ |
| :-: | :--- | :--- | :--- | :--- |
| **১** | **Company** | Text / Dropdown | কোম্পানি বা কারখানা ইউনিট (বাধ্যতামূলক) | *Denim Solutions Ltd. (Unit 1)* |
| **২** | **Buyer** | Dropdown / Search | বায়ারের নাম বা ব্র্যান্ড কোড (বাধ্যতামূলক) | *Levi Strauss & Co.* |
| **৩** | **Style** | Text Input | পোশাকের প্রধান স্টাইল কোড বা নম্বর (বাধ্যতামূলক) | *511 Slim Fit* |
| **৪** | **Job No.** | Text Input | ফ্যাক্টরি ইন্টারনাল জব নম্বর (বাধ্যতামূলক ও ইউনিক) | *JOB-2026-0042* |
| **৫** | **Brand** | Text Input | বায়ারের ব্র্যান্ড বা সাব-ব্র্যান্ড | *Levi's Red Tab / Signature* |
| **৬** | **Season** | Text Input | প্রোডাকশন সিজন | *Spring/Summer 2026* |
| **৭** | **Order Qty** | Number Input | মোট অর্ডার সংখ্যা (পজিটিভ পূর্ণসংখ্যা > ০) | *10,000* |
| **৮** | **UOM** | Dropdown | পরিমাপের একক (PCS, DZN, SET) | *PCS* |
| **৯** | **Ship Date** | Date Picker | টার্গেট শিপমেন্ট / ডেলিভারি তারিখ (YYYY-MM-DD) | *2026-12-28* |
| **১০** | **Dealing Merchant**| Text Input | দায়িত্বপ্রাপ্ত ডিলিং মার্চেন্টের নাম | *Tanvir Ahmed* |

### ৪.২ মোট অর্ডার কোয়ান্টিটি ও ভবিষ্যৎ সাইজ ব্রেকডাউন রোডম্যাপ (Total Qty & Future Size Roadmap)
- **১ম পর্যায় (বর্তমান কার্যকর মোড):** অর্ডার ফর্মে মার্চেন্ডাইজার সরাসরি অর্ডারের মোট পিস সংখ্যা (`total_quantity`) এন্ট্রি করবেন (যেমন: ১২,৫০০ পিস)। সিস্টেম এই মোট কোয়ান্টিটি অনুসারে লেজার প্রোডাকশন কাউন্ট, রিমেইনিং ব্যালেন্স ও প্রগ্রেস বার ট্র্যাকিং করবে।
- **ভবিষ্যৎ পর্যায় (রোডম্যাপ):** পরবর্তীতে যখন সাইজ-ভিত্তিক ফাইল লোডিং প্রয়োজন হবে, তখন নিচের সাইজ ব্রেকডাউন গ্রিড সক্রিয় করা হবে:

| Waist / Length | L30 | L32 | L34 | সাইজ-ওয়াইজ মোট |
| :---: | :---: | :---: | :---: | :---: |
| **W28** | ২০০ | ৩০০ | — | **৫০০ পিস** |
| **W30** | ৫০০ | ১,০০০ | ৫০০ | **২,০০০ পিস** |
| **W32** | ৫০০ | ১,০০০ | ৫০০ | **২,০০০ পিস** |
| **W34** | ২০০ | ৫০০ | ৩০০ | **১,০০০ পিস** |
| **মোট কোয়ান্টিটি**| — | — | — | **৫,৫০০ পিস (Auto Total)** |

> **রোডম্যাপ নোট:** প্রাথমিক পর্যায়ে `total_quantity` ইনপুট থেকেই পুরো পাইপলাইন পরিচালিত হবে। পরবর্তী পর্যায়ে সাইজ গ্রিড যুক্ত হলে সাইজের যোগফল দিয়ে এটি স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।

---

## ৫. কার্যকরী রিকোয়ারমেন্টস (Functional Requirements - FR)

### FR-OM-01: অর্ডার সৃষ্টি ও বিজনেস ভ্যালিডেশন (Order Creation & Validation)
- একই বায়ারের অধীনে ডুপ্লিকেট PO নম্বর দিয়ে অর্ডার সেভ করা যাবে না। ডুপ্লিকেট হলে তাৎক্ষণিক ওয়ার্নিং দেবে: *"PO Number already exists for this Buyer!"*
- সাইজ কোয়ান্টিটি অবশ্যই ধনাত্মক পূর্ণসংখ্যা (Positive Integer > 0) হতে হবে। কোনো নেগেটিভ বা ভগ্নাংশ ইনপুট গ্রহণযোগ্য নয়।
- অর্ডার সেভ হওয়ামাত্র একটি টাইম-সর্টেড `RFC 9562 UUIDv7` প্রাইমারি কি তৈরি হবে।

### FR-OM-02: ডায়নামিক সাইজ ম্যাট্রিক্স কনফিগারেটর (Flexible Size Configurator)
- সিস্টেম প্রি-সেট সাইজ সাপোর্ট করবে (যেমন: Waist 26 to 44, Inseam 28 to 36)।
- ইউজার চাইলে কাস্টম সাইজ (যেমন: Kids Size বা Alpha Size: S, M, L, XL) সিলেক্ট করতে পারবে।
- গ্রিডে ইনপুট দেওয়ার সাথে সাথে ব্রাউজারে মিলি-সেকেন্ডে মোট যোগফল (Total Sum) ক্যালকুলেট হবে।

### FR-OM-03: এক্সেল / সিএসভি বাল্ক ইমপোর্ট (Excel / CSV Bulk Order Import)
- মার্চেন্ডাইজারদের সুবিধার্থে একসঙ্গে ২০-৫০টি PO আপলোড করার জন্য একটি প্রমিত এক্সেল টেমপ্লেট (`.xlsx`) থাকবে।
- এক্সেল ফাইল ড্র্যাগ-অ্যান্ড-ড্রপ করলে ব্যাকঅফিস পাইথন সার্ভিস ফাইলটি ভ্যালিডেট করে কয়েক সেকেন্ডে সব অর্ডার তৈরি করে দেবে।

### FR-OM-04: অর্ডার রিভিশন ও হিস্ট্রি ট্র্যাকিং (Order Revision Control)
- বায়ার যদি পরবর্তীতে সাইজ রেশিও বা কোয়ান্টিটি পরিবর্তন করে, তবে সরাসরি ডাটা মুছে ফেলা নিষিদ্ধ।
- সিস্টেম একটি নতুন রিভিশন (যেমন: Rev 1 ➔ Rev 2) তৈরি করবে এবং কে, কখন, কী কারণে পরিবর্তন করেছে—তার অডিট লগ রাখবে।

### FR-OM-05: ডিজাইনার স্টেশনে রিয়েলটাইম নোটিফিকেশন (Designer Event Trigger)
- মার্চেন্ডাইজার যখনই কোনো নতুন অর্ডার `PENDING_DESIGN` স্টেটে সাবমিট করবে, সাথে সাথে লেজার ডিজাইনারের স্ক্রিনে WebSockets-এর মাধ্যমে একটি নোটিফিকেশন পপ-আপ যাবে:  
  *🔔 "New Order Added: Levi's - PO #884920 (5,500 pcs) - Ready for Laser Design!"*

### FR-OM-06: লাইভ সার্চ, মাল্টি-ফিল্টারিং ও এক্সপোর্ট
- PO নম্বর, বায়ারের নাম, স্টাইল, ডেট রেঞ্জ বা স্ট্যাটাস অনুযায়ী ১ সেকেন্ডে ফিল্টার করার ব্যবস্থা থাকতে হবে (TanStack Table v8 দ্বারা পরিচালিত)।
- যেকোনো ফিল্টার করা রিপোর্ট ১ ক্লিকে Excel বা PDF হিসেবে ডাউনলোড করা যাবে।

---

## ৬. অকার্যকরী রিকোয়ারমেন্টস (Non-Functional Requirements - NFR)

### NFR-OM-01: সাব-১০০ms রেসপন্স টাইম (Sub-100ms API Response)
- নতুন অর্ডার সাবমিশন এবং সার্চ ফিল্টারিং লোকাল সার্ভারে অনূর্ধ্ব **১০০ মিলি-সেকেন্ডের মধ্যে** সম্পন্ন হতে হবে।

### NFR-OM-02: ড্রাফট অটো-সেভ (Auto-Save Recovery)
- অর্ডার এন্ট্রি করার সময় হঠাৎ বিদ্যুৎ চলে গেলে বা ব্রাউজার ট্যাব বন্ধ হয়ে গেলে লোকাল ব্রাউজার স্টোরেজ (`localStorage`) থেকে ডাটা রিকভারি করার ব্যবস্থা থাকবে।

### NFR-OM-03: অডিট ট্রেইল ও নিরাপত্তা (Audit Trail)
- প্রতিটি অর্ডারের সাথে `created_by`, `updated_by`, `created_at` এবং `updated_at` ফিল্ড সংরক্ষিত থাকবে। কোনো অর্ডার হার্ড-ডিলিট (Permanent Delete) করা যাবে না; শুধুমাত্র সফট-ডিলিট (`is_deleted = TRUE`) প্রযোজ্য হবে।

---

## ৭. ডেটাবেজ স্কিমা স্পেসিফিকেশন (Database Schema for Step 1)

সিটিও স্যারের পর্যায়ভিত্তিক আর্কিটেকচার অনুযায়ী ধাপ ১-এর বর্তমান বাস্তবায়নে PostgreSQL 16-এ মূল টেবিল হবে:

### টেবিল ১: `orders` (অর্ডার মাস্টার টেবিল - Total Qty Based)
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY, -- RFC 9562 UUIDv7
    buyer_name VARCHAR(150) NOT NULL,
    po_number VARCHAR(100) NOT NULL,
    style_code VARCHAR(100) NOT NULL,
    style_name VARCHAR(150),
    fabric_description VARCHAR(255),
    wash_reference VARCHAR(150) NOT NULL,
    total_quantity INTEGER NOT NULL CHECK (total_quantity > 0),
    target_delivery_date DATE NOT NULL,
    priority VARCHAR(20) DEFAULT 'NORMAL', -- NORMAL, HIGH, URGENT
    status VARCHAR(30) DEFAULT 'PENDING_DESIGN', -- DRAFT, PENDING_DESIGN, DESIGN_APPROVED, IN_PRODUCTION, COMPLETED
    current_revision INTEGER DEFAULT 1,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_po_style UNIQUE (po_number, style_code)
);
CREATE INDEX idx_orders_po_number ON orders(po_number);
CREATE INDEX idx_orders_buyer ON orders(buyer_name);
CREATE INDEX idx_orders_status ON orders(status);
```

### ভবিষ্যৎ টেবিল (Future Roadmap): `order_size_breakdowns`
*পরবর্তী পর্যায়ে সাইজ-ওয়াইজ ফাইল ম্যাপিংয়ের সময় এই টেবিলটি সক্রিয় করা হবে:*
```sql
-- [ভবিষ্যৎ সম্প্রসারণ রোডম্যাপ - Future Phase 2]
CREATE TABLE order_size_breakdowns (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    waist_size VARCHAR(20) NOT NULL,
    length_size VARCHAR(20) DEFAULT '',
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    lasered_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_order_waist_length UNIQUE (order_id, waist_size, length_size)
);
```

---

## ৮. ব্যাকএন্ড এপিআই কন্ট্রাক্ট (FastAPI Endpoints)

ধাপ ১ পরিচালনার জন্য সেন্ট্রাল ব্যাকএন্ডে নিচের এপিআইগুলো উন্মুক্ত থাকবে:

| মেথড | এপিআই পাথ (Endpoint) | বিবরণ | এক্সেস রোল |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/orders/` | নতুন অর্ডার ও সাইজ ব্রেকডাউন তৈরি | মার্চেন্ডাইজার |
| **GET** | `/api/v1/orders/` | সমস্ত অর্ডারের তালিকা (ফিল্টার ও পেজিনেশন সহ) | অল ইউজার |
| **GET** | `/api/v1/orders/{id}` | নির্দিষ্ট অর্ডারের বিস্তারিত ও সাইজ গ্রিড রিড | অল ইউজার |
| **PUT** | `/api/v1/orders/{id}` | বিদ্যমান অর্ডার আপডেট ও রিভিশন তৈরি | মার্চেন্ডাইজার / এডমিন |
| **POST** | `/api/v1/orders/bulk-import` | এক্সেল ফাইল আপলোড করে বাল্ক অর্ডার ক্রিয়েট | মার্চেন্ডাইজার |
| **PATCH**| `/api/v1/orders/{id}/status` | অর্ডারের স্টেট পরিবর্তন (যেমন: PENDING_DESIGN ➔ DESIGN_APPROVED) | সিস্টেম / ডিজাইনার |

---

এই স্পেসিফিকেশন ডকুমেন্টটি ধাপ ১-এর ডেভেলপমেন্টের ভিত্তি হিসেবে কাজ করবে।

