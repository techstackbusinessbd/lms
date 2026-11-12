# সফটওয়্যার রিকোয়ারমেন্টস স্পেসিফিকেশন (SRS) - ধাপ ৫
## মডিউল: লেজার বডি রিসিভিং ও ইনটেক অডিট (Laser Body Intake & Digital Receiving Audit)
**ডকুমেন্ট কোড:** `SRS-LACS-MOD-05`  
**সংস্করণ:** v1.0.0 (Granular Module Specification)  
**মডিউল প্যারেন্ট:** Denim Laser Automation & Control System (Denim LACS)  
**মডিউল ওনার:** লেজার রিসিভিং সুপারভাইজার / ওয়াশ স্টোর ইন-চার্জ  
**অনুমোদনকারী কর্তৃপক্ষ:** Product Director / CTO (স্যার)  
**তারিখ:** নভেম্বর ২০২৬  

---

## ১. মডিউল পরিচিতি ও ব্যবসায়িক উদ্দেশ্য (Introduction & Objectives)

### ১.১ প্রেক্ষাপট
সুইং সেকশন থেকে সেলাই সম্পন্ন হওয়া প্যান্টগুলো ট্রলি, ক্রেট বা ড্রামে করে ওয়াশিং ও লেজার ফ্লোরের প্রবেশদ্বারে আসে। 
ঐতিহ্যবাহী কারখানায় সুইং থেকে পাঠানো কাপড়ের সংখ্যার সাথে লেজারে আসা কাপড়ের সংখ্যার মিল থাকে না এবং ফিনিশিংয়ে গিয়ে যখন মাল কম পড়ে, তখন সুইং ও ওয়াশ ডিপার্টমেন্টের মধ্যে দোষারোপ শুরু হয়। 
**ধাপ ৫ (বডি রিসিভিং ও ইনটেক অডিট)** হলো লেজার ফ্লোরের একটি ডিজিটাল চেকপোস্ট (Air-Tight Gatekeeper), যা শতভাগ স্বচ্ছতার সাথে নিশ্চিত করবে সুইং থেকে পাঠানো প্রতিটি পিস অক্ষত অবস্থায় লেজারে প্রবেশ করেছে কি না।

### ১.২ মূল উদ্দেশ্য
1. **ডিজিটাল চালান রিসিভ ও শর্টেজ বন্ধ**: সুইংয়ের পাঠানো ডিজিটাল চালানের (`CHALAN-SW04-TO-LSR-0089`) সাথে লেজার ফিজিক্যাল ইনটেক মিলিয়ে ফেলা—যাতে ১টি প্যান্টও রাস্তায় হারিয়ে না যায়।
2. **তাৎক্ষণিক শর্টেজ অ্যালার্ট**: যদি ৫০০ পিসের চালানে ৪৯৮ পিস আসে, তবে সিস্টেম সাথে সাথে কোন ২টি পিসের কিউআর কোড মিসিং তা চিহ্নিত করে সুইং সুপারভাইজারের কাছে অ্যালার্ট পাঠাবে।
3. **২০টি মেশিনের জন্য ট্রলি রাউটিং (Smart Machine Routing)**: রিসিভ করা ট্রলিগুলোকে লেজারের নির্দিষ্ট মেশিন গ্রুপে (যেমন: ট্রলি ১৪ যাবে মেশিন ১ থেকে ৫-এ) ডিজিটালভাবে অ্যাসাইন করা।
4. **লেজার মেশিনের জন্য মাল আনলক করা**: এই ধাপে রিসিভ কনফার্ম হওয়ার পরেই কেবল Jeanologia মেশিনের স্ক্যানার ওই প্যান্টগুলো লেজারিংয়ের জন্য সক্রিয় করবে।

---

## ২. ব্যবহারকারীর ভূমিকা ও পারমিশন (User Roles & Access Control)

| রোল (Role) | অনুমতি (Permissions) | দায়িত্ব |
| :--- | :--- | :--- |
| **লেজার রিসিভিং সুপারভাইজার** | Scan, Receive, Discrepancy Report | সুইং চালান গ্রহণ করা, ট্রলি স্ক্যান করা এবং শর্টেজ রিপোর্ট তৈরি করা। |
| **সুইং লাইন সুপারভাইজার** | Resolve Shortage, Re-dispatch | লেজার থেকে আসা শর্টেজ নোটিফিকেশন চেক করে মিসিং প্যান্টের সমাধান দেওয়া। |
| **লেজার ডিজাইনার** | Read Only | কোন কোন স্টাইলের কাপড় লেজার ফ্লোরে প্রবেশ করেছে তা লাইভ দেখা। |
| **প্রোডাকশন ম্যানেজার / সিটিও** | Full Audit, WIP Metrics | সুইং থেকে লেজারের পাইপলাইনে কত পিস মাল চলমান (WIP) রয়েছে তা অডিট করা। |

---

## ৩. বডি রিসিভিং লাইফসাইকেল ও স্টেট ট্রানজিশন

```
[CHALAN_IN_TRANSIT] 
   │ (ধাপ ৪ শেষে ট্রলিটি সুইং থেকে লেজারের উদ্দেশ্যে রওনা হয়েছে)
   ▼
[TROLLEY_ARRIVED_AT_LASER] 
   │ (লেজারের দরজায় রিসিভিং ট্যাবলেটে চালানের কিউআর স্ক্যান করা হলো)
   ▼
[INTAKE_AUDIT_MODE] 
   ├── অপশন ক: সম্পূর্ণ চালান এক ক্লিকে রিসিভ (Fast Intake)
   └── অপশন খ: স্পট-চেক বা পিস-বাই-পিস স্ক্যান অডিট (Audit Intake)
   ▼
[RECONCILIATION_CHECK] 
   ├── যদি কাউন্ট ১০০% মিলে ➔ [RECEIVED_FULL]
   └── যদি মাল কম থাকে ➔ [SHORTAGE_FLAGGED & SEWING ALERT]
   ▼
[READY_FOR_MACHINE_QUEUE] (ধাপ ৬-এ Jeanologia টেবিলে কাজ শুরু হতে প্রস্তুত)
```

---

## ৪. স্ক্রিন ও ইউজার ইন্টারফেস স্পেসিফিকেশন (Intake Terminal UI)

লেজার দরজায় ট্যাবলেট বা টাচ পিসির ইন্টারফেসটি (`http://192.168.1.100/intake`) অত্যন্ত দ্রুতগতির হবে:

### ৪.১ পেন্ডিং চালান ট্র্যাকার (Pending Inbound Chalans)
স্ক্রিনে সুইং থেকে আসা সক্রিয় চালানের কার্ডগুলো দেখা যাবে:
* চালান: *CHALAN-SW04-TO-LSR-0089* | সুইং লাইন: *Line 04* | স্টাইল: *Levi's 511* | মোট: *৫০০ পিস*
* স্ট্যাটাস: `IN_TRANSIT` (কমলা রঙের ব্যাজ)।

### ৪.২ রিসিভিং ও অডিট স্ক্রিন (Chalan Reconciliation Screen)
চালানের কিউআর কোড স্ক্যান করলেই বিস্তারিত সাইজ ব্রেকডাউন ওপেন হবে:

| সাইজ (Size) | সুইংয়ের পাঠানো সংখ্যা | লেজারে রিসিভ করা সংখ্যা | পার্থক্য (Variance) | স্ট্যাটাস |
| :---: | :---: | :---: | :---: | :---: |
| **W30** | ২০০ পিস | ২০০ পিস | ০ (Match) | ✅ OK |
| **W32** | ৩০০ পিস | ২৯৮ পিস | -২ (Shortage) | ⚠️ **২ পিস মিসিং!** |
| **মোট** | **৫০০ পিস** | **৪৯৮ পিস** | **-২ পিস** | **[ Accept with Shortage ]** |

> **মিসিং পিস ট্র্যাকার**: স্ক্রিনে সাথে সাথে লাল বক্সে দেখাবে:  
> *⚠️ Missing Pieces: Unit #0142 (Size 32), Unit #0189 (Size 32) not received!*

---

## ৫. কার্যকরী রিকোয়ারমেন্টস (Functional Requirements - FR)

### FR-IR-01: ডিজিটাল চালান ওয়ান-ক্লিক রিসিভিং (Fast Batch Intake)
- সুপারভাইজার যদি ট্রলির শারীরিক বান্ডেল সংখ্যা সঠিক দেখেন, তবে চালানের কিউআর স্ক্যান করে **[ Accept Full Chalan ]** বাটনে চাপ দিলে ৫ সেকেন্ডের মধ্যে ৫০০ বা ১,০০০ পিসের পুরো লট সিস্টেমে রিসিভ হয়ে যাবে।
- প্রতিটি প্যান্টের স্ট্যাটাস আপডেট হবে: `garment_units.current_status = INTAKE_AT_LASER`।

### FR-IR-02: পিস-বাই-পিস অডিট মোড (Individual Scan Reconciliation)
- যদি ট্রলিতে সাইজ মিক্স থাকে বা সন্দেহ হয়, সুপারভাইজার ওয়্যারলেস বারকোড স্ক্যানার দিয়ে ট্রলির প্যান্টগুলো দ্রুত স্ক্যান করতে পারবেন।
- স্ক্যানার প্রতি পিসে 'বিপ' করবে এবং রিয়েল-টাইমে কাউন্টার ০ থেকে ৫০০ পর্যন্ত বাড়তে থাকবে। কোনো ডুপ্লিকেট প্যান্ট দ্বিতীয়বার স্ক্যান হলে স্ক্রিনে শব্দ হবে: *"Already Scanned!"*

### FR-IR-03: শর্টেজ ও ডিসক্রিপেন্সি ম্যানেজমেন্ট (Shortage & Misplace Alert)
- চালান ক্লোজ করার সময় কোনো পিস কম থাকলে সিস্টেম চালানটিকে `RECEIVED_SHORTAGE` হিসেবে ফ্ল্যাগ করবে।
- সাথে সাথে সুইং লাইন সুপারভাইজারের ড্যাশবোর্ডে ও মোবাইলে নোটিফিকেশন যাবে:  
  *🔔 "Shortage Alert: 2 pcs missing in Chalan #0089 from Line 04. Check sewing line floor!"*

### FR-IR-04: ফেব্রিক রোল ও শেড লট ইনস্পেকশন
- কাটিং থেকে আসা কাপড়ের রোল বা শেড লট (Shade Lot A/B) চালানের সাথে মেলানো হবে, যাতে ভিন্ন শেডের ট্রলি একসাথে মিশে গিয়ে লেজারে শেড ভ্যারিয়েশন তৈরি না করে।

### FR-IR-05: মেশিন প্রি-অ্যালোকেশন ও ফ্লোর রাউটিং (Smart Floor Allocation)
- রিসিভ করার সময় সুপারভাইজার নির্ধারণ করতে পারবেন এই ট্রলিটি কোন কোন মেশিনে চলবে:
  * যেমন: *Assign Trolley to: Machine #01, #02, #03*।
  * এর ফলে লেজার ফ্লোরের সুপারভাইজার জানবে কোন মেশিনের সামনে ট্রলিটি নিয়ে রাখতে হবে।

### FR-IR-06: লেজার মেশিনের সিকিউরিটি আনলক
- কোনো প্যান্ট যদি এই ধাপে আনুষ্ঠানিকভাবে রিসিভ না হয় (`INTAKE_AT_LASER` না হয়), তবে Jeanologia লেজার মেশিনের স্ক্যানারে সেটি স্ক্যান করলে মেশিন কাজ করবে না এবং এরর দেবে: *"Garment Not Received at Laser Intake!"*। এর ফলে চুরি করা বা আনঅথরাইজড কোনো কাপড় মেশিনে লেজার করা অসম্ভব।

---

## ৬. অকার্যকরী রিকোয়ারমেন্টস (Non-Functional Requirements - NFR)

### NFR-IR-01: দ্রুতগতির রিসিভিং রেসপন্স
- ৫০০ থেকে ১,০০০ পিসের বাল্ক চালান ডাটাবেজে স্ট্যাটাস আপডেট হতে লোকাল সার্ভারে অনূর্ধ্ব **১৫০ মিলি-সেকেন্ড** সময় লাগবে।

### NFR-IR-02: মোবাইল ও ট্যাবলেট ফ্রেন্ডলি ইউএক্স (Industrial Tablet Ready)
- লেজার রিসিভিং ইন্টারফেসটি সম্পূর্ণ রেসপনসিভ হবে, যাতে ওয়্যারলেস ওয়াই-ফাইযুক্ত সাধারণ যেকোনো অ্যান্ড্রয়েড বা আইপ্যাড ট্যাবলেটে সহজেই চালানো যায়।

---

## ৭. ডেটাবেজ স্কিমা স্পেসিফিকেশন (Database Schema for Step 5)

ধাপ ৫ পরিচালনার জন্য PostgreSQL 16-এ নিচের কোর টেবিলগুলো তৈরি হবে:

### টেবিল ১: `laser_intakes` (লেজার রিসিভিং মাস্টার টেবিল)
```sql
CREATE TABLE laser_intakes (
    id UUID PRIMARY KEY, -- RFC 9562 UUIDv7
    dispatch_id UUID NOT NULL REFERENCES sewing_dispatches(id) ON DELETE RESTRICT,
    intake_number VARCHAR(50) NOT NULL UNIQUE, -- INTAKE-LSR-202611-0042
    received_by UUID NOT NULL,                 -- রিসিভিং সুপারভাইজারের আইডি
    total_expected INTEGER NOT NULL,
    total_received INTEGER NOT NULL,
    total_shortage INTEGER DEFAULT 0,
    status VARCHAR(30) DEFAULT 'RECEIVED_FULL', -- RECEIVED_FULL, RECEIVED_SHORTAGE
    assigned_machine_group VARCHAR(100),       -- e.g. 'MACHINES_01_TO_05'
    notes TEXT,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_laser_intakes_dispatch ON laser_intakes(dispatch_id);
CREATE INDEX idx_laser_intakes_status ON laser_intakes(status);
```

### টেবিল ২: `intake_discrepancies` (মিসিং ও শর্টেজ পিস ট্র্যাকিং টেবিল)
```sql
CREATE TABLE intake_discrepancies (
    id UUID PRIMARY KEY, -- RFC 9562 UUIDv7
    intake_id UUID NOT NULL REFERENCES laser_intakes(id) ON DELETE CASCADE,
    garment_unit_id UUID NOT NULL REFERENCES garment_units(id) ON DELETE RESTRICT,
    discrepancy_type VARCHAR(30) NOT NULL, -- MISSING, DAMAGED_FABRIC, UNREADABLE_QR
    reported_by UUID NOT NULL,
    resolution_status VARCHAR(30) DEFAULT 'UNRESOLVED', -- UNRESOLVED, FOUND_LATER, REPLACED_BY_SEWING
    resolved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_discrepancies_intake ON intake_discrepancies(intake_id);
```

### টেবিল ৩: `garment_units` আপডেট (ধাপ ৫-এর জন্য স্ট্যাটাস আপডেট)
```sql
-- ধাপ ৫ সফলভাবে সম্পন্ন হলে garment_units টেবিলে আপডেট হবে:
-- current_status = 'INTAKE_AT_LASER'
-- intake_id = <laser_intakes.id>
-- intake_time = NOW()
```

---

## ৮. ব্যাকএন্ড এপিআই কন্ট্রাক্ট (FastAPI Endpoints for Step 5)

| মেথড | এপিআই পাথ (Endpoint) | বিবরণ | এক্সেস রোল |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/intake/inbound-chalans` | সুইং থেকে লেজারের পথে থাকা সক্রিয় চালানের তালিকা | লেজার রিসিভার |
| **POST** | `/api/v1/intake/receive-chalan` | সম্পূর্ণ চালান এক ক্লিকে রিসিভ কনফার্ম করা | লেজার রিসিভার |
| **POST** | `/api/v1/intake/scan-verify-piece` | পিস-বাই-পিস স্ক্যান করে চালান অডিট ও কাউন্ট মেলানো | লেজার রিসিভার |
| **POST** | `/api/v1/intake/report-shortage` | কোনো প্যান্ট মিসিং থাকলে শর্টেজ রিপোর্ট তৈরি ও অ্যালার্ট পাঠানো | লেজার রিসিভার |
| **GET** | `/api/v1/intake/wip-summary` | বর্তমানে লেজার ফ্লোরে কত পিস মাল অপেক্ষমাণ আছে তা দেখা | অল ইউজার |

---

এই স্পেসিফিকেশন ডকুমেন্টটি ধাপ ৫ (লেজার বডি রিসিভিং ও ইনটেক অডিট)-এর টেকনিক্যাল ডেভেলপমেন্টের পূর্ণ ভিত্তি হিসেবে কাজ করবে।

