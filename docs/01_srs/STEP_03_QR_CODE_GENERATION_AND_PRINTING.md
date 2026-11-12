# সফটওয়্যার রিকোয়ারমেন্টস স্পেসিফিকেশন (SRS) - ধাপ ৩
## মডিউল: কিউআর কোড জেনারেশন ও প্রিন্টিং ইঞ্জিন (QR Code Generation & Thermal Printing Engine)
**ডকুমেন্ট কোড:** `SRS-LACS-MOD-03`  
**সংস্করণ:** v1.0.0 (Granular Module Specification)  
**মডিউল প্যারেন্ট:** Denim Laser Automation & Control System (Denim LACS)  
**মডিউল ওনার:** সুইং কিউআর প্রিন্টিং ইন-চার্জ / কাটিং ডেটা এন্ট্রি অপারেটর  
**অনুমোদনকারী কর্তৃপক্ষ:** Product Director / CTO (স্যার)  
**তারিখ:** নভেম্বর ২০২৬  

---

## ১. মডিউল পরিচিতি ও ব্যবসায়িক উদ্দেশ্য (Introduction & Objectives)

### ১.১ প্রেক্ষাপট
একটি আধুনিক ডেনিম কারখানায় পোশাকের ডিজিটাল পরিচিতি (Digital Garment Identity) নিশ্চিত করার চাবিকাঠি হলো কিউআর কোড লেবেল। 
সুইং লাইনে ফ্রন্ট ও ব্যাক পার্ট সেলাই করে জোড়া লাগানোর আগে (Assembly Stage) কাপড়ে লাগানোর জন্য প্রয়োজনীয় কিউআর কোড এই মডিউল থেকেই প্রস্তুত এবং প্রিন্ট করা হবে।

### ১.২ মূল উদ্দেশ্য
1. **ডিজিটাল জন্ম নিবন্ধন (Birth Certificate of Garment)**: কাটিং কাট নম্বর এবং অনুমোদিত বায়ার PO-এর সাথে লিংক করে প্রতিটি প্যান্টের জন্য একটি অনন্য (Unique) টাইম-সর্টেড কিউআর কোড তৈরি করা।
2. **ডিজাইন ফাইল ছাড়া প্রিন্ট ব্লক (Pre-requisite Gate)**: যদি কোনো স্টাইলের লেজার ডিজাইন ফাইল ভল্টে আপলোড ও লক না থাকে (`orders.status != DESIGN_APPROVED`), তবে সিস্টেম কিউআর প্রিন্ট করতে দেবে না—যাতে ফ্লোরে ডিজাইনবিহীন কোনো কাপড় না ঢুকতে পারে।
3. **হাই-স্পিড ডিরেক্ট থার্মাল প্রিন্টিং**: কোনো স্লো ব্রাউজার প্রিন্ট ডায়ালগ ছাড়া সরাসরি থার্মাল প্রিন্টারে (Zebra / TSC) সেকেন্ডের মধ্যে শত শত সিন্থেটিক কিউআর স্টিকার প্রিন্ট করা।
4. **ডুপ্লিকেট ও ওভার-প্রিন্ট প্রতিরোধ**: অর্ডারের অতিরিক্ত কিউআর প্রিন্ট হওয়া বন্ধ করা এবং কোনো লেবেল ছিঁড়ে গেলে সুপারভাইজার পিন ছাড়া রি-প্রিন্ট ব্লক রাখা।

---

## ২. ব্যবহারকারীর ভূমিকা ও পারমিশন (User Roles & Access Control)

| রোল (Role) | অনুমতি (Permissions) | দায়িত্ব |
| :--- | :--- | :--- |
| **সুইং কিউআর অপারেটর (QR Print Operator)** | Read Approved PO, Generate, Print | অনুমোদিত PO সিলেক্ট করা, কাট নম্বর এন্ট্রি ও ব্যাচ প্রিন্ট দেওয়া। |
| **সুইং / কাটিং সুপারভাইজার** | Approve Over-limit, Re-print Auth | লেবেল নষ্ট হলে অথরাইজেশন পিন (PIN) দিয়ে রি-প্রিন্ট অনুমোদন করা। |
| **লেজার ডিজাইনার** | Read Only | কোন কোন PO-র জন্য কিউআর প্রিন্ট হয়েছে তা ভেরিফাই করা। |
| **প্ল্যানিং হেড / সিটিও** | Audit, Full Log Visibility | প্রিন্ট হিস্ট্রি, মোট প্রিন্ট কোয়ান্টিটি ও কাট এলাউয়েন্স অডিট করা। |

---

## ৩. কিউআর কোড প্রিন্ট লাইফসাইকেল ও স্টেট মেশিন

```
[APPROVED_PO_SELECTED] 
   │ (অপারেটর অনুমোদিত PO ও কাট নম্বর সিলেক্ট করবে)
   ▼
[BATCH_GENERATED] 
   │ (সিস্টেম মেমরিতে প্রতিটি পিসের জন্য ইউনিক UUIDv7 কিউআর পে-লোড তৈরি করবে)
   ▼
[PRINTING_SENT] 
   │ (Direct ZPL/TSPL সকেটের মাধ্যমে থার্মাল প্রিন্টারে র-কমান্ড প্রেরণ)
   ▼
[PRINT_COMPLETED] 
   │ (লেবেলগুলো রোল আকারে বের হবে এবং সুইং অ্যাসেম্বলি টেবিলে ডেলিভারি হবে)
   ▼
[ATTACHED_TO_GARMENT] (ধাপ ৪-এ সুইং অপারেটর সেলাই করে দেবে)
```

---

## ৪. স্ক্রিন ও ইউজার ইন্টারফেস স্পেসিফিকেশন (QR Station UI)

প্রিন্টিং স্টেশনের ইন্টারফেসটি (`http://192.168.1.100/print`) বড় টাচ বাটনে পরিচালিত হবে:

### ৪.১ পিও ও কাট সিলেকশন প্যানেল (Order & Cut Selector)
* **Approved PO Dropdown**: শুধুমাত্র সেই অর্ডারগুলো আসবে যেগুলোর ডিজাইন রেসিপি ডিজাইনার দ্বারা লক করা হয়েছে (`DESIGN_APPROVED`)।
* **Cut Number Input**: কাটিংয়ের কাট নম্বর (যেমন: *Cut-14* বা *Cut-15*)।
* **Fabric Roll / Shade Lot**: ফেব্রিকের শেড কোড বা লট নম্বর (যেমন: *Roll Lot A* বা *Shade #2*)।
* **Production Type**: 
  * `[🔘 Complete Garment (পিস-লেভেল লেবেল - ৮০-৯০%)]`
  * `[⚪ Cut Panels (বান্ডেল-লেভেল লেবেল - ১০-২০%)]`

### ৪.২ সাইজ ও কোয়ান্টিটি ব্যাচ প্রিভিউ (Batch Preview Grid)
অর্ডার থেকে সাইজ রেশিও স্বয়ংক্রিয়ভাবে লোড হবে:

| সাইজ (Size) | অর্ডার কোয়ান্টিটি | এই কাটের পরিমাণ | বান্ডেল সংখ্যা (প্রতি বান্ডেলে ২০ পিস) | প্রিন্ট স্ট্যাটাস |
| :---: | :---: | :---: | :---: | :---: |
| **W28** | ১,০০০ পিস | ২০০ পিস | ১০টি বান্ডেল (#১ থেকে #১০) | [ Ready ] |
| **W30** | ২,০০০ পিস | ৪০০ পিস | ২০টি বান্ডেল (#১১ থেকে #৩০) | [ Ready ] |
| **W32** | ২,০০০ পিস | ৪০০ পিস | ২০টি বান্ডেল (#৩১ থেকে #৫০) | [ Ready ] |
| **W34** | ১,০০০ পিস | ২০০ পিস | ১০টি বান্ডেল (#৫১ থেকে #৬০) | [ Ready ] |
| **সর্বমোট** | **৬,০০০ পিস** | **১,২০০ পিস** | **৬০টি বান্ডেল (১,২০০ স্টিকার)** | **[ Print 1,200 Labels ]** |

---

## ৫. কার্যকরী রিকোয়ারমেন্টস (Functional Requirements - FR)

### FR-QP-01: ডিজাইন অনুমোদন গেট (Design Approval Pre-requisite)
- সিস্টেম কোনো অবস্থাতেই `DESIGN_APPROVED` স্ট্যাটাস ছাড়া কোনো অর্ডারের কিউআর প্রিন্ট কমান্ড গ্রহণ করবে না।
- ডিজাইন না থাকলে স্ক্রিনে লাল মেসেজ আসবে: *"Laser Design Missing! Contact Laser Designer."*

### FR-QP-02: ইউনিক আইডেন্টিফায়ার ও টাইম-সর্টেড UUIDv7 জেনারেশন
- প্রতিটি পিস গার্মেন্টসের জন্য একটি অনন্য **RFC 9562 UUIDv7** তৈরি হবে।
- এতে মিলি-সেকেন্ড টাইমস্ট্যাম্প এবং সিকোয়েনশিয়াল কাউন্টার এনকোড থাকবে, যা কোটি কোটি স্ক্যানের মধ্যেও কখনো কনফ্লিক্ট করবে না।

### FR-QP-03: কমপ্যাক্ট কিউআর পে-লোড এনকোডিং স্ট্যান্ডার্ড
কিউআর কোডের ভেতরে নিচের ফরম্যাটে আল্ট্রা-কমপ্যাক্ট টেক্সট এনকোড করা থাকবে (যাতে 2D স্ক্যানার মাত্র ০.০৫ সেকেন্ডে পড়তে পারে):

```text
LACS|PO884920|ST511|SZ32|C14|B05|P012|T_FULL|0192e4a8-6b2a-71a2-9b21-2f8194ad10e5
```
* **LACS**: সিস্টেম প্রিফিক্স (ইনভ্যালিড কোড ফিল্টারের জন্য)
* **PO884920**: পারচেজ অর্ডার নম্বর
* **ST511**: স্টাইল কোড
* **SZ32**: সাইজ (যেমন: Size 32)
* **C14**: কাটিং কাট নম্বর (Cut 14)
* **B05**: বান্ডেল নম্বর (Bundle 05)
* **P012**: পিস নম্বর (Piece 12 of 20)
* **T_FULL**: টাইপ (`T_FULL` = কমপ্লিট বডি, `T_PART` = কাটিং পার্টস)
* **UUIDv7**: ইউনিক ট্র্যাকিং হ্যাশ

### FR-QP-04: র-থার্মাল প্রিন্ট ইঞ্জিন (Direct ZPL/TSPL Socket)
- ব্রাউজার কোনো স্লো পিডিএফ বা সিস্টেম প্রিন্ট ডায়ালগ ওপেন করবে না।
- ব্যাকঅফিস পাইথন সার্ভিস লোকাল ল্যানে থার্মাল প্রিন্টারের **Raw Port 9100 (TCP/IP)** অথবা **Web Serial / USB** দিয়ে সরাসরি ZPL (Zebra) বা TSPL (TSC) হেক্স বাইট পাঠাবে।
- প্রিন্টিং স্পিড: প্রতি সেকেন্ডে ১০-১৫টি লেবেল প্রিন্ট হবে (১,২০০ লেবেল মাত্র ১.৫ মিনিটে শেষ)।

### FR-QP-05: ওভার-প্রিন্টিং ও কাটিং এলাউয়েন্স গার্ড
- কোনো কাটের জন্য অর্ডারের অতিরিক্ত কিউআর প্রিন্ট করা নিষিদ্ধ।
- কাটিং রিজেকশন কাভারের জন্য সর্বোচ্চ **+৩% থেকে +৫% এলাউয়েন্স** সাপোর্ট করবে। এর বেশি প্রিন্ট করতে গেলে প্ল্যানিং হেডের অনুমোদন লাগবে।

### FR-QP-06: রি-প্রিন্ট সিকিউরিটি ও ডুপ্লিকেট প্রতিরোধ (Re-print Control)
- সেলাই বা কাটিং ফ্লোরে কোনো স্টিকার নষ্ট বা হারিয়ে গেলে সাধারণ অপারেটর ইচ্ছামতো রি-প্রিন্ট দিতে পারবে না।
- রি-প্রিন্টের জন্য **সুপারভাইজার পিন (Supervisor PIN)** ইনপুট দিতে হবে।
- রি-প্রিন্ট করা লেবেলের ওপর স্পষ্টভাবে **`[REPRINT]`** লেখা থাকবে, যাতে একই পিসের দুটি মাল তৈরি করে কারখানায় চুরি বা মিসিং ঠেকানো যায়।

### FR-QP-07: কাটিং পার্টস বান্ডেল লেবেল মোড (Cut Panels - ১০-২০%)
- কাটিং পার্টসের ক্ষেত্রে (যেমন: ৫০টি ব্যাক পকেটের একটি বান্ডেল) প্রতিটি কাপড়ে লেবেল না দিয়ে **বান্ডেলের মাস্টার টিকেটে ১টি বড় কিউআর স্টিকার** প্রিন্ট হবে।
- স্টিকারে প্লাই সংখ্যা (যেমন: *Qty: 50 pcs*) এবং পার্ট নেম (*Back Pocket Left*) লেখা থাকবে।

---

## ৬. অকার্যকরী রিকোয়ারমেন্টস (Non-Functional Requirements - NFR)

### NFR-QP-01: লেবেল স্থায়িত্ব ও স্ক্যানেবিলিটি
- লেবেলগুলো সিন্থেটিক টিয়ার-অ্যাওয়ে পেপার অথবা ওয়াশেবল পিভিসি উপাদানের হতে হবে, যা সুইং সেলাইয়ের সময় অক্ষত থাকবে এবং ডাস্টেও স্ক্যানার সহজে পড়তে পারবে।
- কিউআর কোডের সাইজ সর্বনিম্ন **১৫ মি.মি. x ১৫ মি.মি.** এবং এরর কারেকশন লেভেল `ECC Level M (15% Recovery)` নিশ্চিত করতে হবে।

### NFR-QP-02: প্রিন্টার স্ট্যাটাস ফিডব্যাক
- থার্মাল প্রিন্টারে পেপার শেষ হলে (Out of Paper) বা রিবন ড্রপ করলে সিস্টেম সাথে সাথে ব্রাউজারে অ্যালার্ট দেবে এবং প্রিন্টিং পজ করবে।

---

## ৭. লেবেল ফিজিক্যাল সাইজ ও ZPL কোড স্পেসিফিকেশন

* **লেবেল সাইজ**: ৫০ মি.মি. (প্রস্থ) x ২৫ মি.মি. (উচ্চতা)
* **ZPL টেমপ্লেট কোড (Zebra ZD220 / TSC Compatible)**:

```zpl
^XA
^PW400
^LL200
^FO30,25^BQN,2,4^FDMA,LACS|PO884920|ST511|SZ32|C14|B05|P012|T_FULL|0192e4a8^FS
^FO160,25^A0N,28,28^FDLEVI'S - 511^FS
^FO160,60^A0N,36,36^FDSIZE: 32^FS
^FO160,105^A0N,22,22^FDCUT: 14 | BNDL: 05^FS
^FO160,135^A0N,20,20^FDPC: 12/20 | PO: 884920^FS
^XZ
```

---

## ৮. ডেটাবেজ স্কিমা স্পেসিফিকেশন (Database Schema for Step 3)

ধাপ ৩ পরিচালনার জন্য PostgreSQL 16-এ নিচের কোর টেবিলগুলো তৈরি হবে:

### টেবিল ১: `cutting_lots` (কাটিং লট টেবিল)
```sql
CREATE TABLE cutting_lots (
    id UUID PRIMARY KEY, -- RFC 9562 UUIDv7
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    cut_number VARCHAR(50) NOT NULL,
    fabric_roll_lot VARCHAR(100),
    total_cut_quantity INTEGER NOT NULL CHECK (total_cut_quantity > 0),
    cutting_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_order_cut UNIQUE (order_id, cut_number)
);
CREATE INDEX idx_cutting_lots_order_id ON cutting_lots(order_id);
```

### টেবিল ২: `bundles` (বান্ডেল টেবিল)
```sql
CREATE TABLE bundles (
    id UUID PRIMARY KEY, -- RFC 9562 UUIDv7
    cutting_lot_id UUID NOT NULL REFERENCES cutting_lots(id) ON DELETE CASCADE,
    waist_size VARCHAR(20) NOT NULL,
    bundle_number VARCHAR(30) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    part_type VARCHAR(30) DEFAULT 'COMPLETE_GARMENT', -- COMPLETE_GARMENT, CUT_PANEL
    status VARCHAR(30) DEFAULT 'PRINTED', -- PRINTED, ATTACHED, RECEIVED_LASER, LASERED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_cut_bundle UNIQUE (cutting_lot_id, bundle_number)
);
CREATE INDEX idx_bundles_cutting_lot_id ON bundles(cutting_lot_id);
```

### টেবিল ৩: `garment_units` (প্রতিটি প্যান্টের ইউনিক ডিজিটাল রেকর্ড)
```sql
CREATE TABLE garment_units (
    id UUID PRIMARY KEY, -- RFC 9562 UUIDv7 (কিউআর কোডের মূল আইডি)
    bundle_id UUID NOT NULL REFERENCES bundles(id) ON DELETE RESTRICT,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    waist_size VARCHAR(20) NOT NULL,
    piece_sequence INTEGER NOT NULL,    -- বান্ডেলের কত নম্বর পিস (যেমন: ১ থেকে ২০)
    qr_payload VARCHAR(255) NOT NULL UNIQUE,
    current_status VARCHAR(30) DEFAULT 'PRINTED', -- PRINTED, ATTACHED, INTAKE_LASER, LASER_FRONT_DONE, LASER_COMPLETED, QC_PASSED
    laser_machine_id UUID,             -- কোন Jeanologia টেবিলে কাজ হয়েছে
    lasered_at TIMESTAMPTZ,
    cycle_time_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_garment_units_qr ON garment_units(qr_payload);
CREATE INDEX idx_garment_units_status ON garment_units(current_status);
CREATE INDEX idx_garment_units_order_size ON garment_units(order_id, waist_size);
```

---

## ৯. ব্যাকএন্ড এপিআই কন্ট্রাক্ট (FastAPI Endpoints for Step 3)

| মেথড | এপিআই পাথ (Endpoint) | বিবরণ | এক্সেস রোল |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/qr/approved-orders` | অনুমোদিত PO এবং কাটিং প্ল্যানের তালিকা রিড | কিউআর অপারেটর |
| **POST** | `/api/v1/qr/generate-batch` | নির্দিষ্ট কাটের জন্য কিউআর পে-লোড ব্যাচ জেনারেশন | কিউআর অপারেটর |
| **POST** | `/api/v1/qr/print-zpl` | থার্মাল প্রিন্টারে র-সকেট বা সিরিয়াল প্রিন্ট পুশ করা | কিউআর অপারেটর |
| **POST** | `/api/v1/qr/reprint` | সুপারভাইজার পিন যাচাই করে নষ্ট লেবেল রি-প্রিন্ট করা | সুপারভাইজার |
| **GET** | `/api/v1/qr/bundles-by-cut/{cut_id}` | নির্দিষ্ট কাটের সমস্ত বান্ডেল ও পিস হিস্ট্রি দেখা | অল ইউজার |

---

এই স্পেসিফিকেশন ডকুমেন্টটি ধাপ ৩ (কিউআর কোড জেনারেশন ও প্রিন্টিং ইঞ্জিন)-এর টেকনিক্যাল ডেভেলপমেন্টের পূর্ণ ভিত্তি হিসেবে কাজ করবে।

