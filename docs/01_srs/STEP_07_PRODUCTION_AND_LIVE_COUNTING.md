# সফটওয়্যার রিকোয়ারমেন্টস স্পেসিফিকেশন (SRS) - ধাপ ৭
## মডিউল: রিয়েল-টাইম প্রোডাকশন ও লাইভ OEE ট্র্যাকিং (Real-Time Production Execution & Live OEE Telemetry)
**ডকুমেন্ট কোড:** `SRS-LACS-MOD-07`  
**সংস্করণ:** v1.0.0 (Granular Module Specification)  
**মডিউল প্যারেন্ট:** Denim Laser Automation & Control System (Denim LACS)  
**মডিউল ওনার:** Jeanologia মেশিন অপারেটর, প্রোডাকশন হেড ও সেন্ট্রাল সার্ভার  
**অনুমোদনকারী কর্তৃপক্ষ:** Product Director / CTO (স্যার)  
**তারিখ:** নভেম্বর ২০২৬  

---

## ১. মডিউল পরিচিতি ও ব্যবসায়িক উদ্দেশ্য (Introduction & Objectives)

### ১.১ প্রেক্ষাপট
ধাপ ৬-এ eMark-এ সঠিক সাইজের ডিজাইন লোড হওয়ার পর অপারেটর ফুট-প্যাডেল চেপে লেজার ফায়ার সম্পন্ন করে (Front Pass এবং Flip করে Back Pass)। 
এই মুহূর্তে সেন্ট্রাল সার্ভার প্রতিটি পিসের সম্পন্ন হওয়ার ডিজিটাল সিগন্যাল গ্রহণ করে এবং বায়ারের PO-ভিত্তিক লাইভ কাউন্টার আপডেট করে। 
**ধাপ ৭ (প্রোডাকশন ও লাইভ কাউন্টিং)** কারখানার ২০টি Jeanologia মেশিনের সমস্ত কার্যক্রম একটি সিঙ্গেল লাইভ ড্যাশবোর্ডে তুলে ধরে।

### ১.২ মূল উদ্দেশ্য
1. **PO-ভিত্তিক টার্গেট বনাম বাস্তবায়ন (Target vs Actual Progress)**: বায়ার Levi's-এর ৬,০০০ পিসের মধ্যে আজ পর্যন্ত কত পিস সম্পন্ন হলো এবং কোন সাইজ কত পিস বাকি—তা প্রতি সেকেন্ডে লাইভ দেখা।
2. **সাইকেল টাইম ও অপারেটর এফিসিয়েন্সি ট্র্যাকিং**: ফ্রন্ট ও ব্যাক লেজারিংয়ে প্রতি পিসে ঠিক কত সেকেন্ড সময় লাগছে (যেমন: Target 24s vs Actual 25.5s) তা মিলি-সেকেন্ডে রেকর্ড করা।
3. **মেশিন স্ট্যাটাস ও আইডল টাইম ট্র্যাকিং (Live Fleet Visibility)**: ২০টি মেশিনের মধ্যে কয়টি এখন রানিং, কয়টি খালি বসে আছে (Idle) এবং কোনটি ব্রেকডাউনে আছে তা এক নজরে দেখা।
4. **ইন্ডাস্ট্রিয়াল OEE ক্যালকুলেশন**: আন্তর্জাতিক মানদণ্ডে মেশিনের ওভারঅল ইকুইপমেন্ট ইফেক্টিভনেস (Overall Equipment Effectiveness - OEE) স্বয়ংক্রিয়ভাবে হিসাব করা।
5. **সাসটেইনেবিলিটি ও গ্রিন মেট্রিক্স (Green Analytics)**: ম্যানুয়াল ক্ষতিকর পিপি স্প্রে (PP Spray) এবং হ্যান্ড স্ক্র্যাপিংয়ের তুলনায় কত লিটার পানি ও কেমিক্যাল সাশ্রয় হলো তার বায়ার অডিট রিপোর্ট তৈরি।

---

## ২. ব্যবহারকারীর ভূমিকা ও পারমিশন (User Roles & Access Control)

| রোল (Role) | অনুমতি (Permissions) | দায়িত্ব |
| :--- | :--- | :--- |
| **Jeanologia মেশিন অপারেটর** | Action Trigger, View Local Stats | লেজার প্যাডেল প্রেস করা, প্যান্ট উল্টানো এবং নিজের টেবিলের কাউন্টার দেখা। |
| **ফ্লোর সুপারভাইজার** | Live Monitor, Idle Reason Log | ২০টি মেশিনের লাইভ কাজ তদারকি ও মেশিন বন্ধ থাকলে কারণ এন্ট্রি দেওয়া। |
| **লেজার ডিজাইনার** | Recipe Performance Audit | কোন ফাইলে কত সাইকেল টাইম লাগছে এবং ডিজাইনে স্কেলিং ঠিক আছে কি না দেখা। |
| **প্রোডাকশন ম্যানেজার / সিটিও** | Executive Analytics, Full Export | ফ্যাক্টরির সামগ্রিক OEE, শিফট আউটপুট ও ডেলিভারি কমপ্লিশন অডিট করা। |

---

## ৩. প্রোডাকশন ইভেন্ট লাইফসাইকেল ও সিগন্যাল ট্রানজিশন

```
[FRONT_LASER_PEDAL_PRESSED] 
   │ (অপারেটর প্যাডেল চাপলেন: ফ্রন্ট লেজার স্টার্ট টাইম রেকর্ড)
   ▼
[FRONT_PASS_COMPLETED] 
   │ (হুইস্কার শেষ: ফ্রন্ট সাইকেল টাইম রেকর্ড, e.g. ১৩.৫ সেকেন্ড)
   ▼
[PANT_FLIPPED_TO_BACK] 
   │ (প্যান্ট উল্টানো হলো: ব্যাক লেজার স্টার্ট)
   ▼
[BACK_PASS_COMPLETED] 
   │ (ব্যাক পকেট ও শেভরন শেষ: ব্যাক সাইকেল টাইম রেকর্ড, e.g. ১১.৫ সেকেন্ড)
   ▼
[PIECE_CYCLE_CLOSED] 
   ├── মোট সাইকেল টাইম: ২৫.০ সেকেন্ড
   ├── প্যান্ট কনভেয়ার মুভ করে আউটপুট ট্রলিতে পড়ল
   └── এজ-এজেন্ট সেন্ট্রাল সার্ভারে ইভেন্ট পুশ করল (WebSocket: Sub-50ms)
   ▼
[CENTRAL_DATABASE_UPDATED] 
   ├── garment_units.current_status = 'LASER_COMPLETED'
   ├── order_size_breakdowns.lasered_quantity += ১
   └── লাইভ ড্যাশবোর্ডে কাউন্টার রিফ্রেশ ছাড়াই সাথে সাথে বেড়ে গেল
```

---

## ৪. লাইভ ড্যাশবোর্ড ও স্ক্রিন স্পেসিফিকেশন (Live Operations Dashboard)

সেন্ট্রাল মনিটরিং ইন্টারফেসটি (`http://192.168.1.100/dashboard`) ফ্যাক্টরির বড় টিভি ডিসপ্লে ও ম্যানেজমেন্টের জন্য ডার্ক মোডে ডিজাইন করা:

### ৪.১ ২০টি মেশিনের লাইভ ফ্লিট গ্রিড (Machine Fleet Grid View)
প্রতিটি মেশিনের জন্য একটি রিয়েল-টাইম কালার-কোডেড কার্ড থাকবে:
* **[ Machine #07 - RUNNING (সবুজ আলো) ]**
  * স্টাইল: *Levi's 511* | সাইজ: *32* | পার্ট: *FRONT (12s)*
  * আজকের আউটপুট: *৪১২ পিস* | গড় সাইকেল টাইম: *২৪.৮ সেকেন্ড*
* **[ Machine #12 - IDLE (হলুদ আলো - ৩ মিনিট অলস!) ]**
  * অ্যালার্ট: *"No Scan Detected for 3 mins. Waiting for Trolley!"*
* **[ Machine #19 - ERROR / STOPPED (লাল আলো) ]**
  * অ্যালার্ট: *"Laser Emergency Stop Pressed!"*

### ৪.২ পিও প্রগ্রেস ও সাইজ রেশিও ট্র্যাকার (PO Completion Tracker)
* অর্ডার: *PO-884920 (Levi's 511 - Dark Vintage)*
* মোট টার্গেট: *৬,০০০ পিস* | সম্পন্ন হয়েছে: *৪,২১০ পিস (৭০.১৭%)* | বাকি: *১,৭৯০ পিস*
* **সাইজ-ওয়াইজ লাইভ প্রগ্রেস বার**:
  * *W28*: ৮৫০ / ১,০০০ পিস (৮৫%)
  * *W30*: ১,৫২০ / ২,০০০ পিস (৭৬%)
  * *W32*: ১,৩৪০ / ২,০০০ পিস (৬৭%)
  * *W34*: ৫০০ / ১,০০০ পিস (৫০%)

---

## ৫. কার্যকরী রিকোয়ারমেন্টস (Functional Requirements - FR)

### FR-PC-01: সাব-সেকেন্ড প্রোডাকশন ইভেন্ট ও কাউন্টার ইনক্রিমেন্ট
- মেশিন টেবিলে একটি প্যান্টের ফ্রন্ট ও ব্যাক লেজার সম্পন্ন হওয়ামাত্র এজ-এজেন্ট সেন্ট্রাল ব্যাকএন্ডে কমপ্লিশন সিগন্যাল পাঠাবে।
- সেন্ট্রাল সার্ভার **৫০ মিলি-সেকেন্ডের মধ্যে** ডাটাবেজে রেকর্ড আপডেট করবে এবং কোনো কাউন্ট ড্রপ হতে পারবে না।

### FR-PC-02: ফ্রন্ট ও ব্যাক পৃথক সাইকেল টাইম ট্র্যাকিং
- সিস্টেম প্রতিটি পিসের জন্য আলাদাভাবে রেকর্ড করবে:
  * `front_cycle_time_seconds`: সামনের অংশ করতে কত সেকেন্ড লাগলো।
  * `back_cycle_time_seconds`: পেছনের অংশ করতে কত সেকেন্ড লাগলো।
  * `total_cycle_time_seconds`: মোট সময়।
- ডিজাইনারের সেট করা আইডিয়াল সময়ের চেয়ে ৩ সেকেন্ড বেশি লাগলে সিস্টেমে অপারেশনের গতি স্লো হিসেবে চিহ্নিত হবে।

### FR-PC-03: পিও-ভিত্তিক অর্ডার প্রগ্রেস ও ওভার-প্রোডাকশন লক
- কোনো সাইজের টার্গেট ১০০% পূরণ হয়ে গেলে (যেমন: সাইজ ২৮-এর ১,০০০ পিস শেষ) সিস্টেম স্ক্রিনে গ্রিন ব্যাজ দেবে: *"Size 28 Target Met!"*।
- কাটিং এলাউয়েন্সের অতিরিক্ত পিস মেশিনে স্ক্যান করলে সিস্টেম অ্যালার্ট দেবে, যাতে বায়ারের অর্ডারের চেয়ে অপ্রয়োজনীয় বেশি কাপড় পুড়িয়ে রিসোর্স নষ্ট না হয়।

### FR-PC-04: রিয়েল-টাইম ওয়েবসকেট ব্রডকাস্টার (Zero-Polling Engine)
- লাইভ ড্যাশবোর্ড কোনো রিলোড বা ১ সেকেন্ড পর পর রিকোয়েস্ট পাঠাবে না।
- ব্যাকএন্ড **FastAPI WebSockets** ব্যবহার করে লাইভ ইভেন্ট ড্যাশবোর্ডে পুশ করবে। ব্রাউজারের কোনো রিফ্রেশ ছাড়াই চোখের সামনে সংখ্যা ১ পিস করে বাড়তে থাকবে।

### FR-PC-05: অটোম্যাটিক আইডল ও ব্রেকডাউন ডিটেকশন (Idle Time Watchdog)
- কোনো মেশিনে যদি টানা ৩ মিনিটের বেশি কোনো প্যান্ট স্ক্যান না হয়, তবে সিস্টেম ওই মেশিনকে `IDLE` হিসেবে মার্ক করবে।
- ৫ মিনিট পার হলে ফ্লোর সুপারভাইজারের ড্যাশবোর্ডে হলুদ এলার্ম বাজবে: *"Machine #12 Idle for 5 Minutes!"*।
- সুপারভাইজার স্ক্রিনে আইডল কারণ সিলেক্ট করতে পারবেন: `[ Waiting for Body ]`, `[ Operator Break ]`, `[ Mechanical Setup ]`, `[ Electrical Issue ]`।

### FR-PC-06: ওবিআই (OEE) ক্যালকুলেটর ইঞ্জিন
আন্তর্জাতিক ইন্ডাস্ট্রিয়াল স্ট্যান্ডার্ড অনুযায়ী প্রতিদিনের OEE ক্যালকুলেট হবে:
$$\text{OEE} = \text{Availability} \times \text{Performance} \times \text{Quality}$$
* **Availability (প্রাপ্যতা)**: মোট রানিং সময় ÷ মোট শিফট সময় (অলস সময় বাদ দিয়ে)।
* **Performance (গতি)**: নির্ধারিত আদর্শ সাইকেল টাইম ÷ প্রকৃত ব্যয়িত সময়।
* **Quality (মান)**: পাস হওয়া পিসের সংখ্যা ÷ মোট লেজার হওয়া পিসের সংখ্যা (রিজেকশন বাদ দিয়ে)।

### FR-PC-07: শিফট-ওয়াইজ ডাটা সেগ্রিগেশন (Shift Analytics)
- স্বয়ংক্রিয়ভাবে ৩টি শিফটে ডাটা আলাদা সংরক্ষিত হবে:
  * *Morning Shift (সকাল ৮টা – বিকাল ৪টা)*
  * *Evening Shift (বিকাল ৪টা – রাত ১২টা)*
  * *Night Shift (রাত ১২টা – সকাল ৮টা)*
- শিফট শেষ হওয়ামাত্র স্বয়ংক্রিয়ভাবে শিফট প্রোডাকশন সামারি পিডিএফ তৈরি হয়ে সেন্ট্রাল সার্ভারে জমা হবে।

### FR-PC-08: সাসটেইনেবিলিটি ও গ্রিন সেভিংস ক্যালকুলেটর
- প্রতি পিস লেজার হওয়ার বিপরীতে হিসাব রাখা হবে:
  * কত লিটার পানি বাঁচলো (প্রতি প্যান্টে গড়ে ~৩৫ লিটার পানি সাশ্রয়)।
  * কত গ্রাম ক্ষতিকর কেমিক্যাল (পটাশিয়াম পারম্যাঙ্গানেট - PP Spray) কারখানা থেকে দূর হলো।
  * বিদ্যুতের মোট ব্যবহার (KWh)।
- বায়ার অডিটের জন্য ১ ক্লিকে **Sustainability Certificate** ডাউনলোড করা যাবে।

---

## ৬. অকার্যকরী রিকোয়ারমেন্টস (Non-Functional Requirements - NFR)

### NFR-PC-01: হাই-কনকারেন্সি ওয়েবসকেট পারফরম্যান্স
- ২০টি Jeanologia মেশিন থেকে একই সাথে প্রতি সেকেন্ডে একাধিক ইভেন্ট আসলেও সেন্ট্রাল সার্ভারের সিপিইউ ইউটিলাইজেশন **১৫%-এর নিচে** থাকবে।

### NFR-PC-02: ১০০% ডাটা পারসিস্টেন্স ও জিরো কাউন্ট লস
- বিদ্যুৎ চলে গেলেও বা হঠাৎ সার্ভার রিস্টার্ট হলেও কোনো কমপ্লিট হওয়া পিসের হিসাব ডাটাবেজ থেকে মুছে যেতে পারবে না। প্রতিটি ট্রানজ্যাকশন অ্যাসিড (ACID) কমপ্লায়েন্ট হবে।

---

## ৭. ডেটাবেজ স্কিমা স্পেসিফিকেশন (Database Schema for Step 7)

ধাপ ৭ পরিচালনার জন্য PostgreSQL 16-এ নিচের কোর টেবিলগুলো তৈরি হবে:

### টেবিল ১: `production_logs` (প্রতিটি পিসের পুঙ্খানুপুঙ্খ প্রোডাকশন লগ)
```sql
CREATE TABLE production_logs (
    id UUID PRIMARY KEY, -- RFC 9562 UUIDv7
    garment_unit_id UUID NOT NULL REFERENCES garment_units(id) ON DELETE RESTRICT,
    machine_id UUID NOT NULL REFERENCES laser_machines(id) ON DELETE RESTRICT,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    waist_size VARCHAR(20) NOT NULL,
    front_cycle_seconds NUMERIC(5,2) NOT NULL, -- যেমন: 13.50 সেকেন্ড
    back_cycle_seconds NUMERIC(5,2) NOT NULL,  -- যেমন: 11.50 সেকেন্ড
    total_cycle_seconds NUMERIC(5,2) NOT NULL, -- যেমন: 25.00 সেকেন্ড
    operator_code VARCHAR(50),
    shift_name VARCHAR(20) NOT NULL,           -- SHIFT_A, SHIFT_B, SHIFT_C
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_prod_logs_machine ON production_logs(machine_id);
CREATE INDEX idx_prod_logs_order ON production_logs(order_id);
CREATE INDEX idx_prod_logs_completed_at ON production_logs(completed_at);
```

### টেবিল ২: `machine_downtime_logs` (মেশিন বন্ধ থাকার অডিট লগ)
```sql
CREATE TABLE machine_downtime_logs (
    id UUID PRIMARY KEY, -- RFC 9562 UUIDv7
    machine_id UUID NOT NULL REFERENCES laser_machines(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes NUMERIC(6,2),
    reason_code VARCHAR(50) DEFAULT 'NO_FEEDING', -- NO_FEEDING, OPERATOR_AWAY, BREAKDOWN, MAINTENANCE
    reported_by UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_downtime_machine ON machine_downtime_logs(machine_id);
```

---

## ৮. ব্যাকএন্ড ও রিয়েলটাইম এপিআই কন্ট্রাক্ট

| মেথড / প্রোটোকল | এপিআই পাথ (Endpoint) | বিবরণ | এক্সেস রোল |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/production/complete-piece` | লেজার সম্পন্ন হওয়া মাত্র এজ-এজেন্ট দ্বারা ডাটাবেজে রেজাল্ট সাবমিশন | এজ-এজেন্ট |
| **WebSocket** | `/ws/live-fleet` | ড্যাশবোর্ডে ২০টি মেশিনের লাইভ কাউন্টার ও স্ট্যাটাস পুশ করা | ব্রাউজার ক্লায়েন্ট |
| **GET** | `/api/v1/production/order-progress/{order_id}` | নির্দিষ্ট বায়ার PO-র লাইভ সাইজ-ওয়াইজ অগ্রগতি রিপোর্ট | অল ইউজার |
| **POST** | `/api/v1/production/log-idle-reason` | মেশিন অলস বসে থাকার কারণ এন্ট্রি দেওয়া | সুপারভাইজার |
| **GET** | `/api/v1/production/oee-summary` | শিফট ও দৈনিক সামগ্রিক OEE ও গ্রিন মেট্রিক্স ডাটা এক্সপোর্ট | ম্যানেজমেন্ট / সিটিও |

---

এই স্পেসিফিকেশন ডকুমেন্টটি ধাপ ৭ (রিয়েল-টাইম প্রোডাকশন ও লাইভ OEE ট্র্যাকিং)-এর পূর্ণ টেকনিক্যাল ব্লুপ্রিন্ট হিসেবে কাজ করবে।

