# সফটওয়্যার রিকোয়ারমেন্টস স্পেসিফিকেশন (SRS) - অ্যাথেন্টিকেশন ও সিকিউরিটি
## মডিউল: ব্যবহারকারী পরিচয় যাচাই, আরবিক ও মেশিন সিকিউরিটি (Authentication, RBAC & Machine Access Control)
**ডকুমেন্ট কোড:** `SRS-LACS-SEC-01`  
**সংস্করণ:** v1.0.0 (Security & Identity Blueprint)  
**মডিউল প্যারেন্ট:** Denim Laser Automation & Control System (Denim LACS)  
**টার্গেট পরিবেশ:** সেন্ট্রাল ওয়েব পোর্টাল, ২০টি Jeanologia এজ-এজেন্ট ও শপ-ফ্লোর ট্যাবলেট  
**অনুমোদনকারী কর্তৃপক্ষ:** Product Director / CTO (স্যার)  
**তারিখ:** নভেম্বর ২০২৬  

---

## ১. মডিউল পরিচিতি ও নিরাপত্তা দর্শন (Security Philosophy)

Denim LACS একটি ইন্ডাস্ট্রিয়াল শপ-ফ্লোর অটোমেশন প্ল্যাটফর্ম। এখানে সাধারণ ওয়েব অ্যাপ্লিকেশনের মতো জটিল ক্যাপচা বা ওটিপি কার্যকর নয়, কারণ শপ-ফ্লোরের অপারেটরদের হাতে গ্লাভস থাকে এবং নেটওয়ার্কটি ১০০% অফলাইন (লোকাল ল্যান)। 
তাই আমাদের সিকিউরিটি আর্কিটেকচার **একটি ডুয়াল-মডেল অ্যাথেন্টিকেশন (Dual-Model Authentication)** দর্শন অনুসরণ করে:
1. **ম্যানেজমেন্ট ও ডিজাইনার টিয়ার**: হাই-সিকিউরিটি ইউজারনেম, আরগন২ (Argon2id) পাসওয়ার্ড ও আরবিক (RBAC) অনুমতি।
2. **শপ-ফ্লোর ও মেশিন টিয়ার**: দ্রুত ও নির্বিঘ্ন ৪-ডিজিটের কুইক-পিন (Quick PIN) / আরএফআইডি ব্যাজ এবং ২০টি এজ-আইপিসির জন্য হার্ডওয়্যার-লকড মেশিন এপিআই টোকেন (M2M Token)।

---

## ২. ব্যবহারকারীর ভূমিকা ও পারমিশন ম্যাট্রিক্স (RBAC Matrix)

সিস্টেমে মোট ৯টি সুনির্দিষ্ট ভূমিকা (Roles) থাকবে:

| রোল কোড (Role Code) | পদবি (Designation) | অনুমতি ও অ্যাক্সেস পরিধি (Allowed Permissions) |
| :--- | :--- | :--- |
| **`SUPER_ADMIN_CTO`** | সিটিও / আইটি হেড | সম্পূর্ণ সিস্টেম নিয়ন্ত্রণ, ইউজার তৈরি, ডেটাবেজ অডিট ও সিস্টেম কনফিগারেশন। |
| **`LASER_DESIGNER`** | লেজার ডিজাইনার | `.jean5` আপলোড, সাইজ ম্যাপিং, রেসিপি লক ও ডিজাইন রিভিশন কন্ট্রোল। |
| **`PLANNING_MERCHANDISER`** | মার্চেন্ডাইজার / প্ল্যানিং | বায়ার, নতুন PO নম্বর, স্টাইল ও সাইজ রেশিও এন্ট্রি এবং ডেলিভারি ডেট আপডেট। |
| **`QR_PRINT_OPERATOR`** | কিউআর প্রিন্ট অপারেটর | অনুমোদিত কাট লটের জন্য থার্মাল কিউআর প্রিন্ট ও রি-প্রিন্ট রিকোয়েস্ট। |
| **`INTAKE_SUPERVISOR`** | লেজার রিসিভিং সুপারভাইজার | সুইং থেকে আসা ট্রলি ইনটেক, ডিজিটাল চালান ভেরিফিকেশন ও ঘাটতি এলার্ট। |
| **`MACHINE_OPERATOR`** | Jeanologia মেশিন অপারেটর | ৪-ডিজিট পিন দিয়ে নিজের টেবিল লগইন, লাইভ কাউন্টার দেখা ও প্যাডেল প্রেস। |
| **`QC_INSPECTOR`** | কোয়ালিটি ইন্সপেক্টর | কিউসি ট্যাবলেটে কিউআর স্ক্যান, ডিফেক্ট ট্যাগিং, রি-লেজার রিকোয়েস্ট ও ওয়াশ চালান তৈরি। |
| **`WASH_MASTER`** | ওয়েট ওয়াশ ড্রাম মাস্টার | ডিজিটাল ওয়াশ চালান স্ক্যান করে ওয়াশিং ড্রামে কাপড় লোড ক্লিয়ারেন্স। |
| **`MAINTENANCE_ENG`** | মেইনটেন্যান্স ইঞ্জিনিয়ার | মেশিন ক্যালিব্রেশন, লেজার লেন্স/মিরর হেলথ চেক ও ডাউনটাইম কারণ এন্ট্রি। |

---

## ৩. অ্যাথেন্টিকেশন মেকানিজম (Authentication Mechanisms)

### ৩.১ সেন্ট্রাল ওয়েব ক্লায়েন্ট (JWT + Sliding Refresh Tokens)
- **পাসওয়ার্ড হ্যাশিং**: ইন্ডাস্ট্রিয়াল স্ট্যান্ডার্ড **Argon2id** (`m=65536, t=3, p=4`)—যা GPU/ASIC ব্রুট-ফোর্স অ্যাটাকের বিরুদ্ধে শতভাগ সুরক্ষিত।
- **অ্যাক্সেস টোকেন (Access Token)**: ক্রিপ্টোগ্রাফিক JWT (HS256), মেয়াদ **১৫ মিনিট**। ব্রাউজারের মেমরিতে সংরক্ষিত থাকবে।
- **রিফ্রেশ টোকেন (Refresh Token)**: RFC 9562 UUIDv7 স্ট্রিং, মেয়াদ **৭ দিন**। এটি ব্রাউজারের `HttpOnly, Secure, SameSite=Lax` কুকিতে সুরক্ষিত থাকবে, যাতে জাভাস্ক্রিপ্ট XSS অ্যাটাক দিয়ে টোকেন চুরি অসম্ভব হয়।
- **টোকেন রোটেশন (Token Rotation)**: প্রতিবার রিফ্রেশ টোকেন ব্যবহারের পর আগের টোকেন বাতিল হয়ে নতুন টোকেন জেনারেট হবে।

### ৩.২ ২০টি Jeanologia মেশিনের M2M সিকিউরিটি (Machine Cryptographic Tokens)
- ২০টি Jeanologia মেশিনের `laser_agent.exe` ব্যাকগ্রাউন্ড উইন্ডোজ সার্ভিস হিসেবে চলবে, যেখানে কোনো হিউম্যান লগইন উইন্ডো থাকবে না।
- প্রতিটি মেশিনের জন্য সেন্ট্রাল ডাটাবেজে একটি ইউনিক **Pre-Shared Cryptographic Machine Key (`X-Laser-Machine-Token`)** থাকবে।
- এই টোকেনটি এজেন্টের লোকাল `config.ini`-তে এনক্রিপ্ট অবস্থায় থাকবে।
- **আইপি হোয়াইটলিস্টিং**: মেশিন #০৭-এর টোকেন শুধুমাত্র নির্ধারিত আইপি `192.168.1.107` থেকে রিকোয়েস্ট পাঠালেই সার্ভার গ্রহণ করবে; অন্য কোনো আইপি থেকে পাঠালে সাথে সাথে ড্রপ ও অ্যালার্ম বাজবে।

### ৩.৩ শপ-ফ্লোর কুইক-সুইচ (Operator 4-Digit Quick PIN)
- ফ্যাক্টরি ফ্লোরে গ্লাভস পরা অবস্থায় বারবার জটিল ১৬ ক্যারেক্টারের পাসওয়ার্ড টাইপ করা সময়সাপেক্ষ।
- কিউসি ইন্সপেক্টর এবং মেশিন অপারেটররা তাদের জন্য বরাদ্দকৃত **৪-ডিজিটের নিউমেরিক পিন (PIN)** স্ক্রিনে ট্যাপ করে অথবা আরএফআইডি ব্যাজ সোয়াইপ করে ১ সেকেন্ডে লগইন করবেন।
- টানা ৩ বার ভুল পিন দিলে ওই টার্মিনালে ৫ মিনিটের জন্য লকআউট কার্যকর হবে।

---

## ৪. ব্রুট-ফোর্স ও থ্রেট প্রটেকশন (Threat Mitigation)

### FR-SEC-01: রেট লিমিটিং (Rate Limiting Engine)
- সেন্ট্রাল ব্যাকএন্ডে প্রতি আইপি এবং ইউজার অ্যাকাউন্টের ওপর রেট লিমিট প্রয়োগ থাকবে:
  * `/api/v1/auth/login`: প্রতি মিনিটে সর্বোচ্চ ৫টি ব্যর্থ রিকোয়েস্টের পর ১৫ মিনিট ব্লক।
  * `/api/v1/auth/quick-pin-login`: টানা ৩টি ভুলের পর অ্যাকাউন্ট টেম্পোরারি লক।

### FR-SEC-02: ইনস্ট্যান্ট সেশন রিভোকেশন (Instant Session Kill)
- কোনো ইউজারের পাসওয়ার্ড পরিবর্তন, অ্যাকাউন্ট সাসপেন্ড বা রোল ডাউনগ্রেড করা মাত্র তার সমস্ত সেশন ও রিফ্রেশ টোকেন সাথে সাথে ডাটাবেজ থেকে ইনভ্যালিড হয়ে যাবে।

### FR-SEC-03: অ্যান্টি-টেম্পারিং অডিট ট্রেইল (Security Audit Logging)
- সিস্টেমের যেকোনো স্পর্শকাতর কাজে (যেমন: ডিজাইনারের রেসিপি আনলক, কোয়ালিটি রিজেকশন বাইপাস বা বাল্ক ডেটা এডিট) স্বয়ংক্রিয়ভাবে অডিট ট্রেইলে লগ হবে: *কে করল, কোন আইপি থেকে করল, পুরানো মান কী ছিল এবং নতুন মান কী দেওয়া হলো*।

---

## ৫. ডেটাবেজ স্কিমা স্পেসিফিকেশন (Database Schema for Auth)

ধাপ ৯ পরিচালনার জন্য PostgreSQL 16-এ নিচের কোর টেবিলগুলো তৈরি হবে:

### টেবিল ১: `users` (সিস্টেম ব্যবহারকারী মাস্টার)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY, -- RFC 9562 UUIDv7
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,       -- Argon2id Hash
    quick_pin_hash VARCHAR(255),                 -- Salted 4-Digit PIN Hash
    full_name VARCHAR(100) NOT NULL,
    employee_badge_id VARCHAR(50) UNIQUE,        -- RFID Card / Employee ID
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT TRUE,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_badge ON users(employee_badge_id);
```

### টেবিল ২: `roles` ও `permissions` (ভূমিকা ও অনুমতি)
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,            -- e.g. 'LASER_DESIGNER'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,           -- e.g. 'designs:upload', 'orders:approve'
    module_name VARCHAR(50) NOT NULL,            -- 'ORDERS', 'DESIGNS', 'QC', 'FLEET'
    description TEXT
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);
```

### টেবিল ৩: `machine_auth_credentials` (২০টি Jeanologia মেশিনের সিক্রেট)
```sql
CREATE TABLE machine_auth_credentials (
    id UUID PRIMARY KEY,
    machine_id UUID NOT NULL REFERENCES laser_machines(id) ON DELETE CASCADE,
    api_token_hash VARCHAR(255) NOT NULL,        -- Pre-shared Key Hash
    allowed_ip_address VARCHAR(45) NOT NULL,     -- e.g. 192.168.1.107 (Binding)
    last_heartbeat_at TIMESTAMPTZ,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_machine_auth ON machine_auth_credentials(machine_id, is_revoked);
```

### টেবিল ৪: `security_audit_logs` (সিকিউরিটি অডিট ট্রেইল)
```sql
CREATE TABLE security_audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(50) NOT NULL,             -- LOGIN_SUCCESS, LOGIN_FAILED, RECIPE_OVERRIDE, SCRAP_CONFIRM
    target_resource VARCHAR(100),                -- 'orders:PO-884920'
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    metadata JSONB,                              -- পুরানো মান ও নতুন মানের ডিটেইল
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_sec_audit_event ON security_audit_logs(event_type, created_at);
```

---

## ৬. অ্যাথেন্টিকেশন এপিআই কন্ট্রাক্ট (API Endpoints for Auth)

| মেথড | এপিআই পাথ (Endpoint) | বিবরণ | নিরাপত্তা টিয়ার |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/login` | ওয়েব পোর্টালে ইউজারনেম ও পাসওয়ার্ড লগইন (JWT + Cookie) | পাবলিক / রেট-লিমিটেড |
| **POST** | `/api/v1/auth/quick-pin-login` | ট্যাবলেট ও মেশিনে ৪-ডিজিটের দ্রুত পিন / ব্যাজ লগইন | লোকাল ল্যান / ৩ বার লক |
| **POST** | `/api/v1/auth/refresh` | অ্যাক্সেস টোকেন রিনিউ করা (HttpOnly কুকি রিড) | সিকিউর কুকি |
| **POST** | `/api/v1/auth/logout` | সক্রিয় সেশন ও কুকি ইনভ্যালিড করে লগআউট | অথেন্টিকেটেড |
| **GET** | `/api/v1/auth/me` | বর্তমান লগইনকৃত ইউজারের রোল ও পারমিশন তালিকা | অথেন্টিকেটেড |
| **POST** | `/api/v1/auth/machine-heartbeat` | ২০টি এজ-এজেন্ট দ্বারা টোকেন ও আইপি পাঠিয়ে লাইভ সিগন্যাল | মেশিন টোকেন + আইপি লক |

---

এই স্পেসিফিকেশন ডকুমেন্টটি Denim LACS প্ল্যাটফর্মের **ইউজার আইডেন্টিটি, আরবিক পারমিশন ও মেশিন সিকিউরিটি আর্কিটেকচার**-এর পূর্ণ টেকনিক্যাল ব্লুপ্রিন্ট হিসেবে কাজ করবে।

