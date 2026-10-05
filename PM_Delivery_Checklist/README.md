# PM Delivery Checklist & Project Closeout (ISO/IEC 29110)

โฟลเดอร์นี้รวบรวมเอกสารและการดำเนินงานในส่วนของ **Project Manager (PM)** สำหรับกิจกรรม **"การตรวจสอบรายการส่งมอบตาม Product Delivery Checklist ก่อนปิดโครงการ" (ISO/IEC 29110 — PM.4 Project Closure & SI.6 Product Delivery)**

---

## 📁 โครงสร้างเอกสารภายในโฟลเดอร์

```
PM_Delivery_Checklist/
├── README.md                          # เอกสารแนะนำภาพรวมของโฟลเดอร์ PM Delivery Checklist
└── Product_Delivery_Checklist.md      # เอกสารรายการตรวจสอบการส่งมอบผลิตภัณฑ์และใบลงนามปิดโครงการ (ฉบับสมบูรณ์)
```

---

## 📋 เอกสารหลัก (Main Document)

👉 **[Product_Delivery_Checklist.md](file:///e:/ENG205%20reqmentWeb/PM_Delivery_Checklist/Product_Delivery_Checklist.md)**

### สาระสำคัญของเอกสาร:
1. **ข้อมูลควบคุมเอกสาร (Document Control):** รหัสเอกสาร `PDC-PM4-ENG205-V1.0` อ้างอิงมาตรฐาน ISO/IEC 29110 (Basic Profile)
2. **ผังกระบวนการปิดโครงการ (PM Closeout Workflow):** ลำดับขั้นตอนการตรวจสอบ การส่งมอบ การอนุมัติ และการจัดเก็บ Baseline
3. **ตารางตรวจสอบรายการส่งมอบ 6 หมวด รวม 22 รายการ:**
   - หมวดที่ 1: ชิ้นงานการบริหารจัดการโครงการ (Project Management - T1.1, T1.2, T1.5)
   - หมวดที่ 2: ชิ้นงานด้านข้อกำหนดและการออกแบบ (Requirements & Design - T1.3, T1.4, Architecture)
   - หมวดที่ 3: ซอฟต์แวร์ต้นฉบับและระบบทำงาน (Software Configuration - FeatureUser, FeatureAdmin, FeatureBackend)
   - หมวดที่ 4: การประกันคุณภาพและการทดสอบ (Quality Assurance - Test Plan, Bug Report 13 รายการ, Bug Fix Report)
   - หมวดที่ 5: เอกสารคู่มือและการถ่ายทอดความรู้ (User Manual, Admin Manual, Deployment Guide, API Spec)
   - หมวดที่ 6: ความพร้อมด้านสภาพแวดล้อมและการปรับใช้ (Node 24 LTS, Docker Compose, Security, Git Baseline)
4. **สรุปผลการประเมิน:** ผ่านครบถ้วน 100% (22/22 รายการ), ข้อบกพร่องวิกฤติคงค้างเป็นศูนย์ (Zero Critical Defects)
5. **ใบตรวจรับและลงนามปิดโครงการ (Project Acceptance Record & Sign-off):** ช่องลงนามครบถ้วน 4 ฝ่าย (PM, Lead Dev, QA Lead, Product Owner / อาจารย์ที่ปรึกษา)
6. **แผนการหลังการส่งมอบและการจัดเก็บเอกสาร (Post-Delivery & Archival Plan)**

---

## 👥 ข้อมูลทีมงานและผู้เกี่ยวข้อง

| บทบาท | ชื่อ-นามสกุล / รหัส | หน้าที่หลัก |
|---|---|---|
| **Project Manager (PM)** | **Aungkanr.S** | ตรวจสอบรายการส่งมอบและประสานงานปิดโครงการ (PM.4) |
| **Lead Developer** | **Natthawut Juntaya (Njuntaya)** | พัฒนาและส่งมอบระบบ Full-stack (React + Node.js) |
| **QA / Tester Lead** | **Kittitat Khantham (Kit.k)** | วางแผนและทดสอบระบบ (QA Test Plan & Bug Fix Verification) |
| **Product Owner / อาจารย์ที่ปรึกษา** | **ดร. สัญญา เครือหงษ์ (Sunya.U)** | ตรวจรับผลงานและอนุมัติปิดโครงการ |
