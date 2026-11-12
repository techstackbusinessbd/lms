# সফটওয়্যার রিকোয়ারমেন্টস স্পেসিফিকেশন (SRS) - ধাপ ৮
## মডিউল: কোয়ালিটি অডিট, ডিফেক্ট ট্র্যাকিং ও ওয়াশ লট হ্যান্ডওভার (QC Audit, Defect Logging & Wet-Wash Handover Clearance)
**ডকুমেন্ট কোড:** `SRS-LACS-MOD-08`  
**সংস্করণ:** v1.0.0 (Granular Module Specification)  
**মডিউল প্যারেন্ট:** Denim Laser Automation & Control System (Denim LACS)  
**মডিউল ওনার:** লেজার কিউসি ইন্সপেক্টর, কোয়ালিটি ম্যানেজার ও সেন্ট্রাল সার্ভার  
**অনুমোদনকারী কর্তৃপক্ষ:** Product Director / CTO (স্যার)  
**তারিখ:** নভেম্বর ২০২৬  

---

## ১. মডিউল পরিচিতি ও ব্যবসায়িক উদ্দেশ্য (Introduction & Objectives)

### ১.১ প্রেক্ষাপট
লেজার মেশিন থেকে প্যান্ট কনভেয়ারে মুভ করে আউটপুট ট্রলিতে পড়ার পর সেগুলো লেজার কোয়ালিটি অডিট টেবিলে আসে। 
ড্রাই প্রসেস (Dry Process) লেজারের ত্রুটি—যেমন অতিরিক্ত বার্ন বা কাপড়ে সূক্ষ্ম ছিদ্র তৈরি হওয়া—ওয়াশিং ড্রামে (Wet Process) যাওয়ার আগে চিহ্নিত না করা হলে ওয়াশের এনজাইম ও ব্লিচের পর তা কাপড় সম্পূর্ণ ছিঁড়ে বি-গ্রেড বা স্ক্র্যাপে রূপান্তর করে। 
তাই **ধাপ ৮ (কিউসি অডিট ও ওয়াশ হ্যান্ডওভার)** হলো ফ্যাক্টরির চূড়ান্ত কোয়ালিটি গেটওয়ে। এটি নিশ্চিত করে যে প্রতিটি প্যান্ট বায়ারের মান অনুযায়ী নিখুঁতভাবে অনুমোদিত হয়েই পরবর্তী ওয়েট-ওয়াশিং ড্রামে পৌঁছাবে।

### ১.২ মূল উদ্দেশ্য
1. **১০০% ডিজিটাল কোয়ালিটি ট্রেসেবিলিটি**: কিউআর স্ক্যানার দিয়ে প্রতি পিসের বার্ন ইনটেনসিটি ও হুইস্কার/শেভরন পজিশন চেক করে পাস/রিজেক্ট রেকর্ড করা।
2. **১-ক্লিক ডিফেক্ট ট্যাক্সোনমি ম্যাপিং**: ত্রুটিযুক্ত প্যান্টের জন্য সুনির্দিষ্ট ডিফেক্ট কোড (Heavy Burn, Misaligned, Pattern Missing, Fabric Rupture ইত্যাদি) মুহূর্তের মধ্যে নথিভুক্ত করা।
3. **স্মার্ট রি-লেজার (Re-Laser) ওয়ার্কফ্লো**: কোনো প্যান্টে বার্ন ইনটেনসিটি কম (Faint Whisker) থাকলে তাকে নিয়ন্ত্রিত প্যারামিটারে পুনরায় লেজারে পাঠানোর ওয়ার্কফ্লো নিয়ন্ত্রণ।
4. **ডিজিটাল ওয়াশ চালান ও ট্রলি লক**: কোয়ালিটি পাস হওয়া প্যান্টগুলো নির্দিষ্ট সংখ্যায় (যেমন ৫০ বা ১০০ পিস) একত্রিত করে ওয়েট-ওয়াশের জন্য ডিজিটাল চালান তৈরি ও হস্তান্তর।
5. **মেশিন-ওয়াইজ ডিফেক্ট রুট-কজ অ্যানালাইসিস (RCA)**: ২০টি মেশিনের মধ্যে কোন নির্দিষ্ট মেশিনের অপটিক্স বা অপারেটরের কারণে ত্রুটি হচ্ছে তা লাইভ ফার্স্ট টাইম রাইট (FTR %) ও DHU মেট্রিক্সে বের করা।

---

## ২. ব্যবহারকারীর ভূমিকা ও পারমিশন (User Roles & Access Control)

| রোল (Role) | এক্সেস পরিধি | মূল দায়িত্ব |
| :--- | :--- | :--- |
| **লেজার কিউসি ইন্সপেক্টর** | QC Tablet App, Scanner Trigger | প্যান্টের কিউআর স্ক্যান করা, ভিজ্যুয়াল অডিট করা এবং Pass / Re-Laser / Reject স্ট্যাটাস দেওয়া। |
| **কোয়ালিটি ম্যানেজার** | Policy Config, Scrap Sign-off | রিজেকশন অনুমোদন, স্ক্র্যাপ ভেরিফিকেশন এবং দৈনিক ডিফেক্ট সামারি অডিট। |
| **ওয়াশ ড্রাম মাস্টার (Wet Wash)** | Chalan Receiver | লেজার ফ্লোর থেকে ট্রলি ও ডিজিটাল চালান স্ক্যান করে ওয়াশিং ড্রামে রিসিভ কনফার্ম করা। |
| **প্রোডাকশন ডিরেক্টর / সিটিও** | Executive Dashboard | কারখানা-ব্যাপী First Time Right (FTR %) এবং স্ক্র্যাপ কস্ট অ্যানালিটিক্স দেখা। |

---

## ৩. কিউসি অডিট লাইফসাইকেল ও স্টেট ট্রানজিশন

```
[PANT_ARRIVED_FROM_LASER] (মেশিন থেকে ট্রলিতে কিউসি টেবিলে এলো)
   │
   ▼
[QR_CODE_SCANNED_AT_TABLE] 
   │ (ট্যাবলেটে পিসের সমস্ত তথ্য ডিসপ্লে: Levi's 511, W32, Mach #07)
   │
   ├──▶ [QC_PASSED] ───▶ [PUT_INTO_APPROVED_TROLLEY]
   │                       │ (৫০ বা ১০০ পিস পূর্ণ হলে)
   │                       ▼
   │                     [GENERATE_WASH_HANDOVER_CHALAN]
   │                       │ (ডিজিটাল বারকোড চালান প্রিন্ট/সেন্ড)
   │                       ▼
   │                     [WASH_MASTER_SCANS_CHALAN]
   │                       │ (ড্রামে কাপড় লোড হলো)
   │                       ▼
   │                     [STATUS: IN_WET_PROCESSING]
   │
   ├──▶ [RE_LASER_REQUESTED] (হুইস্কার হালকা, পুনরায় লেজার প্রয়োজন)
   │     ├── সিস্টেম প্যারামিটার অফসেট লক (Reduced Power: -20%)
   │     └── প্যান্টটি রি-লেজার ট্রলিতে গিয়ে মেশিনে ফিরে গেল
   │
   └──▶ [QC_REJECTED / SCRAP] (অতিরিক্ত বার্নে কাপড় নষ্ট বা ফুটো)
         ├── ফটো ও ডিফেক্ট কোড লগ (Burn Hole / Double Line)
         └── ফেব্রিক ওয়েস্টেজ ও রিজেকশন লগে স্থায়ী এন্ট্রি
```

---

## ৪. কার্যকরী রিকোয়ারমেন্টস (Functional Requirements - FR)

### FR-QC-01: আল্ট্রা-ফাস্ট ট্যাবলেট স্ক্যানিং ইন্টারফেস (Sub-100ms)
- কিউসি ইন্সপেক্টর হ্যান্ডহেল্ড স্ক্যানার দিয়ে প্যান্টের কিউআর কোড স্ক্যান করার **১০০ মিলি-সেকেন্ডের মধ্যে** স্ক্রিনে পিসের বিবরণ ভেসে উঠবে:
  * বায়ার ও স্টাইল: *Levi's 511* | সাইজ: *32*
  * লেজার সম্পন্নকারী মেশিন: *Jeanologia #07* | অপারেটর: *OP-14*
  * মূল রেফারেন্স ছবি: *Approved Master Golden Sample Thumbnail*।

### FR-QC-02: ১-টাচ ডিফেক্ট হটস্পট ও ক্যাটাগরি লগিং
- কোনো ত্রুটি ধরা পড়লে কিউসি ইন্সপেক্টরকে স্ক্রিনে টাইপ করতে হবে না। স্ক্রিনে থাকা বড় টাচ বাটনে ট্যাপ করবেন:
  * `[ HEAVY_BURN ]`: অতিরিক্ত পাওয়ারের কারণে কাপড় বেশি পুড়ে গেছে বা খসখসে।
  * `[ FAINT_PATTERN ]`: বার্ন হালকা হয়েছে, বায়ারের স্ট্যান্ডার্ড আসেনি (রি-লেজার যোগ্য)।
  * `[ ALIGNMENT_SHIFT ]`: প্যাটার্ন উপরে বা নিচে সরে গেছে।
  * `[ BURN_HOLE / RUPTURE ]`: কাপড়ে ছিদ্র হয়ে গেছে (স্ক্র্যাপ/বাতিল)।
  * `[ DOUBLE_BURN ]`: একই প্যান্ট ভুলবশত দুইবার ফায়ার করা হয়েছে।

### FR-QC-03: নিয়ন্ত্রিত রি-লেজার (Re-Laser Policy & Recipe Attenuation)
- `FAINT_PATTERN` চিহ্নিত হলে সিস্টেম স্বয়ংক্রিয়ভাবে একটি বিশেষ `RE_LASER` ফ্ল্যাগ সেট করবে।
- এই প্যান্ট আবার যখন লেজার মেশিনের কনভেয়ারে স্ক্যান হবে, সফটওয়্যার এজেন্ট সাধারণ রেসিপির বদলে **স্বয়ংক্রিয়ভাবে ২০% কম পাওয়ারে (Power Attenuated) `.jean5` লোড করবে**, যাতে রি-লেজারে কাপড় পুড়ে নষ্ট না হয়।
- প্রতিটি পিস সর্বোচ্চ **১ বার** রি-লেজারের অনুমতি পাবে; দ্বিতীয়বার হালকা হলে তা কিউসি ম্যানেজারের স্পেশাল অ্যাপ্রুভালে যাবে।

### FR-QC-04: স্ক্র্যাপ জালিয়াতি রোধ ও ডাবল স্ক্যান লক
- একবার কোনো প্যান্ট `QC_PASSED` হয়ে ওয়াশ চালানে অন্তর্ভুক্ত হয়ে গেলে, একই কিউআর কোড দ্বিতীয়বার কিউসি টেবিলে স্ক্যান করলে সিস্টেমে বড় লাল ওয়ার্নিং আসবে: *"Duplicate QR! Garment already passed in Chalan #WH-1049!"*।
- কোনো রিজেক্ট হওয়া পিস লুকিয়ে ওয়াশে পাঠানো সম্পূর্ণ অসম্ভব হবে, কারণ ওয়াশ ড্রাম শুধুমাত্র সিস্টেমে ভ্যালিড `QC_PASSED` পিসই ড্রামে গ্রহণ করবে।

### FR-QC-05: ডিজিটাল ওয়াশ চালান ও ট্রলি বারকোড জেনারেশন
- একটি ট্রলি ভর্তি হওয়া মাত্র (যেমন ১০০ পিস সাইজ ৩২) কিউসি ইন্সপেক্টর **[ Generate Wash Chalan ]** বাটনে চাপ দেবেন।
- সিস্টেম মুহূর্তের মধ্যে একটি ডিজিটাল চালান নম্বর (যেমন `CH-WASH-202611-0012`) তৈরি করবে। 
- প্রয়োজনে থার্মাল প্রিন্টারে ট্রলির হাতলে লাগানোর জন্য একটি চালান কিউআর স্টিকার প্রিন্ট হবে।

### FR-QC-06: ওয়াশ ড্রাম মাস্টার ডিজিটাল ইনটেক অডিট
- ট্রলিটি ওয়েট-ওয়াশ সেকশনে পৌঁছালে ওয়াশ মাস্টার চালানের বারকোড স্ক্যান করবেন।
- সিস্টেমে এক নজরে দেখাবে: *চালানে অনুমোদিত পিস: ১০০ | সাইজ: ৩২ | স্টাইল: Levi's 511*।
- ওয়াশ মাস্টার **[ Accept & Load to Drum ]** প্রেস করলেই লটটি ওয়াশিং প্রসেসে প্রবেশ করবে। কোনো পিস ড্রপ বা মিসিং থাকলে ওয়াশ মাস্টার সাথে সাথে ডিসক্রিপেন্সি রিপোর্ট তুলতে পারবেন।

### FR-QC-07: লাইভ ফার্স্ট টাইম রাইট (FTR %) ও DHU ইঞ্জিন
- সিস্টেম স্বয়ংক্রিয়ভাবে প্রতিটি শিফট ও প্রতিদিনের কোয়ালিটি মেট্রিক্স হিসাব করবে:
  $$\text{FTR \%} = \left( \frac{\text{প্রথমবার অডিটে পাস হওয়া পিস}}{\text{মোট অডিটকৃত পিস}} \right) \times ১০০$$
  $$\text{DHU (Defects per Hundred Units)} = \left( \frac{\text{মোট চিহ্নিত ত্রুটির সংখ্যা}}{\text{মোট অডিটকৃত পিস}} \right) \times ১০০$$

### FR-QC-08: মেশিন ও অপারেটর-ওয়াইজ ডিফেক্ট রুট-কজ (RCA)
- যদি দেখা যায় Jeanologia #০৭ মেশিনে অন্য মেশিনের চেয়ে `HEAVY_BURN` ডিফেক্ট ৩ গুণ বেশি, সিস্টেম কোয়ালিটি ম্যানেজার ও মেইনটেন্যান্স টিমকে রুট-কজ এলার্ট পাঠাবে: *"Machine #07 Laser Lens/Mirror Calibration Required!"*।

---

## ৫. অকার্যকরী রিকোয়ারমেন্টস (Non-Functional Requirements - NFR)

### NFR-QC-01: ট্যাবলেট টাচ-অপ্টিমাইজড হাই-কনট্রাস্ট UI
- কিউসি ফ্লোরের উজ্জ্বল হাই-লুমেন ইন্সপেকশন আলোর নিচেও যেন পরিষ্কার দেখা যায়, তাই কিউসি স্ক্রিনে হাই-কনট্রাস্ট ডার্ক ও লাইট থিম সাপোর্ট থাকবে। সমস্ত বাটন ন্যূনতম ৪৮x৪৮ পিক্সেল টাচ সাইজের হবে।

### NFR-QC-02: অফলাইন লোকাল স্টোরেজ ব্যাকআপ
- ওয়াইফাই সিগন্যাল সাময়িক ড্রপ করলেও কিউসি ট্যাবলেট লোকাল বাফারে স্ক্যান ডাটা সংরক্ষণ করবে এবং নেটওয়ার্ক পেলেই ব্যাকগ্রাউন্ডে সেন্ট্রাল সার্ভারে ডাটা পুশ করে দেবে।

---

## ৬. ডেটাবেজ স্কিমা স্পেসিফিকেশন (Database Schema for Step 8)

ধাপ ৮ পরিচালনার জন্য PostgreSQL 16-এ নিচের কোর টেবিলগুলো তৈরি হবে:

### টেবিল ১: `qc_inspection_logs` (কোয়ালিটি অডিটের প্রতিটি পিসের লগ)
```sql
CREATE TABLE qc_inspection_logs (
    id UUID PRIMARY KEY, -- RFC 9562 UUIDv7
    garment_unit_id UUID NOT NULL REFERENCES garment_units(id) ON DELETE RESTRICT,
    inspector_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    machine_id UUID NOT NULL REFERENCES laser_machines(id) ON DELETE RESTRICT,
    inspection_status VARCHAR(20) NOT NULL, -- PASSED, RE_LASER, REJECTED
    defect_code VARCHAR(50),               -- HEAVY_BURN, FAINT_PATTERN, ALIGNMENT_SHIFT, BURN_HOLE, DOUBLE_BURN
    defect_location VARCHAR(50),           -- FRONT_WHISKER, BACK_CHEVRON, POCKET, KNEE, THIGH
    severity VARCHAR(20) DEFAULT 'MINOR',  -- MINOR, MAJOR, CRITICAL
    re_laser_power_offset_percent INT DEFAULT -20,
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_qc_garment ON qc_inspection_logs(garment_unit_id);
CREATE INDEX idx_qc_status ON qc_inspection_logs(inspection_status);
CREATE INDEX idx_qc_created_at ON qc_inspection_logs(created_at);
```

### টেবিল ২: `wash_handover_chalans` (ওয়েট ওয়াশ চালান মাস্টার)
```sql
CREATE TABLE wash_handover_chalans (
    id UUID PRIMARY KEY, -- RFC 9562 UUIDv7
    chalan_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. CH-WASH-202611-0012
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    trolley_number VARCHAR(50) NOT NULL,
    total_pieces INT NOT NULL,
    generated_by UUID NOT NULL REFERENCES users(id),
    received_by UUID REFERENCES users(id),
    status VARCHAR(30) DEFAULT 'DISPATCHED',   -- DISPATCHED, IN_TRANSIT, RECEIVED_AT_WASH, DISCREPANCY
    dispatched_at TIMESTAMPTZ DEFAULT NOW(),
    received_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_wash_chalan_no ON wash_handover_chalans(chalan_number);
CREATE INDEX idx_wash_chalan_order ON wash_handover_chalans(order_id);
```

### টেবিল ৩: `wash_handover_items` (চালানের অন্তর্ভুক্ত প্রতিটি পিসের তালিকা)
```sql
CREATE TABLE wash_handover_items (
    id UUID PRIMARY KEY, -- RFC 9562 UUIDv7
    chalan_id UUID NOT NULL REFERENCES wash_handover_chalans(id) ON DELETE CASCADE,
    garment_unit_id UUID NOT NULL REFERENCES garment_units(id) ON DELETE RESTRICT,
    scanned_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_chalan_items ON wash_handover_items(chalan_id, garment_unit_id);
```

---

## ৭. ব্যাকএন্ড এপিআই কন্ট্রাক্ট (API Endpoints for Step 8)

| মেথড | এপিআই পাথ (Endpoint) | বিবরণ | এক্সেস রোল |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/qc/inspect` | কিউসি অডিট সাবমিট (Pass, Re-Laser, Reject) | QC Inspector |
| **GET** | `/api/v1/qc/garment-history/{qr_code}` | পিসের লেজার ইতিহাস, মেশিন নম্বর ও সাইকেল টাইম দেখা | QC Inspector |
| **POST** | `/api/v1/qc/chalans/create` | ট্রলির পাস হওয়া পিসগুলো দিয়ে নতুন ওয়াশ চালান তৈরি | QC Supervisor |
| **POST** | `/api/v1/qc/chalans/receive` | ওয়াশ মাস্টার কর্তৃক চালান রিসিভ ও ড্রামে কনফার্মেশন | Wash Master |
| **GET** | `/api/v1/qc/metrics/dhu-ftr` | লাইভ FTR %, DHU এবং মেশিন-ওয়াইজ ত্রুটির তালিকা | ম্যানেজমেন্ট / সিটিও |

---

এই স্পেসিফিকেশন ডকুমেন্টটি সিস্টেমের **ধাপ ৮: QC Audit & Lot Handover**-এর পূর্ণ টেকনিক্যাল ও ফাংশনাল ব্লুপ্রিন্ট হিসেবে কাজ করবে।

